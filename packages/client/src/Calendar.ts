import { Effect } from "effect";
import { Calendar, type Target } from "@timmo001/effect-ha";
import { BridgeClient } from "./BridgeClient.js";

// Events that overlap the range, keyed by calendar entity ID, via the bridge.
export const getCalendarEvents = Effect.fn("getCalendarEvents")(function* (
  target: Target,
  range: { readonly start: Date; readonly end: Date },
) {
  const client = yield* BridgeClient;

  const response = yield* client.CallAction(Calendar.getEvents(target, range));

  return yield* Calendar.eventsFrom(response);
});
