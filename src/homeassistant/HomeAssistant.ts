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
  AreaRegistry,
  cameraSnapshot,
  connect,
  DeviceRegistry,
  displayName,
  EntityRegistryDisplay,
  EntityState,
  entityNamerFrom,
  FloorRegistry,
  friendlyName,
  HomeAssistantError,
  type Action,
  type CameraSnapshot,
  type EntityId,
  type HomeAssistantConfig,
  type HomeAssistantSession,
} from "@timmo001/effect-ha";
import type {
  EntityUpdate,
  SearchQueryEmpty,
  SearchRequest,
  SearchResults,
} from "@timmo001/effect-ha-bridge";
import { Search, selectResults } from "../search/Search.js";
import {
  emptyRegistries,
  matchesFilters,
  searchItems,
  searchKeys,
  toSearchMatch,
  unavailableRegistries,
  type Registries,
} from "../search/items.js";

const searchKinds = ["entity", "device", "area"] as const;

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
  // Searches the cached states and registries; never asks Home Assistant.
  readonly search: (
    request: SearchRequest,
  ) => Effect.Effect<SearchResults, SearchQueryEmpty>;
}

const reconnectDelay = "5 seconds";

// All are allowed for non-admin tokens. The frontend waits the same 500 ms.
const registryEvents = [
  "entity_registry_updated",
  "device_registry_updated",
  "area_registry_updated",
  "floor_registry_updated",
];

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

const decodeAreas = Schema.decodeUnknownEffect(AreaRegistry);

const decodeFloors = Schema.decodeUnknownEffect(FloorRegistry);

export class HomeAssistant extends Context.Service<
  HomeAssistant,
  HomeAssistantService
>()("HomeAssistant") {
  static readonly layer = Layer.effect(
    HomeAssistant,
    Effect.gen(function* () {
      const config = yield* (yield* BridgeConfig).load;
      const search = yield* Search;
      // Hot cache of every entity, written on each state_changed event.
      const states = new Map<string, EntityState>();
      const registries = yield* Ref.make<Registries>(emptyRegistries);
      const session = yield* Ref.make(Option.none<HomeAssistantSession>());
      const changes = yield* PubSub.sliding<CacheEvent>(4096);

      const nameWith = (current: Registries, state: EntityState) =>
        displayName(current.namer, state.entity_id, friendlyName(state));

      const withName = (state: EntityState) =>
        Effect.map(Ref.get(registries), (current) => ({
          state,
          name: nameWith(current, state),
        }));

      const store = (state: EntityState) =>
        Effect.sync(() => states.set(state.entity_id, state)).pipe(
          Effect.andThen(PubSub.publish(changes, stateEvent({ state }))),
        );

      const remove = (entityId: string) =>
        Effect.sync(() => {
          states.delete(entityId);
        });

      // Each registry is best-effort and keeps its last value when it can't
      // be fetched; friendly names are the naming fallback.
      const load = <A, E extends { readonly message: string }>(
        name: string,
        fetch: Effect.Effect<A, E>,
        fallback: A | undefined,
      ) =>
        fetch.pipe(
          Effect.map((value): A | undefined => value),
          Effect.catch((error) =>
            Effect.logWarning(
              `Could not fetch the ${name}`,
              error.message,
            ).pipe(Effect.as(fallback)),
          ),
        );

      const refreshRegistries = Effect.fn("HomeAssistant.refreshRegistries")(
        function* (current: HomeAssistantSession) {
          const previous = yield* Ref.get(registries);

          const [entities, devices, areas, floors] = yield* Effect.all(
            [
              load(
                "entity registry",
                current
                  .request({ type: "config/entity_registry/list_for_display" })
                  .pipe(Effect.flatMap(decodeDisplay)),
                previous.entities,
              ),
              load(
                "device registry",
                current
                  .request({ type: "config/device_registry/list" })
                  .pipe(Effect.flatMap(decodeDevices)),
                previous.devices,
              ),
              load(
                "area registry",
                current
                  .request({ type: "config/area_registry/list" })
                  .pipe(Effect.flatMap(decodeAreas)),
                previous.areas,
              ),
              load(
                "floor registry",
                current
                  .request({ type: "config/floor_registry/list" })
                  .pipe(Effect.flatMap(decodeFloors)),
                previous.floors,
              ),
            ],
            { concurrency: "unbounded" },
          );

          const next: Registries = {
            entities,
            devices,
            areas,
            floors,
            namer:
              entities !== undefined && devices !== undefined
                ? entityNamerFrom(entities, devices)
                : undefined,
          };

          yield* Ref.set(registries, next);
          yield* Effect.logInfo(
            "Cached registries",
            `${entities?.entities.length ?? 0} entities, ${devices?.length ?? 0} devices, ${areas?.length ?? 0} areas`,
          );

          return { previous, next };
        },
      );

      // Re-sends only the states whose display name changed, so watchers
      // print the new name.
      const refreshNames = Effect.fn("HomeAssistant.refreshNames")(function* (
        current: HomeAssistantSession,
      ) {
        const { previous, next } = yield* refreshRegistries(current);

        yield* PubSub.publishAll(
          changes,
          Array.from(states.values())
            .filter(
              (state) => nameWith(previous, state) !== nameWith(next, state),
            )
            .map((state) => stateEvent({ state })),
        );
      });

      const runSession = Effect.gen(function* () {
        const registryChanges = yield* Queue.sliding<void>(1);

        const current = yield* connect({
          ...config,
          onState: store,
          onRemove: remove,
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
            current
              .request({ type: "subscribe_events", event_type })
              .pipe(
                Effect.catch((error) =>
                  Effect.logWarning(
                    `Could not subscribe to ${event_type}`,
                    error.message,
                  ),
                ),
              ),
          { discard: true },
        );
        // Runs before the snapshot so the first states already use registry
        // names.
        yield* refreshRegistries(current);

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

      const runSearch = Effect.fn("HomeAssistant.search")(function* (
        request: SearchRequest,
      ) {
        const current = yield* Ref.get(registries);

        const items = searchItems(states.values(), current).filter(
          matchesFilters(request),
        );

        const perKind = yield* Effect.forEach(searchKinds, (kind) =>
          search.fuzzy({
            items: items.filter((item) => item.kind === kind),
            query: request.query,
            keys: searchKeys[kind],
            primary: (item) => item.name,
            overrides: { limit: Number.POSITIVE_INFINITY },
          }),
        );

        const { results, total } = selectResults(
          perKind.flatMap(({ results }) => results),
          (item) => item.name,
          { limit: request.limit, offset: request.offset },
        );

        return {
          results: results.map(({ item, score, matched }) =>
            toSearchMatch(item, score, matched),
          ),
          total,
          unavailable: unavailableRegistries(current),
        } satisfies SearchResults;
      });

      return HomeAssistant.of({
        getEntity,
        watchEntity,
        callAction,
        getConfig,
        cameraSnapshot: snapshot,
        search: runSearch,
      });
    }),
  ).pipe(Layer.provide(Search.layer));
}
