import { Effect, Schema } from "effect";
import type { EntityId } from "./Action.js";
import { BridgeClient } from "./BridgeClient.js";
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

const decodeEvents = Schema.decodeUnknownEffect(CalendarEventsResponse);

// Events on a calendar that overlap the range, via `calendar.get_events`.
export const getCalendarEvents = Effect.fn("getCalendarEvents")(function* (
  entityId: EntityId<"calendar">,
  range: { readonly start: Date; readonly end: Date },
) {
  const client = yield* BridgeClient;

  const response = yield* client.CallAction({
    action: "calendar.get_events",
    data: {
      start_date_time: range.start.toISOString(),
      end_date_time: range.end.toISOString(),
    },
    target: { entity_id: entityId },
    return_response: true,
  });

  const calendars = yield* decodeEvents(response).pipe(
    Effect.mapError(
      (error) =>
        new HomeAssistantError({
          message: `decode calendar events: ${error.message}`,
        }),
    ),
  );

  return calendars[entityId]?.events ?? [];
});
