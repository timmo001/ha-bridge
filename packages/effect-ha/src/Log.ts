import { Effect, Schema, Stream } from "effect";
import type { HttpClientRequest } from "effect/http";
import { HomeAssistantError } from "./HomeAssistantError.js";
import {
  restRequest,
  type RestOptions,
  supervisorRequest,
  type SupervisorOptions,
} from "./Rest.js";

export type { SupervisorOptions } from "./Rest.js";

// Parts of Home Assistant whose logs the Supervisor serves from the host
// journal: Core, the Supervisor, the host's own services and the
// Supervisor's plugins.
export const LogArea = Schema.Literals([
  "core",
  "supervisor",
  "host",
  "audio",
  "cli",
  "dns",
  "multicast",
  "observer",
]);

export type LogArea = typeof LogArea.Type;

// A log: an area's, or an app's by its slug, such as core_mosquitto.
export const LogSource = Schema.Union([
  LogArea,
  Schema.Struct({ app: Schema.String }),
]);

export type LogSource = typeof LogSource.Type;

const isLogArea = Schema.is(LogArea);

export const logSourceName = (source: LogSource) =>
  isLogArea(source) ? source : source.app;

// The journal cursor that `followSupervisorLog` resumes from, and how many
// entries after it were read.
export interface LogPosition {
  readonly cursor: string;
  readonly read: number;
}

// The Supervisor's limit, which `follow` asks for so it never stops.
const journalLinesMax = "18446744073709551615";

const supervisorLogPath = (
  source: LogSource,
  options: {
    readonly boot?: number | undefined;
    readonly latest?: boolean | undefined;
    readonly follow?: boolean | undefined;
  },
) =>
  [
    isLogArea(source) ? source : `addons/${encodeURIComponent(source.app)}`,
    "logs",
    ...(options.latest === true ? ["latest"] : []),
    ...(options.boot === undefined ? [] : ["boots", String(options.boot)]),
    ...(options.follow === true ? ["follow"] : []),
  ].join("/");

const restGet = (
  options: RestOptions,
  path: string,
  request: HttpClientRequest.Options.NoUrl,
) => restRequest(options, "GET", path, request);

const linesOf = (response: {
  readonly stream: Stream.Stream<Uint8Array, unknown>;
}) =>
  response.stream.pipe(
    Stream.decodeText(),
    Stream.splitLines,
    Stream.mapError(
      (error) =>
        new HomeAssistantError({ message: `read log: ${String(error)}` }),
    ),
  );

// The Supervisor's journal options; flags count by being present.
type JournalParams = {
  no_colors: string;
  verbose?: string;
  lines?: string;
};

// Colours are always left out, as the bridge's clients read the text.
const journalParams = (request: {
  readonly verbose?: boolean | undefined;
  readonly lines?: number | undefined;
}) => {
  const params: JournalParams = { no_colors: "" };

  if (request.verbose === true) {
    params.verbose = "";
  }

  if (request.lines !== undefined) {
    params.lines = String(request.lines);
  }

  return params;
};

// A log's latest entries, oldest first, from the Supervisor. Needs an admin
// token through Core's proxy, or an app allowed the Supervisor API directly.
// `boot` is an offset: 0 for this boot, -1 for the one before, and so on.
// `latest` reads only since the area last started; Core's proxy allows it
// for Core alone.
export const supervisorLog = Effect.fn("HomeAssistant.supervisorLog")(
  function* (
    options: SupervisorOptions,
    source: LogSource,
    request: {
      readonly lines?: number | undefined;
      readonly boot?: number | undefined;
      readonly latest?: boolean | undefined;
      readonly verbose?: boolean | undefined;
    },
  ) {
    const response = yield* supervisorRequest(
      options,
      supervisorLogPath(source, request),
      { urlParams: journalParams(request) },
    );

    return yield* Stream.runCollect(linesOf(response));
  },
);

