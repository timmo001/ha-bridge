import { Context, Effect, Layer, Schema } from "effect";
import { HttpClient } from "effect/http";
import {
  type EntityState,
  HomeAssistantError,
  numberAttribute,
  refreshSupervisorUpdates,
  stringAttribute,
  type SupervisorOptions,
  updateFeatures,
} from "@timmo001/effect-ha";
import {
  type CheckUpdatesRequest,
  type EntityUpdate,
  TargetError,
  type UpdateDetails,
  type UpdateRequest,
  type UpdatesCheck,
  type UpdatesRequest,
  type UpdateStatus,
} from "@timmo001/effect-ha-bridge";
import { BridgeConfig } from "../config/Config.js";
import { HomeAssistant } from "./HomeAssistant.js";
import { exactlyOne } from "./target.js";

type UpdateFailure = HomeAssistantError | TargetError;

export interface UpdatesService {
  readonly list: (
    request: UpdatesRequest,
  ) => Effect.Effect<ReadonlyArray<UpdateStatus>, UpdateFailure>;
  readonly get: (
    request: UpdateRequest,
  ) => Effect.Effect<UpdateDetails, UpdateFailure>;
  readonly check: (
    request: CheckUpdatesRequest,
  ) => Effect.Effect<UpdatesCheck, UpdateFailure>;
}

// Core passes the Supervisor 10 seconds by default, and reloading the app
// store pulls every repository.
const supervisorTimeout = 120;

const decodeRegistryEntry = Schema.decodeUnknownEffect(
  Schema.Struct({ platform: Schema.String }),
);

const decodeReleaseNotes = Schema.decodeUnknownEffect(
  Schema.NullOr(Schema.String),
);

const decodeComponents = Schema.decodeUnknownEffect(
  Schema.Struct({ components: Schema.Array(Schema.String) }),
);

const decodeFailure =
  (label: string) => (error: { readonly message: string }) =>
    new HomeAssistantError({ message: `decode ${label}: ${error.message}` });

const nullable = <A>(value: A | undefined) => value ?? null;

const booleanAttribute = (state: EntityState, name: string) =>
  state.attributes?.[name] === true;

const toStatus = ({ state, name }: EntityUpdate): UpdateStatus => ({
  entity_id: state.entity_id,
  name,
  title: nullable(stringAttribute(state, "title")),
  state: state.state,
  installed_version: nullable(stringAttribute(state, "installed_version")),
  latest_version: nullable(stringAttribute(state, "latest_version")),
  skipped_version: nullable(stringAttribute(state, "skipped_version")),
  in_progress: booleanAttribute(state, "in_progress"),
  update_percentage: nullable(numberAttribute(state, "update_percentage")),
  auto_update: booleanAttribute(state, "auto_update"),
  release_summary: nullable(stringAttribute(state, "release_summary")),
  release_url: nullable(stringAttribute(state, "release_url")),
  features: updateFeatures(numberAttribute(state, "supported_features") ?? 0),
});

