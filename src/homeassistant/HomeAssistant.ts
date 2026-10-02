import {
  Context,
  Data,
  Effect,
  Layer,
  Match,
  Option,
  PubSub,
  Queue,
  Ref,
  Schema,
  Stream,
} from "effect";
import { HttpClient } from "effect/http";
import { BridgeConfig } from "../config/Config.js";
import {
  cameraSnapshot,
  connect,
  DeviceRegistry,
  displayName,
  EntityRegistryDisplay,
  EntityState,
  entityNamerFrom,
  friendlyName,
  HomeAssistantError,
  type Action,
  type CameraSnapshot,
  type EntityId,
  type EntityNamer,
  type HomeAssistantConfig,
  type HomeAssistantSession,
} from "@timmo001/effect-ha";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";

export interface HomeAssistantService {
  readonly getEntity: (entityId: string) => Effect.Effect<EntityUpdate | null>;
  // Emits the current state (when known), then every change.
  readonly watchEntity: (entityId: string) => Stream.Stream<EntityUpdate>;
  readonly callAction: (
    action: Action,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError>;
  readonly getConfig: Effect.Effect<HomeAssistantConfig, HomeAssistantError>;
  readonly cameraSnapshot: (
    entityId: EntityId<"camera">,
  ) => Effect.Effect<CameraSnapshot, HomeAssistantError>;
}

const reconnectDelay = "5 seconds";

// Both are allowed for non-admin tokens. The frontend waits the same 500 ms.
const registryEvents = ["entity_registry_updated", "device_registry_updated"];

const registryRefreshDelay = "500 millis";

// `State` is one entity change. `Reset` means the cache was replaced from a
// `get_states` snapshot; watchers re-read it instead of receiving every entity.
// Publishing the whole snapshot would drop entities once a subscriber's buffer
// (4096) is full, so a watched entity could stay stale after a reconnect.
type CacheEvent = Data.TaggedEnum<{
  State: { readonly state: EntityState };
  Reset: {};
}>;

const { State: stateEvent, Reset: cacheReset } = Data.taggedEnum<CacheEvent>();

const decodeStates = Schema.decodeUnknownEffect(Schema.Array(EntityState));

const decodeDisplay = Schema.decodeUnknownEffect(EntityRegistryDisplay);

const decodeDevices = Schema.decodeUnknownEffect(DeviceRegistry);

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
      const changes = yield* PubSub.sliding<CacheEvent>(4096);

      const nameWith = (names: EntityNamer | undefined, state: EntityState) =>
        displayName(names, state.entity_id, friendlyName(state));

      const withName = (state: EntityState) =>
        Effect.map(Ref.get(namer), (current) => ({
          state,
          name: nameWith(current, state),
        }));

      const store = (state: EntityState) =>
        Effect.sync(() => states.set(state.entity_id, state)).pipe(
          Effect.andThen(PubSub.publish(changes, stateEvent({ state }))),
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

      // Re-sends only the states whose display name changed, so watchers
      // print the new name.
      const refreshNames = Effect.fn("HomeAssistant.refreshNames")(
        function* (current: HomeAssistantSession) {
          const previous = yield* Ref.get(namer);
          yield* refreshNamer(current);
          const next = yield* Ref.get(namer);

          yield* PubSub.publishAll(
            changes,
            Array.from(states.values())
              .filter(
                (state) => nameWith(previous, state) !== nameWith(next, state),
              )
              .map((state) => stateEvent({ state })),
          );
        },
        Effect.catch((error) =>
          Effect.logWarning("Could not refresh entity names", error.message),
        ),
      );

      const runSession = Effect.gen(function* () {
        const registryChanges = yield* Queue.sliding<void>(1);

        const current = yield* connect({
          ...config,
          onState: store,
          // Only mark the change; the reader must keep up with Home Assistant.
          onEvent: (eventType) =>
            registryEvents.includes(eventType)
              ? Effect.asVoid(Queue.offer(registryChanges, undefined))
              : Effect.void,
        });

        // Subscribe before the snapshot so no change falls between them.
        yield* current.request({
          type: "subscribe_events",
          event_type: "state_changed",
        });
        yield* Effect.forEach(
          registryEvents,
          (event_type) =>
            current.request({ type: "subscribe_events", event_type }),
          { discard: true },
        ).pipe(
          Effect.catch((error) =>
            Effect.logWarning(
              "Could not subscribe to registry changes",
              error.message,
            ),
          ),
        );
        // Naming is best-effort; friendly names are the fallback. It runs
        // before the snapshot so the first states already use registry names.
        yield* refreshNamer(current).pipe(
          Effect.catch((error) =>
            Effect.logWarning(
              "Could not fetch registries for naming",
              error.message,
            ),
          ),
        );

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
        yield* PubSub.publish(changes, cacheReset());
        yield* Stream.fromQueue(registryChanges).pipe(
          Stream.debounce(registryRefreshDelay),
          Stream.runForEach(() => refreshNames(current)),
          Effect.forkScoped,
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
                Stream.map((change) =>
                  Match.value(change).pipe(
                    Match.tag("Reset", () => states.get(entityId)),
                    Match.tag("State", ({ state }) =>
                      state.entity_id === entityId ? state : undefined,
                    ),
                    Match.exhaustive,
                  ),
                ),
                Stream.filter((state) => state !== undefined),
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

      const callAction = (action: Action) =>
        Effect.flatMap(connected, (current) => current.callAction(action));

      const getConfig = Effect.flatMap(
        connected,
        (current) => current.getConfig,
      );

      const http = yield* HttpClient.HttpClient;

      const snapshot = (entityId: EntityId<"camera">) =>
        cameraSnapshot(config, entityId).pipe(
          Effect.provideService(HttpClient.HttpClient, http),
        );

      return HomeAssistant.of({
        getEntity,
        watchEntity,
        callAction,
        getConfig,
        cameraSnapshot: snapshot,
      });
    }),
  );
}