// A log's latest `lines` entries, then every new one, until the connection
// drops. With `from`, it carries on after the entries already read instead.
// Each entry comes with where to carry on from after it.
export const followSupervisorLog = (
  options: SupervisorOptions,
  source: LogSource,
  request: {
    readonly lines?: number | undefined;
    readonly verbose?: boolean | undefined;
    readonly from?: LogPosition | undefined;
  },
) =>
  Stream.unwrap(
    Effect.gen(function* () {
      const from = request.from;

      const response = yield* supervisorRequest(
        options,
        supervisorLogPath(source, { follow: true }),
        from === undefined
          ? {
              urlParams: journalParams({
                verbose: request.verbose,
                lines: request.lines ?? 10,
              }),
            }
          : {
              urlParams: journalParams({ verbose: request.verbose }),
              headers: {
                Range: `entries=${from.cursor}:${from.read}:${journalLinesMax}`,
              },
            },
      );

      // The Supervisor names the first entry it sends, so positions count
      // from there, or carry on counting from `from` when it doesn't.
      const first = response.headers["x-first-cursor"];
      const cursor = first ?? from?.cursor;
      const start = first === undefined ? (from?.read ?? 0) : 0;

      return linesOf(response).pipe(
        Stream.mapAccum(
          () => start,
          (read, line) => [
            read + 1,
            [
              {
                line,
                position:
                  cursor === undefined ? undefined : { cursor, read: read + 1 },
              },
            ],
          ],
        ),
      );
    }),
  );

const decodeBoots = Schema.decodeUnknownEffect(
  Schema.fromJsonString(
    Schema.Struct({
      data: Schema.Struct({
        boots: Schema.Record(Schema.String, Schema.String),
      }),
    }),
  ),
);

const decodeData = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ data: Schema.Json })),
);

const responseText = (response: {
  readonly text: Effect.Effect<string, { readonly message: string }>;
}) =>
  response.text.pipe(
    Effect.mapError(
      (error) => new HomeAssistantError({ message: error.message }),
    ),
  );

// The host's boots by offset, the current one at 0, with their boot IDs.
// Needs an admin token, or an app with the Supervisor's manager role.
export const supervisorLogBoots = Effect.fn("HomeAssistant.supervisorLogBoots")(
  function* (options: SupervisorOptions) {
    const response = yield* supervisorRequest(options, "host/logs/boots");

    const { data } = yield* decodeBoots(yield* responseText(response)).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({ message: `decode boots: ${error.message}` }),
      ),
    );

    return data.boots;
  },
);

// What a Supervisor API endpoint, such as `addons`, answers, unwrapped from
// its `data`.
export const supervisorApi = Effect.fn("HomeAssistant.supervisorApi")(
  function* (options: SupervisorOptions, endpoint: string) {
    const response = yield* supervisorRequest(options, endpoint);

    const { data } = yield* decodeData(yield* responseText(response)).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode ${endpoint}: ${error.message}`,
          }),
      ),
    );

    return data;
  },
);

// Core's log file, oldest first. Without a Supervisor this is the only way
// to read Core's log over the REST API. Needs an admin token.
export const errorLog = Effect.fn("HomeAssistant.errorLog")(function* (
  options: RestOptions,
) {
  const response = yield* restGet(options, "error_log", {});

  return yield* Stream.runCollect(linesOf(response));
});

// The user an access token belongs to, from `auth/current_user`. Reading
// logs needs `is_admin`.
export const CurrentUser = Schema.Struct({
  id: Schema.String,
  name: Schema.NullOr(Schema.String),
  is_owner: Schema.Boolean,
  is_admin: Schema.Boolean,
});

export type CurrentUser = typeof CurrentUser.Type;

// One of Core's logged errors or warnings, from `system_log/list`. Core keeps
// the latest 50, merging repeats of the same error into one entry.
export const SystemLogEntry = Schema.Struct({
  // The logger, such as homeassistant.components.mqtt.
  name: Schema.String,
  // The latest distinct messages, up to five, oldest first.
  message: Schema.Array(Schema.String),
  level: Schema.String,
  // The file, relative to Core or the config directory, and the line.
  source: Schema.Tuple([Schema.String, Schema.Finite]),
  // When it last happened and first happened, in seconds since the epoch.
  timestamp: Schema.Finite,
  first_occurred: Schema.Finite,
  // The traceback, or empty.
  exception: Schema.String,
  count: Schema.Finite,
});

export type SystemLogEntry = typeof SystemLogEntry.Type;
