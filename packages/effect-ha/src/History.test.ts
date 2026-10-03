import { describe, expect, test } from "bun:test";
import { Effect, Schema } from "effect";
import { logbookEventFrom } from "./History.js";

const read = (event: Schema.Json) => Effect.runSync(logbookEventFrom(event));

describe("logbookEventFrom", () => {
  test("marks an early historical chunk as past and partial", () => {
    expect(
      read({
        events: [{ when: 1_893_456_000, entity_id: "light.kitchen" }],
        start_time: 1_893_455_000,
        end_time: 1_893_456_100,
        partial: true,
      }),
    ).toEqual({
      past: true,
      partial: true,
      entries: [
        {
          when: "2030-01-01T00:00:00.000Z",
          entity_id: "light.kitchen",
        },
      ],
    });
  });

  test("treats a live batch as neither past nor partial", () => {
    expect(
      read({
        events: [{ when: 1_893_456_001, state: "on" }],
      }),
    ).toEqual({
      past: false,
      partial: false,
      entries: [{ when: "2030-01-01T00:00:01.000Z", state: "on" }],
    });
  });

  test("treats the recorder catch-up batch as finished history", () => {
    expect(
      read({
        events: [],
        start_time: 1_893_456_000.5,
        end_time: 1_893_456_002,
      }),
    ).toEqual({ past: true, partial: false, entries: [] });
  });
});
