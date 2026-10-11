import { Schema } from "effect";

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
