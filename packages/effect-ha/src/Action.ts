import { Schema } from "effect";

const Ids = Schema.Union([Schema.String, Schema.Array(Schema.String)]);

// What an action applies to, as in Home Assistant's action targets.
export const Target = Schema.Struct({
  entity_id: Schema.optionalKey(Ids),
  device_id: Schema.optionalKey(Ids),
  area_id: Schema.optionalKey(Ids),
  floor_id: Schema.optionalKey(Ids),
  label_id: Schema.optionalKey(Ids),
});

export type Target = typeof Target.Type;

// A Home Assistant action, such as `light.turn_on`, in the shape automations use.
export const Action = Schema.Struct({
  action: Schema.String.check(Schema.isPattern(/^[a-z0-9_]+\.[a-z0-9_]+$/)),
  data: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
  target: Schema.optionalKey(Target),
  return_response: Schema.optionalKey(Schema.Boolean),
});

export type Action = typeof Action.Type;

export type EntityId<Domain extends string> = `${Domain}.${string}`;

const onEntity = (
  action: string,
  entityId: string,
  data?: Record<string, Schema.Json>,
): Action => {
  const target = { entity_id: entityId };

  return data === undefined ? { action, target } : { action, data, target };
};

const switchable = <const Domain extends string>(domain: Domain) => ({
  turnOn: (entityId: EntityId<Domain>) =>
    onEntity(`${domain}.turn_on`, entityId),
  turnOff: (entityId: EntityId<Domain>) =>
    onEntity(`${domain}.turn_off`, entityId),
  toggle: (entityId: EntityId<Domain>) =>
    onEntity(`${domain}.toggle`, entityId),
});

// Reloads a helper domain's YAML configuration.
const reload = (domain: string) => (): Action => ({
  action: `${domain}.reload`,
});

export const InputBoolean = {
  ...switchable("input_boolean"),
  reload: reload("input_boolean"),
};

export const Light = switchable("light");

export const Switch = switchable("switch");

export const InputNumber = {
  reload: reload("input_number"),
  setValue: (entityId: EntityId<"input_number">, value: number) =>
    onEntity("input_number.set_value", entityId, { value }),
  increment: (entityId: EntityId<"input_number">) =>
    onEntity("input_number.increment", entityId),
  decrement: (entityId: EntityId<"input_number">) =>
    onEntity("input_number.decrement", entityId),
};

export const Cover = {
  close: (entityId: EntityId<"cover">) =>
    onEntity("cover.close_cover", entityId),
  setPosition: (entityId: EntityId<"cover">, position: number) =>
    onEntity("cover.set_cover_position", entityId, { position }),
  setTiltPosition: (entityId: EntityId<"cover">, tiltPosition: number) =>
    onEntity("cover.set_cover_tilt_position", entityId, {
      tilt_position: tiltPosition,
    }),
};

export const Climate = {
  setFanMode: (entityId: EntityId<"climate">, fanMode: string) =>
    onEntity("climate.set_fan_mode", entityId, { fan_mode: fanMode }),
};

export const AssistSatellite = {
  announce: (target: Target, message: string): Action => ({
    action: "assist_satellite.announce",
    data: { message },
    target,
  }),
};
