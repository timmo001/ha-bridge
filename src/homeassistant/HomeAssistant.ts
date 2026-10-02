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
  isEntityIdIn,
  LabelRegistry,
  type Action,
  type CameraSnapshot,
  type HomeAssistantConfig,
  type HomeAssistantSession,
  type Target,
} from "@timmo001/effect-ha";
import {
  TargetError,
  type EntityUpdate,
  SearchEmpty,
  type SearchRequest,
  type SearchResults,
  type TargetRequest,
} from "@timmo001/effect-ha-bridge";
import { Search, selectResults } from "../search/Search.js";
import {
  matchesFilters,
  searchItems,
  searchKeys,
  type TargetMembers,
  toSearchMatch,
} from "../search/items.js";
import {
  emptyRegistries,
  unavailableRegistries,
  type Registries,
} from "./registries.js";
import { exactlyOne, resolveTarget } from "./target.js";

const searchKinds = ["entity", "device", "area"] as const;

export interface HomeAssistantService {
  readonly getEntities: (
    request: TargetRequest,
  ) => Effect.Effect<
    ReadonlyArray<EntityUpdate>,
    HomeAssistantError | TargetError
  >;
  // Emits the current state of every matching entity, then every change.
  // Waits for a connection, and expands the target again after reconnects
  // and registry changes.
  readonly watchEntities: (
    request: TargetRequest,
  ) => Stream.Stream<EntityUpdate, TargetError>;
  readonly callAction: (
    action: Action,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError | TargetError>;
  readonly getConfig: Effect.Effect<HomeAssistantConfig, HomeAssistantError>;
  readonly cameraSnapshot: (
    target: Target,
  ) => Effect.Effect<CameraSnapshot, HomeAssistantError | TargetError>;
  // Searches the cached states and registries. Only a target asks Home
  // Assistant, to expand it.
  readonly search: (
    request: SearchRequest,
  ) => Effect.Effect<
    SearchResults,
    SearchEmpty | HomeAssistantError | TargetError
  >;
}

const reconnectDelay = "5 seconds";

// All are allowed for non-admin tokens. The frontend waits the same 500 ms.
const registryEvents = [
  "entity_registry_updated",
  "device_registry_updated",
  "area_registry_updated",
  "floor_registry_updated",
  "label_registry_updated",
];

const registryRefreshDelay = "500 millis";

// `State` is one entity change. `Reset` means the cache was replaced from a
// `get_states` snapshot; watchers re-read it instead of receiving every entity.
// Publishing the whole snapshot would drop entities once a subscriber's buffer
// (4096) is full, so a watched entity could stay stale after a reconnect.
// `Registries` means the registries changed, so a target may now match other
// entities.
type CacheEvent = Data.TaggedEnum<{
  State: { readonly state: EntityState };
  Reset: {};
  Registries: {};
}>;

const {
  State: stateEvent,
  Reset: cacheReset,
  Registries: registriesChanged,
} = Data.taggedEnum<CacheEvent>();

const decodeStates = Schema.decodeUnknownEffect(Schema.Array(EntityState));

const decodeDisplay = Schema.decodeUnknownEffect(EntityRegistryDisplay);

const decodeDevices = Schema.decodeUnknownEffect(DeviceRegistry);

const decodeAreas = Schema.decodeUnknownEffect(AreaRegistry);

const decodeFloors = Schema.decodeUnknownEffect(FloorRegistry);

const decodeLabels = Schema.decodeUnknownEffect(LabelRegistry);

const actionDomain = (action: string) => {
  const domain = action.split(".")[0];

  // `homeassistant` actions apply to entities in any domain.
  return domain === "homeassistant" ? undefined : domain;
};

const inDomain = (domain: string | undefined) => (entityId: string) =>
  domain === undefined || entityId.startsWith(`${domain}.`);

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