// Update entities as Settings > Updates shows them: every integration's,
// not only the Supervisor's, with release notes and a check for new
// versions.
export class Updates extends Context.Service<Updates, UpdatesService>()(
  "Updates",
) {
  static readonly layer = Layer.effect(
    Updates,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;
      const config = yield* (yield* BridgeConfig).load;
      const http = yield* HttpClient.HttpClient;

      // Inside a Home Assistant app the Supervisor is asked directly, as it
      // refuses apps through Core's proxy.
      const supervisor: SupervisorOptions = config.supervisor ?? config;

      const entities = (target: UpdatesRequest["target"]) =>
        target === undefined
          ? homeAssistant.domainEntities("update")
          : homeAssistant.getEntities({ target, domain: "update" });

      const list = Effect.fn("Updates.list")(function* (
        request: UpdatesRequest,
      ) {
        const statuses = (yield* entities(request.target))
          .map(toStatus)
          .toSorted((a, b) => a.name.localeCompare(b.name));

        return request.available === true
          ? statuses.filter((status) => status.state === "on")
          : statuses;
      });

      const integration = Effect.fn("Updates.integration")(function* (
        entityId: string,
      ) {
        const current = yield* homeAssistant.session;

        return yield* current
          .request({ type: "config/entity_registry/get", entity_id: entityId })
          .pipe(
            Effect.flatMap((result) =>
              decodeRegistryEntry(result).pipe(
                Effect.mapError(decodeFailure("entity registry entry")),
              ),
            ),
            Effect.map(({ platform }) => platform),
            Effect.catchIf(
              (error) => error.message === "Entity not found",
              () => Effect.succeed(null),
            ),
          );
      });

      const releaseNotes = Effect.fn("Updates.releaseNotes")(function* (
        status: UpdateStatus,
      ) {
        if (!status.features.includes("release_notes")) {
          return null;
        }

        const current = yield* homeAssistant.session;

        // Notes are optional. Home Assistant refuses them without an admin
        // token and when the entity is unavailable or not loaded; either must
        // leave the rest of the update readable. Notes it does send must still
        // decode.
        return yield* current
          .request({
            type: "update/release_notes",
            entity_id: status.entity_id,
          })
          .pipe(
            Effect.catchTag("HomeAssistantError", (error) =>
              Effect.logDebug(
                `No release notes for ${status.entity_id}`,
                error.message,
              ).pipe(Effect.as(null)),
            ),
            Effect.flatMap((result) =>
              decodeReleaseNotes(result).pipe(
                Effect.mapError(decodeFailure("release notes")),
              ),
            ),
          );
      });

      const get = Effect.fn("Updates.get")(function* (request: UpdateRequest) {
        const update = yield* exactlyOne(
          yield* homeAssistant.getEntities({
            target: request.target,
            domain: "update",
          }),
          ({ state }) => state.entity_id,
          "update entity",
        );

        const status = toStatus(update);

        const [platform, notes] = yield* Effect.all(
          [integration(status.entity_id), releaseNotes(status)],
          { concurrency: "unbounded" },
        );

        return {
          ...status,
          integration: platform,
          release_notes: notes,
        } satisfies UpdateDetails;
      });

      const hasSupervisor = Effect.gen(function* () {
        const current = yield* homeAssistant.session;
        const result = yield* current.request({ type: "get_config" });

        const { components } = yield* decodeComponents(result).pipe(
          Effect.mapError(decodeFailure("Home Assistant config")),
        );

        return components.includes("hassio");
      });

      // Core's proxy refuses `supervisor/api` from an app, which asks the
      // Supervisor itself.
      const refreshSupervisor =
        supervisor.direct === true
          ? refreshSupervisorUpdates(supervisor).pipe(
              Effect.provideService(HttpClient.HttpClient, http),
            )
          : Effect.flatMap(homeAssistant.session, (current) =>
              current.request({
                type: "supervisor/api",
                endpoint: "/refresh_updates",
                method: "post",
                timeout: supervisorTimeout,
              }),
            );

      const checkSupervisor = Effect.gen(function* () {
        if (!(yield* hasSupervisor)) {
          return "no-supervisor" as const;
        }

        if (!(yield* homeAssistant.currentUser).is_admin) {
          return "not-admin" as const;
        }

        yield* refreshSupervisor;

        return "checked" as const;
      });

      const check = Effect.fn("Updates.check")(function* (
        request: CheckUpdatesRequest,
      ) {
        const supervisorResult = yield* checkSupervisor;

        // Restored entities belong to integrations that haven't loaded, as
        // Settings > Updates skips them.
        const entityIds = (yield* entities(request.target))
          .filter(({ state }) => state.attributes?.["restored"] !== true)
          .map(({ state }) => state.entity_id);

        if (entityIds.length > 0) {
          yield* homeAssistant.callAction({
            action: "homeassistant.update_entity",
            target: { entity_id: entityIds },
          });
        }

        return {
          supervisor: supervisorResult,
          entities: entityIds,
        } satisfies UpdatesCheck;
      });

      return Updates.of({ list, get, check });
    }),
  );
}
