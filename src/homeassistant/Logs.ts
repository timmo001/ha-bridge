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
import { HomeAssistantError, SystemLogEntry } from "@timmo001/effect-ha";
import {
  LogUnavailable,
  type SystemLogRequest,
} from "@timmo001/effect-ha-bridge";
import { Search, type SearchKey } from "../search/Search.js";
import { HomeAssistant } from "./HomeAssistant.js";
import {
  newSystemLogEntries,
  type SystemLogSeen,
  systemLogKeys,
} from "./log.js";

export interface HomeAssistantLogsService {
  // Core's logged errors and warnings, newest first.
  readonly getSystemLog: (
    request: SystemLogRequest,
  ) => Effect.Effect<
    ReadonlyArray<SystemLogEntry>,
    HomeAssistantError | LogUnavailable
  >;
  // Each new error or warning, and each repeat, oldest first. Core only
  // sends an event for them with `fire_event` turned on, so the list is read
  // again every few seconds instead.
  readonly watchSystemLog: (
    request: SystemLogRequest,
  ) => Stream.Stream<SystemLogEntry, LogUnavailable>;
}

const systemLogInterval = "5 seconds";

const decodeSystemLog = Schema.decodeUnknownEffect(
  Schema.Array(SystemLogEntry),
);

export class HomeAssistantLogs extends Context.Service<
  HomeAssistantLogs,
  HomeAssistantLogsService
>()("HomeAssistantLogs") {
  static readonly layer = Layer.effect(
    HomeAssistantLogs,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;
      const search = yield* Search;

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
            overrides: { limit: Number.POSITIVE_INFINITY },
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
          Effect.mapError(
            (error) =>
              new HomeAssistantError({
                message: `decode system log: ${error.message}`,
              }),
          ),
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

      return HomeAssistantLogs.of({ getSystemLog, watchSystemLog });
    }),
  ).pipe(Layer.provide(Search.layer));
}
