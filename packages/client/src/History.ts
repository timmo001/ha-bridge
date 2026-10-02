import { Schema } from "effect";
import { Target } from "@timmo001/effect-ha";

// Each entity's states between two ISO times; up to now when `end_time` is
// left out. The target and `domain` work as in `TargetRequest`.
export const HistoryRequest = Schema.Struct({
  target: Target,
  domain: Schema.optional(Schema.String),
  start_time: Schema.String,
  end_time: Schema.optional(Schema.String),
  // Leaves out attributes, which makes long histories much smaller.
  no_attributes: Schema.optional(Schema.Boolean),
  // Also lists changes to attributes only, for entities whose attribute
  // changes Home Assistant treats as insignificant.
  all_changes: Schema.optional(Schema.Boolean),
});

export type HistoryRequest = typeof HistoryRequest.Type;

// Logbook entries for the target's entities and devices, or every entry
// without a target.
const logbookFields = {
  target: Schema.optional(Target),
  domain: Schema.optional(Schema.String),
};

// Logbook entries between two ISO times; up to now when `end_time` is left
// out.
export const LogbookRequest = Schema.Struct({
  ...logbookFields,
  start_time: Schema.String,
  end_time: Schema.optional(Schema.String),
});

export type LogbookRequest = typeof LogbookRequest.Type;

// New logbook entries as they happen.
export const WatchLogbookRequest = Schema.Struct(logbookFields);

export type WatchLogbookRequest = typeof WatchLogbookRequest.Type;
