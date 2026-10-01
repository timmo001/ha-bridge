import { Option, Schema } from "effect";

export const EntityState = Schema.Struct({
  entity_id: Schema.String,
  state: Schema.String,
  attributes: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
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
