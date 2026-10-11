import type { SystemLogEntry } from "@timmo001/effect-ha";
import type { SearchKey } from "../search/Search.js";

// What a system log search looks at, the messages counting most.
export const systemLogKeys: ReadonlyArray<SearchKey<SystemLogEntry>> = [
  { name: "message", weight: 3, getFn: (entry) => entry.message },
  { name: "logger", weight: 2, getFn: (entry) => entry.name },
  { name: "source", weight: 1, getFn: (entry) => entry.source[0] },
  { name: "exception", weight: 1, getFn: (entry) => entry.exception },
];

// Core merges repeats of an error into one entry by logger, source and
// traceback, keeping the first traceback, so these stay the same across
// repeats.
const systemLogKey = (entry: SystemLogEntry) =>
  [entry.name, ...entry.source, entry.exception].join("\u0000");

// When each listed entry last happened, by key.
export type SystemLogSeen = ReadonlyMap<string, number>;

// The entries that are new or happened again since the last listing, oldest
// first. The first listing only records what's there.
export const newSystemLogEntries = (
  seen: SystemLogSeen | undefined,
  entries: ReadonlyArray<SystemLogEntry>,
) => {
  const next: SystemLogSeen = new Map(
    entries.map((entry) => [systemLogKey(entry), entry.timestamp]),
  );

  if (seen === undefined) {
    return { entries: [], seen: next };
  }

  return {
    entries: entries
      .filter((entry) => {
        const last = seen.get(systemLogKey(entry));

        return last === undefined || entry.timestamp > last;
      })
      .toSorted((a, b) => a.timestamp - b.timestamp),
    seen: next,
  };
};
