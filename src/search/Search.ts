import { Context, Effect, Layer } from "effect";
import Fuse from "fuse.js";
import { SearchQueryEmpty } from "@timmo001/effect-ha-bridge";

// Ported from the dot CLI's Search service in timmo001/dotfiles, with a
// larger default limit, a looser gap and an offset for pagination, since a
// Home Assistant instance has far more items to search. Terms are matched
// one at a time like the Home Assistant frontend's multiTermSortedSearch.

/** A weighted field searched by {@link SearchService.fuzzy}. */
export interface SearchKey<T, Name extends string = string> {
  /** Field name reported in {@link SearchResult.matched}. */
  readonly name: Name;
  /** Relative ranking weight; higher counts for more. */
  readonly weight: number;
  /** Field values for an item; arrays match each element separately. */
  readonly getFn: (item: T) => string | readonly string[] | null | undefined;
}

/** How scored results are pruned, ordered and cut. */
export interface SelectOptions {
  /** Drop results scoring below this, from 1 to 100; default 40. */
  readonly minScore?: number;
  /** Drop results more than this many points below the best; default 30. */
  readonly maxGap?: number;
  /** Maximum results, applied after ranking and the offset; default 20. */
  readonly limit?: number;
  /** Results to skip after ranking; default 0. */
  readonly offset?: number;
}

/** Tuning that overrides the {@link SearchService.fuzzy} defaults. */
export interface SearchOverrides extends SelectOptions {
  /** Fuse match threshold per term, from 0 (exact) to 1 (anything); default 0.3. */
  readonly threshold?: number;
  /**
   * Points taken off when a query word appears only inside other words, such
   * as "her" in "weather"; typo matches are not affected. Default 25.
   */
  readonly midWordPenalty?: number;
  /** Shortest matched run of characters that counts; default 2. */
  readonly minMatchCharLength?: number;
}

/** Items, query and fields for one {@link SearchService.fuzzy} call. */
export interface SearchInput<T, Name extends string = string> {
  /** Items to search. */
  readonly items: readonly T[];
  /** Whitespace-separated terms; every term must match some field. */
  readonly query: string;
  /** Searchable fields. */
  readonly keys: readonly SearchKey<T, Name>[];
  /** Name that breaks near-ties by length, so short exact names win. */
  readonly primary: (item: T) => string;
  /** Tuning overrides. */
  readonly overrides?: SearchOverrides;
}

/** One ranked search result. */
export interface SearchResult<T, Name extends string = string> {
  /** Matching item. */
  readonly item: T;
  /** Relevance from 1 to 100; higher is closer. */
  readonly score: number;
  /** Fields that matched the query. */
  readonly matched: readonly Name[];
}

/** Ranked results from one {@link SearchService.fuzzy} call. */
export interface SearchResults<T, Name extends string = string> {
  /** Results after the offset and within the limit, best first. */
  readonly results: readonly SearchResult<T, Name>[];
  /** Close matches before the offset and limit were applied. */
  readonly total: number;
}

/**
 * Drops results far below the best, ranks the rest by score in bands of 5,
 * then by the shorter primary name, then applies the offset and limit.
 * Selecting already selected results again keeps the same order, so results
 * from separate searches can be merged.
 */
export const selectResults = <T, Name extends string>(
  scored: readonly SearchResult<T, Name>[],
  primary: (item: T) => string,
  options: SelectOptions = {},
): SearchResults<T, Name> => {
  const floor = Math.max(
    options.minScore ?? 40,
    Math.max(0, ...scored.map(({ score }) => score)) - (options.maxGap ?? 30),
  );

  const close = scored
    .filter(({ score }) => score >= floor)
    .toSorted(
      (a, b) =>
        Math.round(b.score / 5) - Math.round(a.score / 5) ||
        primary(a.item).length - primary(b.item).length ||
        b.score - a.score,
    );

  const offset = options.offset ?? 0;

  return {
    results: close.slice(offset, offset + (options.limit ?? 20)),
    total: close.length,
  };
};

