import { Effect, Schema } from "effect";
import type { Action } from "./Action.js";
import { HomeAssistantError } from "./HomeAssistantError.js";
import type { Target } from "./Target.js";

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
    target: Target,
    range: { readonly start: Date; readonly end: Date },
  ): Action => ({
    action: "calendar.get_events",
    data: {
      start_date_time: range.start.toISOString(),
      end_date_time: range.end.toISOString(),
    },
    target,
    return_response: true,
  }),
  // Reads each calendar's events, keyed by entity ID, from a
  // `calendar.get_events` response.
  eventsFrom: (response: Schema.Json | null) =>
    decodeResponse(response).pipe(
      Effect.map((calendars) =>
        Object.fromEntries(
          Object.entries(calendars).map(([entityId, { events }]) => [
            entityId,
            events,
          ]),
        ),
      ),
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode calendar events: ${error.message}`,
          }),
      ),
    ),
};
