import { Schema } from "effect";

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
