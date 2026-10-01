import {
  Context,
  Effect,
  Layer,
  Option,
  PubSub,
  Ref,
  Schema,
  Stream,
} from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import { BridgeConfig } from "../config/Config.js";
import { connect, type HomeAssistantSession } from "./Connection.js";
import {
  DeviceRegistry,
  displayName,
  EntityRegistryDisplay,
  entityNamerFrom,
  type EntityNamer,
} from "./naming.js";
import {
  EntityState,
  friendlyName,
  HomeAssistantConfig,
  HomeAssistantError,
  type Action,
  type CameraSnapshot,
  type EntityUpdate,
} from "@timmo001/effect-ha-bridge";

export interface HomeAssistantService {
  readonly getEntity: (entityId: string) => Effect.Effect<EntityUpdate | null>;
  // Emits the current state (when known), then every change.
  readonly watchEntity: (entityId: string) => Stream.Stream<EntityUpdate>;
  readonly callAction: (
    action: Action,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError>;
  readonly getConfig: Effect.Effect<HomeAssistantConfig, HomeAssistantError>;
  readonly cameraSnapshot: (
    entityId: string,
  ) => Effect.Effect<CameraSnapshot, HomeAssistantError>;
}

const reconnectDelay = "5 seconds";

const decodeStates = Schema.decodeUnknownEffect(Schema.Array(EntityState));

const decodeDisplay = Schema.decodeUnknownEffect(EntityRegistryDisplay);

const decodeDevices = Schema.decodeUnknownEffect(DeviceRegistry);

const decodeConfig = Schema.decodeUnknownEffect(HomeAssistantConfig);

const decodeActionResult = Schema.decodeUnknownEffect(
  Schema.Struct({ response: Schema.optionalKey(Schema.Json) }),
);

const failWith = (context: string) => (error: { readonly message: string }) =>
  new HomeAssistantError({ message: `${context}: ${error.message}` });

export class HomeAssistant extends Context.Service<
  HomeAssistant,
  HomeAssistantService
>()("HomeAssistant") {
  static readonly layer = Layer.effect(
    HomeAssistant,
    Effect.gen(function* () {
      const config = yield* (yield* BridgeConfig).load;
      // Hot cache of every entity, written on each state_changed event.
      const states = new Map<string, EntityState>();
      const namer = yield* Ref.make<EntityNamer | undefined>(undefined);
      const session = yield* Ref.make(Option.none<HomeAssistantSession>());
      const changes = yield* PubSub.sliding<EntityState>(4096);

      const withName = (state: EntityState) =>
        Effect.map(Ref.get(namer), (current) => ({
          state,
          name: displayName(current, state.entity_id, friendlyName(state)),
        }));

      const store = (state: EntityState) =>
        Effect.sync(() => states.set(state.entity_id, state)).pipe(
          Effect.andThen(PubSub.publish(changes, state)),
        );

      const refreshNamer = Effect.fn("HomeAssistant.refreshNamer")(function* (
        current: HomeAssistantSession,
      ) {
        const display = yield* current
          .request({ type: "config/entity_registry/list_for_display" })
          .pipe(Effect.flatMap(decodeDisplay));

        const devices = yield* current
          .request({ type: "config/device_registry/list" })
          .pipe(Effect.flatMap(decodeDevices));

        yield* Ref.set(namer, entityNamerFrom(display, devices));
        yield* Effect.logInfo(
          "Cached entity naming",
          `${display.entities.length} entities`,
        );
      });

      const runSession = Effect.gen(function* () {
        const current = yield* connect({ ...config, onState: store });
        // Subscribe before the snapshot so no change falls between them.
        yield* current.request({
          type: "subscribe_events",
          event_type: "state_changed",
        });

        const snapshot = yield* current.request({ type: "get_states" }).pipe(
          Effect.flatMap(decodeStates),
          Effect.mapError(
            (error) =>
              new HomeAssistantError({
                message: `get states: ${error.message}`,
              }),
          ),
        );

        yield* Effect.sync(() => {
          states.clear();

          for (const state of snapshot) {
            states.set(state.entity_id, state);
          }
        });
        yield* PubSub.publishAll(changes, snapshot);
        // Naming is best-effort; friendly names are the fallback.
        yield* refreshNamer(current).pipe(
          Effect.catch((error) =>
            Effect.logWarning(
              "Could not fetch registries for naming",
              error.message,
            ),
          ),
        );
        yield* Ref.set(session, Option.some(current));
        yield* Effect.logInfo("Bridge subscribed to Home Assistant");

        return yield* current.closed;
      }).pipe(Effect.ensuring(Ref.set(session, Option.none())), Effect.scoped);

      yield* runSession.pipe(
        Effect.catch((error) =>
          Effect.logError("Home Assistant connection lost", error.message),
        ),
        Effect.andThen(Effect.sleep(reconnectDelay)),
        Effect.forever,
        Effect.forkScoped,
      );

      const getEntity = (entityId: string) =>
        Effect.suspend(() => {
          const state = states.get(entityId);

          return state === undefined ? Effect.succeed(null) : withName(state);
        });

      const watchEntity = (entityId: string) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const subscription = yield* PubSub.subscribe(changes);
            const current = states.get(entityId);

            return Stream.concat(
              Stream.fromIterable(current === undefined ? [] : [current]),
              Stream.fromSubscription(subscription).pipe(
                Stream.filter((state) => state.entity_id === entityId),
              ),
            ).pipe(Stream.mapEffect(withName));
          }),
        );

      const connected = Ref.get(session).pipe(
        Effect.flatMap(Effect.fromOption),
        Effect.mapError(
          () =>
            new HomeAssistantError({
              message: "the bridge is not connected to Home Assistant",
            }),
        ),
      );

      const callAction = Effect.fn("HomeAssistant.callAction")(function* (
        action: Action,
      ) {
        const current = yield* connected;
        const separator = action.action.indexOf(".");

        const result = yield* current.request({
          type: "call_service",
          domain: action.action.slice(0, separator),
          service: action.action.slice(separator + 1),
          service_data: action.data,
          target: action.target,
          return_response: action.return_response,
        });

        const { response } = yield* decodeActionResult(result).pipe(
          Effect.mapError(failWith("decode action result")),
        );

        return response ?? null;
      });

      const getConfig = connected.pipe(
        Effect.flatMap((current) => current.request({ type: "get_config" })),
        Effect.flatMap((result) =>
          decodeConfig(result).pipe(
            Effect.mapError(failWith("decode Home Assistant config")),
          ),
        ),
      );

      const http = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest(HttpClientRequest.bearerToken(config.token)),
        HttpClient.filterStatusOk,
      );

      const cameraSnapshot = Effect.fn("HomeAssistant.cameraSnapshot")(
        function* (entityId: string) {
          const response = yield* http.get(
            `${config.url.replace(/\/$/, "")}/api/camera_proxy/${encodeURIComponent(entityId)}`,
          );

          const data = yield* response.arrayBuffer;

          return {
            contentType:
              response.headers["content-type"] ?? "application/octet-stream",
            data: new Uint8Array(data),
          };
        },
        Effect.mapError(failWith("camera snapshot")),
      );

      return HomeAssistant.of({
        getEntity,
        watchEntity,
        callAction,
        getConfig,
        cameraSnapshot,
      });
    }),
  );
}
