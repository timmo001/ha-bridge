import { Effect } from "effect";
import { Calendar, type EntityId } from "@timmo001/effect-ha";
import { BridgeClient } from "./BridgeClient.js";

// Events on a calendar that overlap the range, via the bridge.
export const getCalendarEvents = Effect.fn("getCalendarEvents")(function* (
  entityId: EntityId<"calendar">,
  range: { readonly start: Date; readonly end: Date },
) {
  const client = yield* BridgeClient;

  const response = yield* client.CallAction(
    Calendar.getEvents(entityId, range),
  );

  return yield* Calendar.eventsFrom(entityId, response);
});
