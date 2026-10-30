// The recorder's catch-up batch can arrive after newer live entries, so live
// entries are held until history finishes. A query longer than a day is also
// split, and the newest day arrives before the older remainder; that newer
// day is held until a chunk covers everything up to the cursor.

export interface LogbookCursor<A> {
  // Milliseconds. Entries at or before this time have been delivered.
  readonly deliveredThrough: number;
  // True until the final historical chunk of this subscription arrives.
  readonly awaitingHistory: boolean;
  readonly heldLive: ReadonlyArray<A>;
  // Historical entries from a chunk that starts after deliveredThrough.
  readonly heldHistory: ReadonlyArray<A>;
}

export const initialLogbookCursor = <A>(now: number): LogbookCursor<A> => ({
  deliveredThrough: now,
  awaitingHistory: true,
  heldLive: [],
  heldHistory: [],
});

// A new subscription replays history. Entries held for the previous
// connection were not delivered; the replay covers them.
export const beginLogbookSubscription = <A>(
  cursor: LogbookCursor<A>,
): LogbookCursor<A> => ({
  deliveredThrough: cursor.deliveredThrough,
  awaitingHistory: true,
  heldLive: [],
  heldHistory: [],
});

const timeOf = (entry: { readonly when: string }) => {
  const time = Date.parse(entry.when);

  return Number.isFinite(time) ? time : undefined;
};

const newerThan = <A extends { readonly when: string }>(
  entries: ReadonlyArray<A>,
  deliveredThrough: number,
): ReadonlyArray<A> =>
  entries.filter((entry) => {
    const time = timeOf(entry);

    return time !== undefined && time > deliveredThrough;
  });

const advance = (
  entries: ReadonlyArray<{ readonly when: string }>,
  deliveredThrough: number,
) =>
  entries.reduce(
    (newest, entry) => Math.max(newest, timeOf(entry) ?? newest),
    deliveredThrough,
  );

export interface LogbookBatch<A> {
  readonly past: boolean;
  readonly partial: boolean;
  // Start of a historical chunk, in milliseconds. Live batches omit it.
  readonly startTime?: number | undefined;
  readonly entries: ReadonlyArray<A>;
}

const byTime = <A extends { readonly when: string }>(
  entries: ReadonlyArray<A>,
) => entries.toSorted((a, b) => (timeOf(a) ?? 0) - (timeOf(b) ?? 0));

// The newest day of a long query shares its boundary with the older
// remainder, so the same entry can arrive in both chunks.
const dedupe = <A extends { readonly when: string }>(
  entries: ReadonlyArray<A>,
) => {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    const key = JSON.stringify(entry);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

// A chunk that starts after the last delivered entry leaves a gap. Home
// Assistant fills that gap with a later chunk, so this one has to wait.
const startsAfterGap = <A>(batch: LogbookBatch<A>, deliveredThrough: number) =>
  batch.partial &&
  batch.startTime !== undefined &&
  batch.startTime > deliveredThrough + 1;

export interface LogbookAcceptance<A> {
  readonly cursor: LogbookCursor<A>;
  readonly entries: ReadonlyArray<A>;
}

export const acceptLogbookBatch = <A extends { readonly when: string }>(
  cursor: LogbookCursor<A>,
  batch: LogbookBatch<A>,
): LogbookAcceptance<A> => {
  if (!batch.past) {
    if (cursor.awaitingHistory) {
      return {
        cursor: {
          ...cursor,
          heldLive: [...cursor.heldLive, ...batch.entries],
        },
        entries: [],
      };
    }

    return {
      cursor: {
        ...cursor,
        deliveredThrough: advance(batch.entries, cursor.deliveredThrough),
      },
      entries: batch.entries,
    };
  }

  if (startsAfterGap(batch, cursor.deliveredThrough)) {
    return {
      cursor: {
        ...cursor,
        heldHistory: [...cursor.heldHistory, ...batch.entries],
      },
      entries: [],
    };
  }

  const pending =
    cursor.heldHistory.length === 0
      ? batch.entries
      : dedupe([...batch.entries, ...cursor.heldHistory]);

  const fresh = byTime(newerThan(pending, cursor.deliveredThrough));
  const deliveredThrough = advance(fresh, cursor.deliveredThrough);

  if (batch.partial) {
    return {
      cursor: { ...cursor, deliveredThrough, heldHistory: [] },
      entries: fresh,
    };
  }

  // Live entries are never filtered by time, so a Home Assistant clock behind
  // this machine's does not drop them.
  return {
    cursor: {
      deliveredThrough: advance(cursor.heldLive, deliveredThrough),
      awaitingHistory: false,
      heldLive: [],
      heldHistory: [],
    },
    entries: [...fresh, ...cursor.heldLive],
  };
};
