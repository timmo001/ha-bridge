import { describe, expect, test } from "bun:test";
import type { SystemLogEntry } from "@timmo001/effect-ha";
import { coreRecords, newSystemLogEntries, resumeBacklog } from "./log.js";

describe("coreRecords", () => {
  test("keeps a traceback with its record, and a leading fragment apart", () => {
    expect(
      coreRecords([
        '  File "x.py", line 1',
        "2026-10-11 15:04:41.556 ERROR (MainThread) [homeassistant.components.mqtt] Failed",
        "Traceback (most recent call last):",
        "ValueError: bad",
        "2026-10-11 15:04:42.000 WARNING (MainThread) [homeassistant] Slow",
      ]),
    ).toEqual([
      '  File "x.py", line 1',
      "2026-10-11 15:04:41.556 ERROR (MainThread) [homeassistant.components.mqtt] Failed\nTraceback (most recent call last):\nValueError: bad",
      "2026-10-11 15:04:42.000 WARNING (MainThread) [homeassistant] Slow",
    ]);
  });
});

describe("resumeBacklog", () => {
  test("keeps the latest lines on the first subscription", () => {
    expect(resumeBacklog(["a", "b", "c"], undefined, 2)).toEqual(["b", "c"]);
  });

  test("leaves out what was already sent after a reconnect", () => {
    expect(resumeBacklog(["a", "b", "c", "d"], "b", 1)).toEqual(["c", "d"]);
  });

  test("sends the whole backlog when the last record sent has scrolled out", () => {
    expect(resumeBacklog(["c", "d"], "a", undefined)).toEqual(["c", "d"]);
  });
});

const entry = (name: string, timestamp: number, count = 1): SystemLogEntry => ({
  name,
  message: [`${name} failed`],
  level: "ERROR",
  source: ["components/mqtt/client.py", 10],
  timestamp,
  first_occurred: 1,
  exception: "",
  count,
});

describe("newSystemLogEntries", () => {
  test("only records the first listing", () => {
    expect(newSystemLogEntries(undefined, [entry("a", 5)]).entries).toEqual([]);
  });

  test("returns new entries and repeats, oldest first, but not unchanged ones", () => {
    const { seen } = newSystemLogEntries(undefined, [
      entry("a", 5),
      entry("b", 4),
    ]);

    const next = newSystemLogEntries(seen, [
      entry("c", 9),
      entry("a", 7, 2),
      entry("b", 4),
    ]);

    expect(next.entries.map(({ name }) => name)).toEqual(["a", "c"]);
  });

  test("returns an entry again once Core dropped it and it came back", () => {
    const first = newSystemLogEntries(undefined, [entry("a", 5)]);
    const cleared = newSystemLogEntries(first.seen, []);
    const back = newSystemLogEntries(cleared.seen, [entry("a", 5)]);

    expect(back.entries.map(({ name }) => name)).toEqual(["a"]);
  });
});
