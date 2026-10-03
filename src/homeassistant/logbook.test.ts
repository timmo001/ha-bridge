import { describe, expect, test } from "bun:test";
import {
  acceptLogbookBatch,
  beginLogbookSubscription,
  initialLogbookCursor,
} from "./logbook.js";

const entry = (entityId: string, when: string) => ({
  entity_id: entityId,
  when,
});

const door = entry("binary_sensor.door", "2030-01-01T00:00:01.000Z");

const light = entry("light.kitchen", "2030-01-01T00:00:02.000Z");

const fold = (
  batches: ReadonlyArray<{
    readonly past: boolean;
    readonly partial: boolean;
    readonly entries: ReadonlyArray<ReturnType<typeof entry>>;
  }>,
) => {
  let cursor = initialLogbookCursor<ReturnType<typeof entry>>(
    Date.parse("2030-01-01T00:00:00.000Z"),
  );

  const emitted: Array<ReturnType<typeof entry>> = [];

  for (const batch of batches) {
    const next = acceptLogbookBatch(cursor, batch);

    cursor = next.cursor;
    emitted.push(...next.entries);
  }

  return emitted.map(({ entity_id }) => entity_id);
};

describe("acceptLogbookBatch", () => {
  test("drops history that was already delivered", () => {
    expect(
      fold([
        { past: true, partial: true, entries: [door] },
        { past: true, partial: false, entries: [] },
        { past: true, partial: true, entries: [door] },
        { past: true, partial: false, entries: [light] },
      ]),
    ).toEqual(["binary_sensor.door", "light.kitchen"]);
  });

  test("holds live entries again after a reconnect until history finishes", () => {
    let cursor = initialLogbookCursor<ReturnType<typeof entry>>(
      Date.parse("2030-01-01T00:00:00.000Z"),
    );

    cursor = acceptLogbookBatch(cursor, {
      past: true,
      partial: false,
      entries: [door],
    }).cursor;
    cursor = beginLogbookSubscription(cursor);

    const held = acceptLogbookBatch(cursor, {
      past: false,
      partial: false,
      entries: [light],
    });

    expect(held.entries).toEqual([]);

    const caughtUp = acceptLogbookBatch(held.cursor, {
      past: true,
      partial: false,
      entries: [],
    });

    expect(caughtUp.entries).toEqual([light]);
  });
});
