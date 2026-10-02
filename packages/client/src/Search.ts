import { Schema } from "effect";

export const SearchKind = Schema.Literals(["entity", "device", "area"]);

export type SearchKind = typeof SearchKind.Type;

export const SearchRequest = Schema.Struct({
  // Whitespace-separated terms; every term must match some field.
  query: Schema.String,
  // Defaults to every kind.
  kinds: Schema.optional(Schema.Array(SearchKind)),
  // Entity domain, such as light. Devices and areas match when one of their
  // entities does.
  domain: Schema.optional(Schema.String),
  // Area ID or name.
  area: Schema.optional(Schema.String),
  // Entity device class, such as temperature. Devices and areas match when
  // one of their entities does.
  deviceClass: Schema.optional(Schema.String),
  // Defaults to 20.
  limit: Schema.optional(Schema.Int.check(Schema.isGreaterThan(0))),
  // Results to skip before the limit, for pagination.
  offset: Schema.optional(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
});

export type SearchRequest = typeof SearchRequest.Type;

export const SearchMatch = Schema.Struct({
  kind: SearchKind,
  // Entity ID, device ID or area ID.
  id: Schema.String,
  // The name Home Assistant dashboards show.
  name: Schema.String,
  // Relevance from 1 to 100; higher is closer.
  score: Schema.Finite,
  // Fields that matched the query.
  matched: Schema.Array(Schema.String),
  domain: Schema.optional(Schema.String),
  deviceClass: Schema.optional(Schema.String),
  device: Schema.optional(Schema.String),
  parentDevice: Schema.optional(Schema.String),
  area: Schema.optional(Schema.String),
  floor: Schema.optional(Schema.String),
});

export type SearchMatch = typeof SearchMatch.Type;

export const SearchResults = Schema.Struct({
  results: Schema.Array(SearchMatch),
  // Close matches before the offset and limit were applied.
  total: Schema.Int,
  // Registries the bridge could not load, so names and filters relying on
  // them are missing, such as area_registry.
  unavailable: Schema.Array(Schema.String),
});

export type SearchResults = typeof SearchResults.Type;

export class SearchQueryEmpty extends Schema.TaggedError<SearchQueryEmpty>()(
  "SearchQueryEmpty",
  {},
) {}
