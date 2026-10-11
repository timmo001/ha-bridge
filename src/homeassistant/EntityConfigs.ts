import {
  Clock,
  Context,
  Effect,
  Layer,
  Option,
  Predicate,
  Schema,
} from "effect";
import { HttpClient } from "effect/http";
import {
  type ConfigDomain,
  ConfigItem,
  deleteEditorConfig,
  editorConfig,
  HomeAssistantError,
  saveEditorConfig,
} from "@timmo001/effect-ha";
import {
  ConfigUnavailable,
  type CreateEntityConfigRequest,
  type EntityConfig,
  type EntityConfigRequest,
  type SavedEntityConfig,
  type UpdateEntityConfigRequest,
} from "@timmo001/effect-ha-bridge";
import { BridgeConfig } from "../config/Config.js";
import { HomeAssistant } from "./HomeAssistant.js";
import { configSlug } from "./entityConfig.js";

type ConfigFailure = HomeAssistantError | ConfigUnavailable;

export interface EntityConfigsService {
  readonly get: (
    request: EntityConfigRequest,
  ) => Effect.Effect<EntityConfig, ConfigFailure>;
  readonly create: (
    request: CreateEntityConfigRequest,
  ) => Effect.Effect<SavedEntityConfig, ConfigFailure>;
  readonly update: (
    request: UpdateEntityConfigRequest,
  ) => Effect.Effect<SavedEntityConfig, ConfigFailure>;
  readonly remove: (
    request: EntityConfigRequest,
  ) => Effect.Effect<SavedEntityConfig, ConfigFailure>;
}

const decodeLoadedConfig = Schema.decodeUnknownEffect(
  Schema.Struct({ config: ConfigItem }),
);

const decodeRegistryEntry = Schema.decodeUnknownEffect(
  Schema.Struct({ unique_id: Schema.String }),
);

const decodeFailure =
  (label: string) => (error: { readonly message: string }) =>
    new HomeAssistantError({ message: `decode ${label}: ${error.message}` });

const notFound = "Entity not found";

// Reads and writes automations and scripts as Home Assistant's editor does:
// any one's loaded config over the WebSocket, and automations.yaml and
// scripts.yaml through the config REST API.
export class EntityConfigs extends Context.Service<
  EntityConfigs,
  EntityConfigsService
>()("EntityConfigs") {
  static readonly layer = Layer.effect(
    EntityConfigs,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;
      const config = yield* (yield* BridgeConfig).load;
      const http = yield* HttpClient.HttpClient;

      const withHttp = Effect.provideService(HttpClient.HttpClient, http);

      // Home Assistant refuses every config request from anyone else, so
      // check first rather than pass on its refusal.
      const requireAdmin = (what: string) =>
        Effect.gen(function* () {
          const user = yield* homeAssistant.currentUser;

          if (!user.is_admin) {
            return yield* new ConfigUnavailable({
              reason: "admin",
              message: `${what} needs an admin user, and the bridge's token belongs to ${user.name ?? user.id}, who isn't one`,
            });
          }
        });

      const requireDomain = (request: EntityConfigRequest) =>
        request.entity_id.startsWith(`${request.domain}.`)
          ? Effect.void
          : Effect.fail(
              new HomeAssistantError({
                message: `${request.entity_id} isn't ${request.domain === "automation" ? "an automation" : "a script"}`,
              }),
            );

      // The editor's key is the entity's unique ID. One defined in YAML
      // without an ID has none.
      const uniqueId = Effect.fn("EntityConfigs.uniqueId")(function* (
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
            Effect.map(({ unique_id }) => Option.some(unique_id)),
            Effect.catchIf(
              (error) => error.message === notFound,
              () => Effect.succeed(Option.none<string>()),
            ),
          );
      });

      const isEditable = (domain: ConfigDomain, id: Option.Option<string>) =>
        Option.match(id, {
          onNone: () => Effect.succeed(false),
          onSome: (key) =>
            editorConfig(config, domain, key).pipe(
              withHttp,
              Effect.map(Option.isSome),
            ),
        });

      const get = Effect.fn("EntityConfigs.get")(function* (
        request: EntityConfigRequest,
      ) {
        yield* requireAdmin(`Reading ${request.entity_id}'s config`);
        yield* requireDomain(request);

        const current = yield* homeAssistant.session;

        const { config: loaded } = yield* current
          .request({
            type: `${request.domain}/config`,
            entity_id: request.entity_id,
          })
          .pipe(
            Effect.flatMap((result) =>
              decodeLoadedConfig(result).pipe(
                Effect.mapError(decodeFailure(`${request.domain} config`)),
              ),
            ),
          );

        const id = yield* uniqueId(request.entity_id);

        return {
          domain: request.domain,
          entity_id: request.entity_id,
          id: Option.getOrNull(id),
          editable: yield* isEditable(request.domain, id),
          config: loaded,
        };
      });

      // The key of an automation or script the editor can change.
      const editableId = Effect.fn("EntityConfigs.editableId")(function* (
        request: EntityConfigRequest,
        what: string,
      ) {
        yield* requireAdmin(what);
        yield* requireDomain(request);

        const id = yield* uniqueId(request.entity_id);
        const key = Option.getOrUndefined(id);

        if (key === undefined || !(yield* isEditable(request.domain, id))) {
          return yield* new ConfigUnavailable({
            reason: "not_editable",
            message: `${request.entity_id} isn't in ${request.domain}s.yaml, so it can only be changed where it's defined`,
          });
        }

        return key;
      });

      const create = Effect.fn("EntityConfigs.create")(function* (
        request: CreateEntityConfigRequest,
      ) {
        yield* requireAdmin(
          `Creating ${request.domain === "automation" ? "an automation" : "a script"}`,
        );

        const alias = request.config.alias;

        // The frontend keys new automations by the time they were made.
        const id =
          request.id ??
          (request.domain === "automation"
            ? String(yield* Clock.currentTimeMillis)
            : Predicate.isString(alias)
              ? configSlug(alias)
              : "");

        if (id === "") {
          return yield* new HomeAssistantError({
            message: "a new script needs an ID, or an alias to make one from",
          });
        }

        const existing = yield* editorConfig(config, request.domain, id).pipe(
          withHttp,
        );

        if (Option.isSome(existing)) {
          return yield* new HomeAssistantError({
            message: `${request.domain}s.yaml already has ${id}; update it instead`,
          });
        }

        yield* saveEditorConfig(
          config,
          request.domain,
          id,
          request.config,
        ).pipe(withHttp);

        return { domain: request.domain, id };
      });

      const update = Effect.fn("EntityConfigs.update")(function* (
        request: UpdateEntityConfigRequest,
      ) {
        const id = yield* editableId(
          request,
          `Changing ${request.entity_id}'s config`,
        );

        yield* saveEditorConfig(
          config,
          request.domain,
          id,
          request.config,
        ).pipe(withHttp);

        return { domain: request.domain, id };
      });

      const remove = Effect.fn("EntityConfigs.remove")(function* (
        request: EntityConfigRequest,
      ) {
        const id = yield* editableId(request, `Deleting ${request.entity_id}`);

        yield* deleteEditorConfig(config, request.domain, id).pipe(withHttp);

        return { domain: request.domain, id };
      });

      return EntityConfigs.of({ get, create, update, remove });
    }),
  );
}
