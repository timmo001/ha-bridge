import { Effect, Schema } from "effect";
import { HomeAssistantError } from "./HomeAssistantError.js";

// Home Assistant sends times as seconds since the epoch.
const isoTime = (seconds: number) => new Date(seconds * 1000).toISOString();

// A state from `history/history_during_period`, in its compressed form.
// `lc` is left out when it equals `lu`.
const CompressedState = Schema.Struct({
  s: Schema.String,
  a: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
  lc: Schema.optionalKey(Schema.Finite),
  lu: Schema.Finite,
});

const decodeHistory = Schema.decodeUnknownEffect(
  Schema.Record(Schema.String, Schema.Array(CompressedState)),
);

// A state an entity had, with ISO times.
export const HistoryState = Schema.Struct({
  state: Schema.String,
  // Left out with `no_attributes`.
  attributes: Schema.optional(Schema.Record(Schema.String, Schema.Json)),
  last_changed: Schema.String,
  last_updated: Schema.String,
});

export type HistoryState = typeof HistoryState.Type;

// Each entity's states, oldest first, keyed by entity ID.
export const History = Schema.Record(Schema.String, Schema.Array(HistoryState));

export type History = typeof History.Type;

// Reads a `history/history_during_period` result.
export const historyFrom = (result: Schema.Json | null) =>
  decodeHistory(result).pipe(
    Effect.map((history): History =>
      Object.fromEntries(
        Object.entries(history).map(([entityId, states]) => [
          entityId,
          states.map((state) => ({
            state: state.s,
            attributes: state.a,
            last_changed: isoTime(state.lc ?? state.lu),
            last_updated: isoTime(state.lu),
          })),
        ]),
      ),
    ),
    Effect.mapError(
      (error) =>
        new HomeAssistantError({ message: `decode history: ${error.message}` }),
    ),
  );

const LogbookFields = {
  entity_id: Schema.optionalKey(Schema.NullOr(Schema.String)),
  name: Schema.optionalKey(Schema.String),
  message: Schema.optionalKey(Schema.String),
  state: Schema.optionalKey(Schema.String),
  domain: Schema.optionalKey(Schema.String),
  icon: Schema.optionalKey(Schema.String),
  // What caused the entry, such as an automation's trigger.
  source: Schema.optionalKey(Schema.NullOr(Schema.String)),
  context_id: Schema.optionalKey(Schema.String),
  context_user_id: Schema.optionalKey(Schema.NullOr(Schema.String)),
  context_event_type: Schema.optionalKey(Schema.String),
  context_domain: Schema.optionalKey(Schema.String),
  context_service: Schema.optionalKey(Schema.String),
  context_entity_id: Schema.optionalKey(Schema.String),
  context_entity_id_name: Schema.optionalKey(Schema.String),
  context_name: Schema.optionalKey(Schema.String),
  context_message: Schema.optionalKey(Schema.String),
  context_state: Schema.optionalKey(Schema.String),
  context_source: Schema.optionalKey(Schema.NullOr(Schema.String)),
};

const WireLogbookEntry = Schema.Struct({
  when: Schema.Finite,
  ...LogbookFields,
});

// A logbook entry, with `when` as an ISO time.
export const LogbookEntry = Schema.Struct({
  when: Schema.String,
  ...LogbookFields,
});

export type LogbookEntry = typeof LogbookEntry.Type;

const toLogbookEntry = (entry: typeof WireLogbookEntry.Type): LogbookEntry => ({
  ...entry,
  when: isoTime(entry.when),
});

const decodeLogbook = Schema.decodeUnknownEffect(
  Schema.Array(WireLogbookEntry),
);

const decodeLogbookEvent = Schema.decodeUnknownEffect(
  Schema.Struct({
    events: Schema.Array(WireLogbookEntry),
    // Only batches of past entries have a range; live ones don't.
    start_time: Schema.optionalKey(Schema.Finite),
    // Set on every historical chunk except the last. The last chunk can
    // arrive after live entries have already started.
    partial: Schema.optionalKey(Schema.Boolean),
  }),
);

const logbookError = (error: Schema.SchemaError) =>
  new HomeAssistantError({ message: `decode logbook: ${error.message}` });

// Reads a `logbook/get_events` result.
export const logbookFrom = (result: Schema.Json | null) =>
  decodeLogbook(result).pipe(
    Effect.map((entries) => entries.map(toLogbookEntry)),
    Effect.mapError(logbookError),
  );

// Reads a `logbook/event_stream` event: its entries, and whether they are
// past entries sent before the live ones.
export const logbookEventFrom = (event: Schema.Json) =>
  decodeLogbookEvent(event).pipe(
    Effect.map(({ events, start_time, partial }) => ({
      past: start_time !== undefined,
      partial: partial === true,
      entries: events.map(toLogbookEntry),
    })),
    Effect.mapError(logbookError),
  );
