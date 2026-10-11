import { describe, expect, test } from "bun:test";
import type { SystemLogEntry } from "@timmo001/effect-ha";
import { newSystemLogEntries } from "./log.js";

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
