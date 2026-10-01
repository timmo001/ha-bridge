import { Effect, Schema } from "effect";
import type { Action, EntityId } from "./Action.js";
import { HomeAssistantError } from "./HomeAssistantError.js";

// `start` and `end` are ISO dates for all-day events, date-times otherwise.
export const CalendarEvent = Schema.Struct({
  start: Schema.String,
  end: Schema.String,
  summary: Schema.String,
  description: Schema.optionalKey(Schema.String),
  location: Schema.optionalKey(Schema.String),
});

export type CalendarEvent = typeof CalendarEvent.Type;

const CalendarEventsResponse = Schema.Record(
  Schema.String,
  Schema.Struct({ events: Schema.Array(CalendarEvent) }),
);

const decodeResponse = Schema.decodeUnknownEffect(CalendarEventsResponse);

export const Calendar = {
  // `calendar.get_events` for the events that overlap the range.
  getEvents: (
    entityId: EntityId<"calendar">,
    range: { readonly start: Date; readonly end: Date },
  ): Action => ({
    action: "calendar.get_events",
    data: {
      start_date_time: range.start.toISOString(),
      end_date_time: range.end.toISOString(),
    },
    target: { entity_id: entityId },
    return_response: true,
  }),
  // Reads one calendar's events from a `calendar.get_events` response.
  eventsFrom: (entityId: EntityId<"calendar">, response: Schema.Json | null) =>
    decodeResponse(response).pipe(
      Effect.map((calendars) => calendars[entityId]?.events ?? []),
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode calendar events: ${error.message}`,
          }),
      ),
    ),
};
