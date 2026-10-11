import {
  Context,
  Effect,
  Layer,
  Option,
  Ref,
  Schedule,
  Schema,
  Stream,
} from "effect";
import { HttpClient } from "effect/http";
import {
  errorLog,
  followSupervisorLog,
  HomeAssistantError,
  type HomeAssistantSession,
  type LogPosition,
  type LogSource,
  logSourceName,
  supervisorLog,
  supervisorLogBoots,
  SystemLogEntry,
} from "@timmo001/effect-ha";
import {
  LogApp,
  type LogBoots,
  type LogRequest,
  LogUnavailable,
  type SystemLogRequest,
  type WatchLogRequest,
} from "@timmo001/effect-ha-bridge";
import { BridgeConfig } from "../config/Config.js";
import { Search, type SearchKey } from "../search/Search.js";
import { HomeAssistant } from "./HomeAssistant.js";
import {
  coreRecords,
  newSystemLogEntries,
  recordKeys,
  resumeBacklog,
  type SystemLogSeen,
  systemLogKeys,
  withoutColours,
} from "./log.js";

type LogFailure = HomeAssistantError | LogUnavailable;

export interface HomeAssistantLogsService {
  // Core's logged errors and warnings, newest first.
  readonly getSystemLog: (
    request: SystemLogRequest,
  ) => Effect.Effect<ReadonlyArray<SystemLogEntry>, LogFailure>;
  // Each new error or warning, and each repeat, oldest first. Core only
  // sends an event for them with `fire_event` turned on, so the list is read
  // again every few seconds instead.
  readonly watchSystemLog: (
    request: SystemLogRequest,
  ) => Stream.Stream<SystemLogEntry, LogUnavailable>;
  // A log's latest records, oldest first.
  readonly getLog: (
    request: LogRequest,
  ) => Effect.Effect<ReadonlyArray<string>, LogFailure>;
  // A log's latest records, then each new one, following reconnects.
  readonly watchLog: (
    request: WatchLogRequest,
  ) => Stream.Stream<string, LogFailure>;
  readonly getLogBoots: Effect.Effect<LogBoots, LogFailure>;
  readonly getLogApps: Effect.Effect<ReadonlyArray<LogApp>, LogFailure>;
}

const systemLogInterval = "5 seconds";

const reconnectDelay = "5 seconds";

// Extra journal lines read for Core's latest records, for their tracebacks.
const tracebackHeadroom = 200;

const decodeSystemLog = Schema.decodeUnknownEffect(
  Schema.Array(SystemLogEntry),
);

const decodeComponents = Schema.decodeUnknownEffect(
  Schema.Struct({ components: Schema.Array(Schema.String) }),
);

const decodeApps = Schema.decodeUnknownEffect(
  Schema.Struct({ addons: Schema.Array(LogApp) }),
);

const decodeRawRecords = Schema.decodeUnknownEffect(
  Schema.Array(Schema.String),
);

const decodeFailure =
  (label: string) => (error: { readonly message: string }) =>
    new HomeAssistantError({ message: `decode ${label}: ${error.message}` });

const noIntegration = () =>
  new HomeAssistantError({
    message: "only Core's log can be read for an integration",
  });

export class HomeAssistantLogs extends Context.Service<
  HomeAssistantLogs,
  HomeAssistantLogsService
