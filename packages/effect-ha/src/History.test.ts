import { describe, expect, test } from "bun:test";
import { Effect, Schema } from "effect";
import { logbookEventFrom } from "./History.js";

const decode = (event: Schema.Json) =>
  Effect.runPromise(logbookEventFrom(event));

describe("logbookEventFrom", () => {
  test("keeps where a historical chunk starts", async () => {
    const batch = await decode({
      events: [{ when: 1_893_456_001, entity_id: "binary_sensor.door" }],
      start_time: 1_000.5,
      partial: true,
    });

    expect(batch.past).toBe(true);
    expect(batch.partial).toBe(true);
    expect(batch.startTime).toBe(1_000_500);
    expect(Date.parse(batch.entries[0]?.when ?? "")).toBe(1_893_456_001_000);
  });

  test("leaves the start off a live batch", async () => {
    const batch = await decode({
      events: [{ when: 1_893_456_002, entity_id: "light.kitchen" }],
    });

    expect(batch.past).toBe(false);
    expect(batch.partial).toBe(false);
    expect(batch.startTime).toBeUndefined();
  });
});