          const [entities, devices, areas, floors, labels] = yield* Effect.all(
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
              load(
                "label registry",
                current
                  .request({ type: "config/label_registry/list" })
                  .pipe(Effect.flatMap(decodeLabels)),
                previous.labels,
              ),
            ],
            { concurrency: "unbounded" },
          );

          const next: Registries = {
            entities,
            devices,
            areas,
            floors,
            labels,
            namer:
              entities !== undefined && devices !== undefined
                ? entityNamerFrom(entities, devices)
                : undefined,
          };

          yield* Ref.set(registries, next);
          yield* Effect.logInfo(
            "Cached registries",
            `${entities?.entities.length ?? 0} entities, ${devices?.length ?? 0} devices, ${areas?.length ?? 0} areas, ${labels?.length ?? 0} labels`,
          );

          return { previous, next };
        },
      );

      // Re-sends only the states whose display name changed, so watchers
      // print the new name, then tells watchers to expand their targets again.
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
        yield* PubSub.publish(changes, registriesChanged());
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
        // Set before the reset so watchers can expand their targets.
        yield* Ref.set(session, Option.some(current));
        yield* PubSub.publish(changes, cacheReset());
        yield* Stream.fromQueue(registryChanges).pipe(
          Stream.debounce(registryRefreshDelay),
          Stream.runForEach(() => refreshNames(current)),
          Effect.forkScoped,
        );
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

      const connected = Ref.get(session).pipe(
        Effect.flatMap(Effect.fromOption),
        Effect.mapError(
          () =>
            new HomeAssistantError({
              message: "the bridge is not connected to Home Assistant",
            }),
        ),
      );

      const resolve = (target: Target, domain: string | undefined) =>
        Effect.flatMap(Ref.get(registries), (current) =>
          resolveTarget(target, { registries: current, states, domain }),
        );

      // What the target refers to, as Home Assistant expands it.
      const extract = Effect.fn("HomeAssistant.extract")(function* (
        current: HomeAssistantSession,
        request: TargetRequest,
      ) {
        const target = yield* resolve(request.target, request.domain);
        const extracted = yield* current.extractTarget(target);

        const missing = [
          ...extracted.missing_devices.map((id) => `device ${id}`),
          ...extracted.missing_areas.map((id) => `area ${id}`),
          ...extracted.missing_floors.map((id) => `floor ${id}`),
          ...extracted.missing_labels.map((id) => `label ${id}`),
        ];

        if (missing.length > 0) {
          return yield* new TargetError({
            message: `Home Assistant has no ${missing.join(", ")}`,
          });
        }

        return extracted;
      });

      // The IDs of every entity the target refers to.
      const expandEntities = (
        current: HomeAssistantSession,
        request: TargetRequest,
      ) =>
        Effect.map(extract(current, request), (extracted) =>
          extracted.referenced_entities.filter(inDomain(request.domain)),
        );

      const knownStates = (entityIds: Iterable<string>) =>
        Array.from(entityIds).flatMap((entityId) => {
          const state = states.get(entityId);

          return state === undefined ? [] : [state];
        });

      const getEntities = Effect.fn("HomeAssistant.getEntities")(function* (
        request: TargetRequest,
      ) {
        const entityIds = yield* expandEntities(yield* connected, request);

        return yield* Effect.forEach(knownStates(entityIds), withName);
      });

      const watchEntities = (request: TargetRequest) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const subscription = yield* PubSub.subscribe(changes);
            const watched = yield* Ref.make<ReadonlySet<string>>(new Set());

            // Expands the target again and returns the entities it newly
            // matches. Keeps the last set while Home Assistant is unreachable.
            const expand = Effect.gen(function* () {
              const current = yield* Ref.get(session);

              if (Option.isNone(current)) {
                return [];
              }

              const entityIds = yield* expandEntities(
                current.value,
                request,
              ).pipe(
                Effect.catchTag("HomeAssistantError", (error) =>
                  Effect.logWarning(
                    "Could not expand a watched target",
                    error.message,
                  ).pipe(Effect.as(undefined)),
                ),
              );

              if (entityIds === undefined) {
                return [];
              }

              const previous = yield* Ref.getAndSet(
                watched,
                new Set(entityIds),
              );

              return entityIds.filter((entityId) => !previous.has(entityId));
            });

            const everyWatched = Effect.map(Ref.get(watched), knownStates);

            yield* expand;

            return Stream.concat(
              Stream.fromIterable(yield* everyWatched),
              Stream.fromSubscription(subscription).pipe(
                Stream.mapEffect((change) =>
                  Match.value(change).pipe(
                    Match.tag("Reset", () =>
                      Effect.andThen(expand, everyWatched),
                    ),
                    Match.tag("Registries", () =>
                      Effect.map(expand, knownStates),
                    ),
                    Match.tag("State", ({ state }) =>
                      Effect.map(Ref.get(watched), (current) =>
                        current.has(state.entity_id) ? [state] : [],
                      ),
                    ),
                    Match.exhaustive,
                  ),
                ),
                Stream.flattenIterable,
              ),
            ).pipe(Stream.mapEffect(withName));
          }),
        );

      const callAction = Effect.fn("HomeAssistant.callAction")(function* (
        action: Action,
      ) {
        const current = yield* connected;

        if (action.target === undefined) {
          return yield* current.callAction(action);
        }

        const target = yield* resolve(
          action.target,
          actionDomain(action.action),
        );

        return yield* current.callAction({ ...action, target });
      });

      const getConfig = Effect.flatMap(
        connected,
        (current) => current.getConfig,
      );

      const http = yield* HttpClient.HttpClient;

      const snapshot = Effect.fn("HomeAssistant.cameraSnapshot")(function* (
        target: Target,
      ) {
        const entityIds = yield* expandEntities(yield* connected, {
          target,
          domain: "camera",
        });

        const entityId = yield* exactlyOne(
          entityIds.filter(isEntityIdIn("camera")),
          (id) => id,
          "camera",
        );

        return yield* cameraSnapshot(config, entityId).pipe(
          Effect.provideService(HttpClient.HttpClient, http),
        );
      });

      const targetMembers = Effect.fn("HomeAssistant.targetMembers")(function* (
        target: Target,
        domain: string | undefined,
      ) {
        const extracted = yield* extract(yield* connected, { target, domain });

        return {
          entity: new Set(extracted.referenced_entities),
          device: new Set(extracted.referenced_devices),
          area: new Set(extracted.referenced_areas),
        } satisfies TargetMembers;
      });

      const runSearch = Effect.fn("HomeAssistant.search")(function* (
        request: SearchRequest,
      ) {
        const query = request.query?.trim() ?? "";

        if (
          query === "" &&
          request.target === undefined &&
          request.domain === undefined &&
          request.deviceClass === undefined
        ) {
          return yield* new SearchEmpty();
        }

        const members =
          request.target === undefined
            ? undefined
            : yield* targetMembers(request.target, request.domain);

        const current = yield* Ref.get(registries);

        const items = searchItems(states.values(), current).filter(
          matchesFilters(request, members),
        );

        const unavailable = unavailableRegistries(current);
        const offset = request.offset ?? 0;

        // Without a query, list everything by kind, then name.
        if (query === "") {
          const listed = searchKinds.flatMap((kind) =>
            items
              .filter((item) => item.kind === kind)
              .toSorted((a, b) => a.name.localeCompare(b.name)),
          );

          return {
            results: listed
              .slice(offset, offset + (request.limit ?? 20))
              .map((item) => toSearchMatch(item, 100, [])),
            total: listed.length,
            unavailable,
          } satisfies SearchResults;
        }

        const perKind = yield* Effect.forEach(searchKinds, (kind) =>
          search.fuzzy({
            items: items.filter((item) => item.kind === kind),
            query,
            keys: searchKeys[kind],
            primary: (item) => item.name,
            overrides: { limit: Number.POSITIVE_INFINITY },
          }),
        );

        const { results, total } = selectResults(
          perKind.flatMap(({ results }) => results),
          (item) => item.name,
          { limit: request.limit, offset },
        );

        return {
          results: results.map(({ item, score, matched }) =>
            toSearchMatch(item, score, matched),
          ),
          total,
          unavailable,
        } satisfies SearchResults;
      });

      return HomeAssistant.of({
        getEntities,
        watchEntities,
        callAction,
        getConfig,
        cameraSnapshot: snapshot,
        search: runSearch,
      });
    }),
  ).pipe(Layer.provide(Search.layer));
}
