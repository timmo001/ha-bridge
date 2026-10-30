import { describe, expect, test } from "bun:test";
import {
  acceptLogbookBatch,
  beginLogbookSubscription,
  initialLogbookCursor,
  type LogbookBatch,
  type LogbookCursor,
} from "./logbook.js";

interface Entry {
  readonly when: string;
  readonly entity_id: string;
}

const at = (millis: number, entity = "light.kitchen"): Entry => ({
  when: new Date(millis).toISOString(),
  entity_id: entity,
});

const ids = (entries: ReadonlyArray<Entry>) =>
  entries.map((entry) => entry.entity_id);

const history = (
  startTime: number,
  entries: ReadonlyArray<Entry>,
  partial: boolean,
): LogbookBatch<Entry> => ({
  past: true,
  partial,
  startTime,
  entries,
});

const delivered = (cursor: LogbookCursor<Entry>) => cursor.deliveredThrough;

describe("acceptLogbookBatch", () => {
  test("holds a live entry until the recorder catch-up arrives", () => {
    const cursor = initialLogbookCursor<Entry>(1_000);

    const live = acceptLogbookBatch(cursor, {
      past: false,
      partial: false,
      entries: [at(3_000, "light.kitchen")],
    });

    const caughtUp = acceptLogbookBatch(
      live.cursor,
      history(400, [at(2_000, "binary_sensor.door")], false),
    );

    expect(ids(live.entries)).toEqual([]);
    expect(ids(caughtUp.entries)).toEqual([
      "binary_sensor.door",
      "light.kitchen",
    ]);
    expect(caughtUp.cursor.awaitingHistory).toBe(false);
  });

  test("keeps the older half of a long query that arrives after the newest day", () => {
    const cursor = initialLogbookCursor<Entry>(1_000);

    const newestDay = acceptLogbookBatch(
      cursor,
      history(
        5_000,
        [at(6_000, "light.kitchen"), at(7_000, "lock.front")],
        true,
      ),
    );

    const older = acceptLogbookBatch(
      newestDay.cursor,
      history(400, [at(1_500, "binary_sensor.door")], true),
    );

    expect(ids(newestDay.entries)).toEqual([]);
    expect(delivered(newestDay.cursor)).toBe(1_000);
    expect(ids(older.entries)).toEqual([
      "binary_sensor.door",
      "light.kitchen",
      "lock.front",
    ]);
    expect(delivered(older.cursor)).toBe(7_000);
    expect(older.cursor.heldHistory).toEqual([]);
  });

  test("does not deliver an entry the cursor already passed", () => {
    const cursor = initialLogbookCursor<Entry>(2_000);

    const accepted = acceptLogbookBatch(
      cursor,
      history(
        1_000,
        [at(2_000, "binary_sensor.door"), at(2_500, "light.kitchen")],
        true,
      ),
    );

    expect(ids(accepted.entries)).toEqual(["light.kitchen"]);
  });

  test("flushes a held day when history finishes without an older chunk", () => {
    const cursor = initialLogbookCursor<Entry>(1_000);

    const held = acceptLogbookBatch(
      cursor,
      history(5_000, [at(6_000, "light.kitchen")], true),
    );

    const withLive = acceptLogbookBatch(held.cursor, {
      past: false,
      partial: false,
      entries: [at(9_000, "fan.bedroom")],
    });

    const finished = acceptLogbookBatch(
      withLive.cursor,
      history(8_000, [at(8_000, "lock.front")], false),
    );

    expect(ids(finished.entries)).toEqual([
      "light.kitchen",
      "lock.front",
      "fan.bedroom",
    ]);
    expect(finished.cursor.heldHistory).toEqual([]);
    expect(finished.cursor.heldLive).toEqual([]);
  });

  test("drops a boundary entry that arrives in both halves", () => {
    const shared = at(5_000, "light.kitchen");
    const cursor = initialLogbookCursor<Entry>(1_000);

    const newestDay = acceptLogbookBatch(
      cursor,
      history(5_000, [shared], true),
    );

    const older = acceptLogbookBatch(
      newestDay.cursor,
      history(400, [at(2_000, "binary_sensor.door"), shared], true),
    );

    expect(ids(older.entries)).toEqual(["binary_sensor.door", "light.kitchen"]);
  });

  test("a new subscription drops entries the previous connection was holding", () => {
    const cursor = initialLogbookCursor<Entry>(1_000);

    const held = acceptLogbookBatch(
      cursor,
      history(5_000, [at(6_000, "light.kitchen")], true),
    );

    const restarted = beginLogbookSubscription(held.cursor);

    expect(restarted.deliveredThrough).toBe(1_000);
    expect(restarted.heldHistory).toEqual([]);
    expect(restarted.awaitingHistory).toBe(true);
  });
});
