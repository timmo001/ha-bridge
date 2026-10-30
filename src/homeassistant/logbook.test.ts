import { describe, expect, test } from "bun:test";
import {
  acceptLogbookBatch,
  initialLogbookCursor,
  type LogbookBatch,
} from "./logbook.js";

interface Entry {
  readonly when: string;
  readonly entity_id: string;
}

const at = (millis: number, entity: string): Entry => ({
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

describe("acceptLogbookBatch", () => {
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
    expect(ids(older.entries)).toEqual([
      "binary_sensor.door",
      "light.kitchen",
      "lock.front",
    ]);
    expect(older.cursor.deliveredThrough).toBe(7_000);
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
  });
});
