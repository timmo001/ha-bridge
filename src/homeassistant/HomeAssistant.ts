import {
  Context,
  Data,
  Effect,
  Layer,
  Match,
  Option,
  PubSub,
  Ref,
  Schema,
  Stream,
  SubscriptionRef,
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
  StateChangedEvent,
  type Action,
  type CameraSnapshot,
  type HomeAssistantConfig,
  type HomeAssistantSession,
  type Target,
  type TemplateRender,
  type TemplateRequest,
  TemplateUpdate,
  HomeAssistantEvent,
  type FireEventRequest,
  type WatchEventsRequest,
  type History,
  historyFrom,
  type LogbookEntry,
  logbookEventFrom,
  logbookFrom,
  ConditionResult,
  ConditionUpdate,
  TriggerEvent,
  type ConditionRequest,
  type TriggerRequest,
  type WatchConditionRequest,
  type HomeAssistantSubscription,
} from "@timmo001/effect-ha";
import {
  TargetError,
  type EntityUpdate,
  SearchEmpty,
  type SearchRequest,
  type SearchResults,
  type TargetRequest,
  type HistoryRequest,
  type LogbookRequest,
  type WatchLogbookRequest,
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
import {
  acceptLogbookBatch,
  beginLogbookSubscription,
  initialLogbookCursor,
} from "./logbook.js";
import { exactlyOne, resolveTarget, valuesOf } from "./target.js";

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
  // The template's first render. Fails on a render error.
  readonly renderTemplate: (
    request: TemplateRequest,
  ) => Effect.Effect<TemplateRender, HomeAssistantError>;
  // Every render as what the template depends on changes, rendering again
  // after reconnects. Fails when Home Assistant refuses the template.
  readonly watchTemplate: (
    request: TemplateRequest,
  ) => Stream.Stream<TemplateUpdate, HomeAssistantError>;
  // Every event of a type, or of every type, following reconnects. Fails
  // when Home Assistant refuses the subscription.
  readonly watchEvents: (
    request: WatchEventsRequest,
  ) => Stream.Stream<HomeAssistantEvent, HomeAssistantError>;
  readonly fireEvent: (
    request: FireEventRequest,
  ) => Effect.Effect<void, HomeAssistantError>;
  readonly getHistory: (
    request: HistoryRequest,
  ) => Effect.Effect<History, HomeAssistantError | TargetError>;
  readonly getLogbook: (
    request: LogbookRequest,
  ) => Effect.Effect<
    ReadonlyArray<LogbookEntry>,
    HomeAssistantError | TargetError
  >;
  // New logbook entries, carrying on from the moment of each reconnect.
  readonly watchLogbook: (
    request: WatchLogbookRequest,
  ) => Stream.Stream<LogbookEntry, HomeAssistantError | TargetError>;
  // Each time the triggers fire, following reconnects.
  readonly watchTrigger: (
    request: TriggerRequest,
  ) => Stream.Stream<TriggerEvent, HomeAssistantError>;
  readonly testCondition: (
    request: ConditionRequest,
  ) => Effect.Effect<ConditionResult, HomeAssistantError>;
  // Whether the conditions pass, then each change, following reconnects.
  readonly watchCondition: (
    request: WatchConditionRequest,
  ) => Stream.Stream<ConditionUpdate, HomeAssistantError>;
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

const decodeStateChanged = Schema.decodeUnknownEffect(StateChangedEvent);

// Decodes a reply or event, failing as a Home Assistant error.
const decodeWith =
  <A>(
    decode: (value: Schema.Json | null) => Effect.Effect<A, Schema.SchemaError>,
    label: string,
  ) =>
  (value: Schema.Json | null) =>
    decode(value).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode ${label}: ${error.message}`,
          }),
      ),
    );

const decodeTemplateUpdate = decodeWith(
  Schema.decodeUnknownEffect(TemplateUpdate),
  "template render",
);

const decodeEvent = decodeWith(
  Schema.decodeUnknownEffect(HomeAssistantEvent),
  "event",
);

const decodeTriggerEvent = decodeWith(
  Schema.decodeUnknownEffect(TriggerEvent),
  "trigger",
);

const decodeConditionResult = decodeWith(
  Schema.decodeUnknownEffect(ConditionResult),
  "condition result",
);

const decodeConditionUpdate = decodeWith(
  Schema.decodeUnknownEffect(ConditionUpdate),
  "condition",
);

const templateSubscription = (
  request: TemplateRequest,
): HomeAssistantSubscription => ({
  type: "render_template",
  ...request,
  report_errors: true,
});

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

// Entries about an entity in the domain, or every entry without a domain.
const logbookInDomain = (domain: string | undefined) => (entry: LogbookEntry) =>
  inDomain(domain)(entry.entity_id ?? "");

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

      const session = yield* SubscriptionRef.make(
        Option.none<HomeAssistantSession>(),
      );

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

      // Applies one `state_changed` event to the cache.
      const applyStateChange = (event: Schema.Json) =>
        decodeStateChanged(event).pipe(
          Effect.flatMap(({ data }) =>
            data.new_state === null
              ? remove(data.entity_id)
              : store(data.new_state),
          ),
          Effect.catch((error) =>
            Effect.logDebug("Ignoring a state change", error.message),
          ),
        );

      const runSession = Effect.gen(function* () {
        const current = yield* connect(config);

        // Subscribe before the snapshot so no change falls between them.
        yield* (yield* current.subscribe({
          type: "subscribe_events",
          event_type: "state_changed",
        })).pipe(Stream.runForEach(applyStateChange), Effect.forkScoped);

        const registryChanges = yield* Effect.forEach(
          registryEvents,
          (event_type) =>
            current
              .subscribe({ type: "subscribe_events", event_type })
              .pipe(
                Effect.catch((error) =>
                  Effect.logWarning(
                    `Could not subscribe to ${event_type}`,
                    error.message,
                  ).pipe(Effect.as(Stream.empty)),
                ),
              ),
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
        yield* SubscriptionRef.set(session, Option.some(current));
        yield* PubSub.publish(changes, cacheReset());
        yield* Stream.mergeAll(registryChanges, {
          concurrency: "unbounded",
        }).pipe(
          Stream.debounce(registryRefreshDelay),
          Stream.runForEach(() => refreshNames(current)),
          Effect.forkScoped,
        );
        yield* Effect.logInfo("Bridge subscribed to Home Assistant");

        return yield* current.closed;
      }).pipe(
        Effect.ensuring(SubscriptionRef.set(session, Option.none())),
        Effect.scoped,
      );

      yield* runSession.pipe(
        Effect.catch((error) =>
          Effect.logError("Home Assistant connection lost", error.message),
        ),
        Effect.andThen(Effect.sleep(reconnectDelay)),
        Effect.forever,
        Effect.forkScoped,
      );

      const connected = SubscriptionRef.get(session).pipe(
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

      // Fails for an entity ID the target names that has no state, which
      // reads can't show; areas and other targets just skip such entities.
      const getEntities = Effect.fn("HomeAssistant.getEntities")(function* (
        request: TargetRequest,
      ) {
        const current = yield* connected;
        const resolved = yield* resolve(request.target, request.domain);

        const unknown = valuesOf(resolved.entity_id ?? []).filter(
          (entityId) => !states.has(entityId),
        );

        if (unknown.length > 0) {
          return yield* new TargetError({
            message: `Home Assistant has no entity ${unknown.join(", ")}`,
          });
        }

        const entityIds = yield* expandEntities(current, request);

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
              const current = yield* SubscriptionRef.get(session);

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

      // A subscription's events on each session in turn, building it and
      // subscribing again after every reconnect. Fails only when building it
      // fails or Home Assistant refuses it.
      const followSessions = <E>(
        subscriptionFor: (
          current: HomeAssistantSession,
        ) => Effect.Effect<HomeAssistantSubscription, E>,
      ) =>
        SubscriptionRef.changes(session).pipe(
          Stream.switchMap(
            Option.match({
              onNone: () => Stream.empty,
              onSome: (current) =>
                Stream.unwrap(
                  subscriptionFor(current).pipe(
                    Effect.flatMap(current.subscribe),
                    Effect.map((events) =>
                      events.pipe(Stream.catch(() => Stream.empty)),
                    ),
                  ),
                ),
            }),
          ),
        );

      const renderTemplate = Effect.fn("HomeAssistant.renderTemplate")(
        function* (request: TemplateRequest) {
          const current = yield* connected;
          // Home Assistant can report the same warning more than once.
          const warnings = new Set<string>();

          const events = yield* current.subscribe(
            templateSubscription(request),
          );

          const rendered = yield* events.pipe(
            Stream.mapEffect(decodeTemplateUpdate),
            Stream.filter((update) => {
              if ("error" in update && update.level !== "ERROR") {
                warnings.add(update.error);

                return false;
              }

              return true;
            }),
            Stream.runHead,
          );

          if (Option.isNone(rendered)) {
            return yield* new HomeAssistantError({
              message: "the template was not rendered",
            });
          }

          if ("error" in rendered.value) {
            return yield* new HomeAssistantError({
              message: rendered.value.error,
            });
          }

          return { result: rendered.value.result, warnings: [...warnings] };
        },
        Effect.scoped,
      );

      const watchTemplate = (request: TemplateRequest) =>
        followSessions(() =>
          Effect.succeed(templateSubscription(request)),
        ).pipe(Stream.mapEffect(decodeTemplateUpdate));

      const watchEvents = (request: WatchEventsRequest) =>
        followSessions(() =>
          Effect.succeed<HomeAssistantSubscription>({
            type: "subscribe_events",
            ...request,
          }),
        ).pipe(Stream.mapEffect(decodeEvent));

      const fireEvent = Effect.fn("HomeAssistant.fireEvent")(function* (
        request: FireEventRequest,
      ) {
        const current = yield* connected;

        yield* current.request({ type: "fire_event", ...request });
      });

      const getHistory = Effect.fn("HomeAssistant.getHistory")(function* (
        request: HistoryRequest,
      ) {
        const current = yield* connected;
        const entityIds = yield* expandEntities(current, request);

        if (entityIds.length === 0) {
          return {};
        }

        const result = yield* current.request({
          type: "history/history_during_period",
          start_time: request.start_time,
          end_time: request.end_time,
          entity_ids: entityIds,
          no_attributes: request.no_attributes,
          significant_changes_only: request.all_changes !== true,
        });

        return yield* historyFrom(result);
      });

      // The entities and devices a logbook request is for; all of them
      // without a target.
      const logbookScope = Effect.fn("HomeAssistant.logbookScope")(function* (
        current: HomeAssistantSession,
        request: WatchLogbookRequest,
      ) {
        if (request.target === undefined) {
          return {};
        }

        const extracted = yield* extract(current, {
          target: request.target,
          domain: request.domain,
        });

        return {
          entity_ids: extracted.referenced_entities.filter(
            inDomain(request.domain),
          ),
          device_ids: extracted.referenced_devices,
        };
      });

      const getLogbook = Effect.fn("HomeAssistant.getLogbook")(function* (
        request: LogbookRequest,
      ) {
        const current = yield* connected;

        const result = yield* current.request({
          type: "logbook/get_events",
          start_time: request.start_time,
          end_time: request.end_time,
          ...(yield* logbookScope(current, request)),
        });

        const entries = yield* logbookFrom(result);

        return entries.filter(logbookInDomain(request.domain));
      });

      // Home Assistant sends historical entries, then live ones, then a
      // catch-up batch for events the recorder had not committed. Live
      // entries are held until that batch arrives, so a gap entry is not
      // dropped because a newer live entry was seen first. Each subscription
      // starts a minute before the last entry delivered, so a clock ahead of
      // Home Assistant is still accepted, and entries from a disconnect
      // arrive once.
      const watchLogbook = (request: WatchLogbookRequest) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const cursor = yield* Ref.make(
              initialLogbookCursor<LogbookEntry>(Date.now()),
            );

            return followSessions((current) =>
              Effect.gen(function* () {
                yield* Ref.update(cursor, beginLogbookSubscription);

                const [scope, currentCursor] = yield* Effect.all([
                  logbookScope(current, request),
                  Ref.get(cursor),
                ]);

                return {
                  type: "logbook/event_stream",
                  start_time: new Date(
                    currentCursor.deliveredThrough - 60_000,
                  ).toISOString(),
                  ...scope,
                } satisfies HomeAssistantSubscription;
              }),
            ).pipe(
              Stream.mapEffect(logbookEventFrom),
              Stream.mapEffect((batch) =>
                Ref.modify(cursor, (current) => {
                  const next = acceptLogbookBatch(current, batch);

                  return [next.entries, next.cursor];
                }),
              ),
              Stream.flattenIterable,
              Stream.filter(logbookInDomain(request.domain)),
            );
          }),
        );

      const watchTrigger = (request: TriggerRequest) =>
        followSessions(() =>
          Effect.succeed<HomeAssistantSubscription>({
            type: "subscribe_trigger",
            ...request,
          }),
        ).pipe(Stream.mapEffect(decodeTriggerEvent));

      const testCondition = Effect.fn("HomeAssistant.testCondition")(function* (
        request: ConditionRequest,
      ) {
        const current = yield* connected;

        const result = yield* current.request({
          type: "test_condition",
          ...request,
        });

        return yield* decodeConditionResult(result);
      });

      const watchCondition = (request: WatchConditionRequest) =>
        followSessions(() =>
          Effect.succeed<HomeAssistantSubscription>({
            type: "subscribe_condition",
            ...request,
          }),
        ).pipe(Stream.mapEffect(decodeConditionUpdate));

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
        renderTemplate,
        watchTemplate,
        watchEvents,
        fireEvent,
        getHistory,
        getLogbook,
        watchLogbook,
        watchTrigger,
        testCondition,
        watchCondition,
        search: runSearch,
      });
    }),
  ).pipe(Layer.provide(Search.layer));
}
