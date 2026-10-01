import { Schema } from "effect";

// The parts of Home Assistant's `get_config` result most clients need.
export const HomeAssistantConfig = Schema.Struct({
  location_name: Schema.String,
  time_zone: Schema.String,
  language: Schema.String,
  country: Schema.NullOr(Schema.String),
  currency: Schema.String,
  version: Schema.String,
  unit_system: Schema.Record(Schema.String, Schema.String),
});

export type HomeAssistantConfig = typeof HomeAssistantConfig.Type;
