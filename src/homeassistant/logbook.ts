// The recorder's catch-up batch can arrive after newer live entries, so live
// entries are held until history finishes.

export interface LogbookCursor<A> {
  // Milliseconds. Entries at or before this time have been delivered.
  readonly deliveredThrough: number;
  // True until the final historical chunk of this subscription arrives.
  readonly awaitingHistory: boolean;
  readonly heldLive: ReadonlyArray<A>;
}

export const initialLogbookCursor = <A>(now: number): LogbookCursor<A> => ({
  deliveredThrough: now,
  awaitingHistory: true,
  heldLive: [],
});

// A new subscription replays history. Live entries held for the previous
// connection were not delivered; the replay covers them.
export const beginLogbookSubscription = <A>(
  cursor: LogbookCursor<A>,
): LogbookCursor<A> => ({
  deliveredThrough: cursor.deliveredThrough,
  awaitingHistory: true,
  heldLive: [],
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
  readonly entries: ReadonlyArray<A>;
}

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

  const fresh = newerThan(batch.entries, cursor.deliveredThrough);
  const deliveredThrough = advance(fresh, cursor.deliveredThrough);

  if (batch.partial) {
    return {
      cursor: { ...cursor, deliveredThrough },
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
    },
    entries: [...fresh, ...cursor.heldLive],
  };
};
