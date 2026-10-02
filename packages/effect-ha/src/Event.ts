import { Schema } from "effect";
import { EntityState } from "./Entity.js";

// An event from `subscribe_events`.
export const HomeAssistantEvent = Schema.Struct({
  event_type: Schema.String,
  data: Schema.Record(Schema.String, Schema.Json),
  origin: Schema.String,
  time_fired: Schema.String,
  context: Schema.Struct({
    id: Schema.String,
    parent_id: Schema.NullOr(Schema.String),
    user_id: Schema.NullOr(Schema.String),
  }),
});

export type HomeAssistantEvent = typeof HomeAssistantEvent.Type;

// Events to watch, of one type or every type.
export const WatchEventsRequest = Schema.Struct({
  // Every event when left out; most types need an admin token.
  event_type: Schema.optional(Schema.String),
});

export type WatchEventsRequest = typeof WatchEventsRequest.Type;

// An event to fire on Home Assistant's event bus. Needs an admin token.
export const FireEventRequest = Schema.Struct({
  event_type: Schema.String,
  event_data: Schema.optional(Schema.Record(Schema.String, Schema.Json)),
});

export type FireEventRequest = typeof FireEventRequest.Type;

// A `state_changed` event. `new_state` is null when the entity was removed.
export const StateChangedEvent = Schema.Struct({
  event_type: Schema.Literal("state_changed"),
  data: Schema.Struct({
    entity_id: Schema.String,
    new_state: Schema.NullOr(EntityState),
  }),
});

export type StateChangedEvent = typeof StateChangedEvent.Type;