>()("HomeAssistantLogs") {
  static readonly layer = Layer.effect(
    HomeAssistantLogs,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;
      const search = yield* Search;
      const config = yield* (yield* BridgeConfig).load;
      const http = yield* HttpClient.HttpClient;

      const withHttp = Effect.provideService(HttpClient.HttpClient, http);

      // Every log needs an admin, so check before asking rather than pass
      // on Home Assistant's refusal.
      const requireAdmin = Effect.gen(function* () {
        const user = yield* homeAssistant.currentUser;

        if (!user.is_admin) {
          return yield* new LogUnavailable({
            reason: "admin",
            message: `reading logs needs an admin user, and the bridge's token belongs to ${user.name ?? user.id}, who isn't one`,
          });
        }
      });

      const hasSupervisor = Effect.gen(function* () {
        const current = yield* homeAssistant.session;
        const result = yield* current.request({ type: "get_config" });

        const { components } = yield* decodeComponents(result).pipe(
          Effect.mapError(decodeFailure("Home Assistant config")),
        );

        return components.includes("hassio");
      });

      const supervisorMissing = (what: string) =>
        new LogUnavailable({
          reason: "supervisor",
          message: `${what} needs the Supervisor, which this Home Assistant doesn't have`,
        });

      const requireSupervisor = (what: string) =>
        Effect.gen(function* () {
          if (!(yield* hasSupervisor)) {
            return yield* supervisorMissing(what);
          }
        });

      // The items a fuzzy search keeps, in their original order, as logs
      // read in time order. Everything without a search.
      const searchKept = <T>(
        items: ReadonlyArray<T>,
        query: string | undefined,
        keys: ReadonlyArray<SearchKey<T>>,
      ) => {
        if (query === undefined || query.trim() === "") {
          return Effect.succeed(items);
        }

        return search
          .fuzzy({
            items,
            query,
            keys,
            primary: () => "",
            overrides: {
              limit: Number.POSITIVE_INFINITY,
              ignoreFieldNorm: true,
            },
          })
          .pipe(
            Effect.map(({ results }) => {
              const kept = new Set(results.map(({ item }) => item));

              return items.filter((item) => kept.has(item));
            }),
          );
      };

      const listSystemLog = Effect.gen(function* () {
        yield* requireAdmin;

        const current = yield* homeAssistant.session;
        const result = yield* current.request({ type: "system_log/list" });

        return yield* decodeSystemLog(result).pipe(
          Effect.mapError(decodeFailure("system log")),
        );
      });

      const getSystemLog = Effect.fn("HomeAssistantLogs.getSystemLog")(
        function* (request: SystemLogRequest) {
          return yield* searchKept(
            yield* listSystemLog,
            request.search,
            systemLogKeys,
          );
        },
      );

      const watchSystemLog = (request: SystemLogRequest) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const seen = yield* Ref.make(Option.none<SystemLogSeen>());

            // Reads nothing while disconnected, and keeps what it has seen
            // so a reconnect doesn't repeat entries.
            const poll = listSystemLog.pipe(
              Effect.flatMap((entries) =>
                Ref.modify(seen, (previous) => {
                  const next = newSystemLogEntries(
                    Option.getOrUndefined(previous),
                    entries,
                  );

                  return [next.entries, Option.some(next.seen)];
                }),
              ),
              Effect.flatMap((entries) =>
                searchKept(entries, request.search, systemLogKeys),
              ),
              Effect.catchTag("HomeAssistantError", (error) =>
                Effect.logDebug(
                  "Could not read the system log",
                  error.message,
                ).pipe(Effect.as([])),
              ),
            );

            return Stream.fromEffectSchedule(
              poll,
              Schedule.spaced(systemLogInterval),
            ).pipe(Stream.flattenIterable);
          }),
        );

      // Core's live log on one connection: the end of its log file, then
      // each record as it's logged. Core before 2026.11 doesn't have it.
      const subscribeRawLog = Effect.fn("HomeAssistantLogs.subscribeRawLog")(
        function* (current: HomeAssistantSession, integration?: string) {
          const events = yield* current
            .subscribe({ type: "system_log/subscribe_raw", integration })
            .pipe(
              Effect.catchIf(
                (error) => error.message === "Unknown command.",
                () =>
                  Effect.fail(
                    new LogUnavailable({
                      reason: "unsupported",
                      message:
                        "Core's live log needs Home Assistant 2026.11 or newer",
                    }),
                  ),
              ),
            );

          return events.pipe(
            Stream.mapEffect((event) =>
              decodeRawRecords(event).pipe(
                Effect.mapError(decodeFailure("Core's live log")),
              ),
            ),
            Stream.map((records) => records.map(withoutColours)),
          );
        },
      );

      // Core's log: an integration's from the live log's backlog, otherwise
      // from the Supervisor's journal, or Core's log file without one.
      const coreLog = Effect.fn("HomeAssistantLogs.coreLog")(function* (
        request: LogRequest,
      ) {
        if (request.integration !== undefined) {
          const integration = request.integration;

          const backlog = yield* Effect.scoped(
            Effect.gen(function* () {
              const current = yield* homeAssistant.session;
              const records = yield* subscribeRawLog(current, integration);

              return yield* Stream.runHead(records);
            }),
          );

          return resumeBacklog(
            Option.getOrElse(backlog, () => []),
            undefined,
            request.lines,
          );
        }

        if (yield* hasSupervisor) {
          if (request.verbose === true) {
            return yield* supervisorLog(config, "core", request).pipe(withHttp);
          }

          // The journal counts a traceback's lines separately, so read more
          // and keep whole records.
          const lines = yield* supervisorLog(config, "core", {
            ...request,
            lines:
              request.lines === undefined
                ? undefined
                : request.lines + tracebackHeadroom,
          }).pipe(withHttp);

          const records = coreRecords(lines);

          return request.lines === undefined
            ? records
            : records.slice(-request.lines);
        }

        if (
          request.boot !== undefined ||
          request.latest === true ||
          request.verbose === true
        ) {
          return yield* supervisorMissing("Reading Core's log by boot");
        }

        const records = coreRecords(yield* errorLog(config).pipe(withHttp));

        return request.lines === undefined
          ? records
          : records.slice(-request.lines);
      });

      const getLog = Effect.fn("HomeAssistantLogs.getLog")(function* (
        request: LogRequest,
      ) {
        yield* requireAdmin;

        if (request.source !== "core" && request.integration !== undefined) {
          return yield* noIntegration();
        }

        const records =
          request.source === "core"
            ? yield* coreLog(request)
            : yield* Effect.andThen(
                requireSupervisor(
                  `Reading the ${logSourceName(request.source)} log`,
                ),
                supervisorLog(config, request.source, request).pipe(withHttp),
              );

        return yield* searchKept(records, request.search, recordKeys);
      });

      // Core's live log, following reconnects. Each subscription starts with
      // the end of the log file again, so what was already sent is left out.
      const watchCoreLog = (request: WatchLogRequest) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const lastSent = yield* Ref.make(Option.none<string>());

            return homeAssistant.sessions.pipe(
              Stream.switchMap(
                Option.match({
                  onNone: () => Stream.empty,
                  onSome: (current) =>
                    Stream.unwrap(
                      Effect.gen(function* () {
                        yield* requireAdmin;

                        const records = yield* subscribeRawLog(
                          current,
                          request.integration,
                        );

                        return records.pipe(
                          Stream.mapAccumEffect(
                            () => true,
                            (first, batch) =>
                              Effect.map(Ref.get(lastSent), (last) => [
                                false,
                                first
                                  ? resumeBacklog(
                                      batch,
                                      Option.getOrUndefined(last),
                                      request.lines,
                                    )
                                  : batch,
                              ]),
                          ),
                          Stream.tap((record) =>
                            Ref.set(lastSent, Option.some(record)),
                          ),
                          // The connection dropping ends this subscription;
                          // the next connection starts another.
                          Stream.catchTag(
                            "HomeAssistantError",
                            () => Stream.empty,
                          ),
                        );
                      }),
                    ),
                }),
              ),
            );
          }),
        );

      // A Supervisor log, following reconnects. After one, it carries on
      // from the journal position it reached, so nothing is sent twice.
      const watchSupervisorLog = (
        source: LogSource,
        request: WatchLogRequest,
      ) =>
        Stream.unwrap(
          Effect.gen(function* () {
            const position = yield* Ref.make(Option.none<LogPosition>());

            const follow = Stream.unwrap(
              Effect.gen(function* () {
                yield* requireAdmin;
                yield* requireSupervisor(
                  `Watching the ${logSourceName(source)} log`,
                );

                return followSupervisorLog(config, source, {
                  lines: request.lines,
                  verbose: request.verbose,
                  from: Option.getOrUndefined(yield* Ref.get(position)),
                }).pipe(Stream.provideService(HttpClient.HttpClient, http));
              }),
            ).pipe(
              Stream.tap(({ position: reached }) =>
                reached === undefined
                  ? Effect.void
                  : Ref.set(position, Option.some(reached)),
              ),
              Stream.map(({ line }) => line),
              Stream.catchTag("HomeAssistantError", (error) =>
                Stream.fromEffect(
                  Effect.logDebug(
                    `Stopped following the ${logSourceName(source)} log`,
                    error.message,
                  ),
                ).pipe(Stream.drain),
              ),
            );

            return follow.pipe(Stream.repeat(Schedule.spaced(reconnectDelay)));
          }),
        );

      const watchLog = (request: WatchLogRequest) =>
        request.source !== "core" && request.integration !== undefined
          ? Stream.fail(noIntegration())
          : (request.source === "core"
              ? watchCoreLog(request)
              : watchSupervisorLog(request.source, request)
            ).pipe(
              Stream.mapEffect((record) =>
                searchKept([record], request.search, recordKeys),
              ),
              Stream.flattenIterable,
            );

      const getLogBoots = Effect.gen(function* () {
        yield* requireAdmin;
        yield* requireSupervisor("Listing the host's boots");

        return yield* supervisorLogBoots(config).pipe(withHttp);
      }).pipe(Effect.withSpan("HomeAssistantLogs.getLogBoots"));

      const getLogApps = Effect.gen(function* () {
        yield* requireAdmin;
        yield* requireSupervisor("Listing apps");

        const current = yield* homeAssistant.session;

        const result = yield* current.request({
          type: "supervisor/api",
          endpoint: "/addons",
          method: "get",
        });

        const { addons } = yield* decodeApps(result).pipe(
          Effect.mapError(decodeFailure("apps")),
        );

        return addons;
      }).pipe(Effect.withSpan("HomeAssistantLogs.getLogApps"));

      return HomeAssistantLogs.of({
        getSystemLog,
        watchSystemLog,
        getLog,
        watchLog,
        getLogBoots,
        getLogApps,
      });
    }),
  ).pipe(Layer.provide(Search.layer));
}
