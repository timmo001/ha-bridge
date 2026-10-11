import { Schema } from "effect";
import { LogSource } from "@timmo001/effect-ha";

// Why a log can't be read: the bridge's token doesn't belong to an admin,
// Home Assistant has no Supervisor for the log, or its Core is too old for
// it. The bridge checks before asking, so clients can skip the log rather
// than treat it as a failure.
export class LogUnavailable extends Schema.TaggedError<LogUnavailable>()(
  "LogUnavailable",
  {
    reason: Schema.Literals(["admin", "supervisor", "unsupported"]),
    message: Schema.String,
  },
) {}

// Keeps only what fuzzily matches `search`, as the bridge's entity search
// does, in time order.
const searchField = {
  search: Schema.optional(Schema.String),
};

// Core's logged errors and warnings. A search looks at the messages, logger,
// source file and traceback.
export const SystemLogRequest = Schema.Struct(searchField);

export type SystemLogRequest = typeof SystemLogRequest.Type;

const Lines = Schema.Int.check(Schema.isGreaterThan(0));

const watchLogFields = {
  source: LogSource,
  // How many of the latest records to start with.
  lines: Schema.optional(Lines),
  // Adds the time, host and process to each line. Supervisor logs only.
  verbose: Schema.optional(Schema.Boolean),
  // Only this integration's records, such as mqtt, including the libraries
  // it uses. Core's log only.
  integration: Schema.optional(Schema.String),
  ...searchField,
};

// A log's latest records, oldest first. Core's log is read from the
// Supervisor when there is one, otherwise from Core's log file, and from
// Core's live log for an integration.
export const LogRequest = Schema.Struct({
  ...watchLogFields,
  // A boot by offset: 0 for this one, -1 for the one before, and so on.
  boot: Schema.optional(Schema.Int),
  // Only what was logged since the area last started.
  latest: Schema.optional(Schema.Boolean),
});

export type LogRequest = typeof LogRequest.Type;

// A log's latest records, then each new one, following reconnects. Core's
// comes from its live log, the rest from the Supervisor.
export const WatchLogRequest = Schema.Struct(watchLogFields);

export type WatchLogRequest = typeof WatchLogRequest.Type;

// The host's boots by offset, the current one at 0, with their boot IDs.
export const LogBoots = Schema.Record(Schema.String, Schema.String);

export type LogBoots = typeof LogBoots.Type;

// An installed app, whose slug reads its log.
export const LogApp = Schema.Struct({
  slug: Schema.String,
  name: Schema.String,
  state: Schema.String,
  version: Schema.NullOr(Schema.String),
});

export type LogApp = typeof LogApp.Type;
