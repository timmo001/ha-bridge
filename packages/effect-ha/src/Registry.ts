import { Schema } from "effect";

const OptionalString = Schema.optionalKey(Schema.NullOr(Schema.String));

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
