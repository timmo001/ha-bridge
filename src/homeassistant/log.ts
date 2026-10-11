import type { SystemLogEntry } from "@timmo001/effect-ha";
import type { SearchKey } from "../search/Search.js";

// What a system log search looks at, the messages counting most.
export const systemLogKeys: ReadonlyArray<SearchKey<SystemLogEntry>> = [
  { name: "message", weight: 3, getFn: (entry) => entry.message },
  { name: "logger", weight: 2, getFn: (entry) => entry.name },
  { name: "source", weight: 1, getFn: (entry) => entry.source[0] },
  { name: "exception", weight: 1, getFn: (entry) => entry.exception },
];

// An error or warning as one record for searching across logs: its logger,
// messages and traceback.
export const systemLogRecord = (entry: SystemLogEntry) =>
  [entry.name, ...entry.message, entry.exception]
    .filter((part) => part !== "")
    .join("\n");

// A log record is searched as a whole, so a traceback matches by any line.
export const recordKeys: ReadonlyArray<SearchKey<string>> = [
  { name: "record", weight: 1, getFn: (record) => record },
];

// Core's colours, which its live log keeps: ANSI escape codes.
const ansiColours = new RegExp(String.raw`\x1b\[[0-9;]*m`, "g");

export const withoutColours = (text: string) => text.replace(ansiColours, "");

// The start of a record in Core's log, as Core's own log stream finds it.
const coreRecordStart = /^\d{4}-\d{2}-\d{2} \S+ [A-Z]+ \(.*?\) \[[^\]]+\] /;

// Joins Core's log lines into records, so a traceback stays with the error
// it belongs to. Lines before the first record start one of their own.
export const coreRecords = (lines: ReadonlyArray<string>) =>
  lines.reduce<Array<string>>((records, line) => {
    const last = records.at(-1);

    if (last === undefined || coreRecordStart.test(line)) {
      records.push(line);
    } else {
      records[records.length - 1] = `${last}\n${line}`;
    }

    return records;
  }, []);

// Core's records from the latest lines of its log, leaving out the end of a
// record the window started partway through.
export const latestCoreRecords = (lines: ReadonlyArray<string>) => {
  const records = coreRecords(lines);
  const first = records[0];

  return first !== undefined && !coreRecordStart.test(first)
    ? records.slice(1)
    : records;
};

// Core's live log starts every subscription with the end of its log file.
// After a reconnect, that leaves out what was already sent, up to the last
// record sent. The first time, it keeps the latest `lines`.
export const resumeBacklog = (
  backlog: ReadonlyArray<string>,
  lastSent: string | undefined,
  lines: number | undefined,
) => {
  if (lastSent === undefined) {
    return lines === undefined ? backlog : backlog.slice(-lines);
  }

  return backlog.slice(backlog.lastIndexOf(lastSent) + 1);
};

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
