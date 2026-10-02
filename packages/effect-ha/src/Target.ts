import { Schema } from "effect";

const Ids = Schema.Union([Schema.String, Schema.Array(Schema.String)]);

// What an action applies to, as in Home Assistant's action targets. Entity
// actions also take `all` for `entity_id` and `none` for the other fields.
export const Target = Schema.Struct({
  entity_id: Schema.optionalKey(Ids),
  device_id: Schema.optionalKey(Ids),
  area_id: Schema.optionalKey(Ids),
  floor_id: Schema.optionalKey(Ids),
  label_id: Schema.optionalKey(Ids),
});

export type Target = typeof Target.Type;

export const targetFields = [
  "entity_id",
  "device_id",
  "area_id",
  "floor_id",
  "label_id",
] as const;

export type TargetField = (typeof targetFields)[number];

// What a target refers to, from `extract_from_target`. Referenced entities
// include those reached through a device, area, floor or label; the missing
// lists hold IDs Home Assistant doesn't know.
export const ExtractedTarget = Schema.Struct({
  referenced_entities: Schema.Array(Schema.String),
  referenced_devices: Schema.Array(Schema.String),
  referenced_areas: Schema.Array(Schema.String),
  missing_devices: Schema.Array(Schema.String),
  missing_areas: Schema.Array(Schema.String),
  missing_floors: Schema.Array(Schema.String),
  missing_labels: Schema.Array(Schema.String),
});

export type ExtractedTarget = typeof ExtractedTarget.Type;

// `extract_from_target` options. `primaryEntitiesOnly` leaves out config and
// diagnostic entities reached indirectly, and defaults to true like Core.
export interface ExtractTargetOptions {
  readonly expandGroup?: boolean;
  readonly primaryEntitiesOnly?: boolean;
}
