import { Schema } from "effect";

const OptionalString = Schema.optionalKey(Schema.NullOr(Schema.String));

const NullableString = Schema.NullOr(Schema.String);

// `config/area_registry/list`
export const AreaRegistry = Schema.Array(
  Schema.Struct({
    area_id: Schema.String,
    name: Schema.String,
    floor_id: OptionalString,
  }),
);

export type AreaRegistry = typeof AreaRegistry.Type;

// `config/floor_registry/list`
export const FloorRegistry = Schema.Array(
  Schema.Struct({
    floor_id: Schema.String,
    name: Schema.String,
  }),
);

export type FloorRegistry = typeof FloorRegistry.Type;

// `config/label_registry/list`
export const LabelRegistry = Schema.Array(
  Schema.Struct({
    label_id: Schema.String,
    name: Schema.String,
  }),
);

export type LabelRegistry = typeof LabelRegistry.Type;

// One label as `config/label_registry/list`, `create` and `update` send it.
// `color` is a theme colour, such as indigo, or a hex colour.
export const Label = Schema.Struct({
  label_id: Schema.String,
  name: Schema.String,
  icon: NullableString,
  color: NullableString,
  description: NullableString,
});

export type Label = typeof Label.Type;

// One category as `config/category_registry/list`, `create` and `update`
// send it. Categories belong to a scope, such as automation, script, scene
// or helpers, and their IDs are ULIDs.
export const Category = Schema.Struct({
  category_id: Schema.String,
  name: Schema.String,
  icon: NullableString,
});

export type Category = typeof Category.Type;

// The registry fields of an entity that labels, categories and areas
// change, from `config/entity_registry/get_entries` and `update`.
// `categories` maps each scope to a category ID. `area_id` is the entity's
// own area; without one, it follows its device's.
export const EntityRegistryEntry = Schema.Struct({
  entity_id: Schema.String,
  name: OptionalString,
  original_name: OptionalString,
  device_id: OptionalString,
  area_id: OptionalString,
  labels: Schema.Array(Schema.String),
  categories: Schema.Record(Schema.String, Schema.String),
});

export type EntityRegistryEntry = typeof EntityRegistryEntry.Type;

// The same for a device, from `config/device_registry/list` and `update`.
// Child devices carry these fields too.
export const DeviceRegistryEntry = Schema.Struct({
  id: Schema.String,
  name: OptionalString,
  name_by_user: OptionalString,
  area_id: OptionalString,
  labels: Schema.Array(Schema.String),
});

export type DeviceRegistryEntry = typeof DeviceRegistryEntry.Type;

// The same for an area, from `config/area_registry/list` and `update`.
export const AreaRegistryEntry = Schema.Struct({
  area_id: Schema.String,
  name: Schema.String,
  labels: Schema.Array(Schema.String),
});

export type AreaRegistryEntry = typeof AreaRegistryEntry.Type;
