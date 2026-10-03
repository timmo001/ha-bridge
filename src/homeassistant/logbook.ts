// Home Assistant's logbook stream sends historical entries, may then send
// live ones, and only afterwards sends the recorder's catch-up batch. The
// catch-up entries are older than those live ones. A cursor that jumps to
// the newest live entry drops the catch-up, including entries from a gap
// the watch is supposed to keep.

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
) => {
  let newest = deliveredThrough;

  for (const entry of entries) {
    const time = timeOf(entry);

    if (time !== undefined && time > newest) {
      newest = time;
    }
  }

  return newest;
};

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

    const entries = newerThan(batch.entries, cursor.deliveredThrough);

    return {
      cursor: {
        ...cursor,
        deliveredThrough: advance(entries, cursor.deliveredThrough),
      },
      entries,
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

  // Live entries are strictly after the catch-up window, so anything not
  // already delivered is still new once the catch-up has moved the cursor.
  const live = newerThan(cursor.heldLive, deliveredThrough);

  return {
    cursor: {
      deliveredThrough: advance(live, deliveredThrough),
      awaitingHistory: false,
      heldLive: [],
    },
    entries: [...fresh, ...live],
  };
};