/** Shared search over in-memory items. */
export interface SearchService {
  /**
   * Typo-tolerant search, loose enough for ambiguous queries from agents and
   * people. Every query word must match some field. See
   * {@link selectResults} for pruning and ordering. `total` counts every
   * close match so callers can say when more are available.
   */
  readonly fuzzy: <T, Name extends string>(
    input: SearchInput<T, Name>,
  ) => Effect.Effect<SearchResults<T, Name>, SearchQueryEmpty>;
}

/** Effect service for {@link SearchService}. */
export class Search extends Context.Service<Search, SearchService>()(
  "ha-bridge/Search",
) {
  /** Fuse.js-backed search with token matching across weighted fields. */
  static readonly layer = Layer.succeed(Search, {
    fuzzy: Effect.fn("Search.fuzzy")(function* <T, Name extends string>({
      items,
      query,
      keys,
      primary,
      overrides = {},
    }: SearchInput<T, Name>) {
      const trimmed = query.trim();

      if (trimmed === "") return yield* new SearchQueryEmpty();

      const fuse = new Fuse(items, {
        keys: keys.map(({ name, weight, getFn }) => ({
          name,
          weight,
          getFn: (item: T) => getFn(item) ?? undefined,
        })),
        threshold: overrides.threshold ?? 0.3,
        minMatchCharLength: overrides.minMatchCharLength ?? 2,
        ignoreDiacritics: true,
        ignoreLocation: true,
        includeScore: true,
        includeMatches: true,
      });

      const names = new Set<string>(keys.map(({ name }) => name));

      const normalise = (value: string) =>
        value
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();

      const terms = normalise(trimmed).split(/\s+/);

      const onlyMidWord = (item: T) => {
        const values = keys
          .flatMap(({ getFn }) => [getFn(item) ?? []].flat())
          .map(normalise);

        const words = values.flatMap((value) => value.split(/[^\p{L}\p{N}]+/u));

        return terms.some(
          (term) =>
            values.some((value) => value.includes(term)) &&
            !words.some((word) => word.startsWith(term)),
        );
      };

      const penalty = overrides.midWordPenalty ?? 25;

      const weights = new Map<string, number>(
        keys.map(({ name, weight }) => [name, weight]),
      );

      const topWeight = Math.max(...weights.values());

      // Fuse scores an exact match in any field as perfect, so a term is
      // scaled by the weight of the heaviest field it matched: matching only
      // an area ranks below matching the name.
      const keyFactor = (matched: ReadonlyArray<string | undefined>) =>
        Math.max(
          0,
          ...matched.map((key) =>
            key === undefined ? 0 : (weights.get(key) ?? 0) / topWeight,
          ),
        );

      // Each term is searched separately, as the frontend's quick bar does,
      // so terms spread across fields (a name and an area) still score well.
      // An item must match every term; its score is the mean term score.
      const perTerm = terms.map(
        (term) =>
          new Map(
            fuse.search(term).map(({ refIndex, score, matches }) => {
              const matched = (matches ?? []).map(({ key }) => key);

              return [
                refIndex,
                {
                  score: (1 - (score ?? 1)) * keyFactor(matched),
                  keys: matched,
                },
              ];
            }),
          ),
      );

      const [first = new Map(), ...rest] = perTerm;

      const scored = Array.from(first.keys()).flatMap(
        (index): Array<SearchResult<T, Name>> => {
          const matches = perTerm.map((term) => term.get(index));

          if (rest.some((term) => !term.has(index))) {
            return [];
          }

          const item = items[index];

          if (item === undefined) {
            return [];
          }

          const mean =
            matches.reduce((sum, match) => sum + (match?.score ?? 0), 0) /
            terms.length;

          return [
            {
              item,
              score: Math.max(
                1,
                Math.round(mean * 100) - (onlyMidWord(item) ? penalty : 0),
              ),
              matched: [
                ...new Set(matches.flatMap((match) => match?.keys ?? [])),
              ].filter(
                (key): key is Name => key !== undefined && names.has(key),
              ),
            },
          ];
        },
      );

      return selectResults(scored, primary, overrides);
    }),
  });
}
