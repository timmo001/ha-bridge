import { describe, expect, test } from "bun:test";
import { Effect, Schema } from "effect";
import { Calendar, CalendarEvent } from "./Calendar.js";

const decode = Schema.decodeUnknownSync(CalendarEvent);

const standup = {
  start: "2026-10-03T09:00:00+01:00",
  end: "2026-10-03T10:00:00+01:00",
  summary: "Standup",
};

describe("CalendarEvent", () => {
  test("keeps a reported status", () => {
    expect(decode({ ...standup, status: "tentative" })).toEqual({
      ...standup,
      status: "tentative",
    });
  });

  test("accepts an event that does not report a status", () => {
    expect(
      decode({
        start: "2026-10-03",
        end: "2026-10-04",
        summary: "Holiday",
      }),
    ).toEqual({
      start: "2026-10-03",
      end: "2026-10-04",
      summary: "Holiday",
    });
  });
});

describe("eventsFrom", () => {
  test("reads status for each calendar", () => {
    const events = Effect.runSync(
      Calendar.eventsFrom({
        "calendar.work": {
          events: [{ ...standup, status: "confirmed", uid: "ignored" }],
        },
      }),
    );

    expect(events["calendar.work"]).toEqual([
      { ...standup, status: "confirmed" },
    ]);
  });
});
