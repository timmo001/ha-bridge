import { Option, Schema } from "effect";

const EntityContext = Schema.Struct({
  id: Schema.String,
  parent_id: Schema.optionalKey(Schema.NullOr(Schema.String)),
  user_id: Schema.optionalKey(Schema.NullOr(Schema.String)),
});

// Everything past `state` is optional: a frame that fails to decode is dropped
// whole, and `get_states` decodes every state as one array.
export const EntityState = Schema.Struct({
  entity_id: Schema.String,
  state: Schema.String,
  attributes: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
  last_changed: Schema.optionalKey(Schema.String),
  last_reported: Schema.optionalKey(Schema.String),
  last_updated: Schema.optionalKey(Schema.String),
  context: Schema.optionalKey(EntityContext),
});

export type EntityState = typeof EntityState.Type;

const attribute =
  <A>(schema: Schema.Codec<A>) =>
  (state: EntityState, name: string): A | undefined =>
    Option.getOrUndefined(
      Schema.decodeUnknownOption(schema)(state.attributes?.[name]),
    );

export const stringAttribute = attribute(Schema.String);

export const numberAttribute = attribute(Schema.Finite);

export const friendlyName = (state: EntityState): string =>
  stringAttribute(state, "friendly_name") ?? "";

export const stateWithUnit = (state: EntityState): string => {
  const unit = stringAttribute(state, "unit_of_measurement");

  return unit ? `${state.state} ${unit}` : state.state;
};
