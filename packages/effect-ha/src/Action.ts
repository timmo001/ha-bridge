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

// Unset optional fields are left out, so Home Assistant applies its defaults.
const onEntity = (
  action: string,
  entityId: string,
  data?: Readonly<Record<string, Schema.Json | undefined>>,
): Action => {
  const target = { entity_id: entityId };
  const fields = definedFields(data);

  return fields === undefined
    ? { action, target }
    : { action, data: fields, target };
};

const definedFields = (
  data: Readonly<Record<string, Schema.Json | undefined>> | undefined,
) => {
  const fields: Record<string, Schema.Json> = {};

  for (const [key, value] of Object.entries(data ?? {})) {
    if (value !== undefined) {
      fields[key] = value;
    }
  }

  return Object.keys(fields).length === 0 ? undefined : fields;
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

// Fails when more than one of `keys` is set, like Core's `Exclusive` groups.
const exclusive = <T extends object>(
  group: string,
  keys: ReadonlyArray<keyof T & string>,
) =>
  Schema.makeFilter<T>((input) => {
    const set = keys.filter((key) => Object.hasOwn(input, key));

    return (
      set.length <= 1 || `set only one ${group} field, not ${set.join(", ")}`
    );
  });

const between = (minimum: number, maximum: number) =>
  Schema.Finite.check(Schema.isBetween({ minimum, maximum }));

const Byte = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 255 }));

const LightFlash = Schema.Literals(["short", "long"]);

// `light.turn_off` data. Core clamps `transition` to 0-6553 seconds.
export const LightTurnOffData = Schema.Struct({
  transition: Schema.optionalKey(Schema.Finite),
  flash: Schema.optionalKey(LightFlash),
});

export type LightTurnOffData = typeof LightTurnOffData.Type;

// `light.turn_on` and `light.toggle` data. Set at most one brightness field
// and one colour field. Core clamps `brightness` to 0-255, `brightness_step`
// to -255-255 and `brightness_step_pct` to -100-100.
const LightTurnOnFields = Schema.Struct({
  transition: Schema.optionalKey(Schema.Finite),
  brightness: Schema.optionalKey(Schema.Int),
  brightness_pct: Schema.optionalKey(between(0, 100)),
  brightness_step: Schema.optionalKey(Schema.Int),
  brightness_step_pct: Schema.optionalKey(Schema.Finite),
  profile: Schema.optionalKey(Schema.String),
  color_name: Schema.optionalKey(Schema.String),
  color_temp_kelvin: Schema.optionalKey(
    Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  ),
  hs_color: Schema.optionalKey(
    Schema.Tuple([between(0, 360), between(0, 100)]),
  ),
  rgb_color: Schema.optionalKey(Schema.Tuple([Byte, Byte, Byte])),
  rgbw_color: Schema.optionalKey(Schema.Tuple([Byte, Byte, Byte, Byte])),
  rgbww_color: Schema.optionalKey(Schema.Tuple([Byte, Byte, Byte, Byte, Byte])),
  xy_color: Schema.optionalKey(Schema.Tuple([between(0, 1), between(0, 1)])),
  white: Schema.optionalKey(Schema.Union([Schema.Literal(true), Byte])),
  flash: Schema.optionalKey(LightFlash),
  effect: Schema.optionalKey(Schema.String),
});

type LightTurnOnFields = typeof LightTurnOnFields.Type;

export const LightTurnOnData = LightTurnOnFields.check(
  exclusive<LightTurnOnFields>("brightness", [
    "brightness",
    "brightness_pct",
    "brightness_step",
    "brightness_step_pct",
  ]),
  exclusive<LightTurnOnFields>("colour", [
    "profile",
    "color_name",
    "color_temp_kelvin",
    "hs_color",
    "rgb_color",
    "rgbw_color",
    "rgbww_color",
    "xy_color",
    "white",
  ]),
);

export type LightTurnOnData = typeof LightTurnOnData.Type;

export const Light = {
  turnOn: (entityId: EntityId<"light">, data?: LightTurnOnData) =>
    onEntity("light.turn_on", entityId, data),
  turnOff: (entityId: EntityId<"light">, data?: LightTurnOffData) =>
    onEntity("light.turn_off", entityId, data),
  toggle: (entityId: EntityId<"light">, data?: LightTurnOnData) =>
    onEntity("light.toggle", entityId, data),
};

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

// `speed` must be one of the cover's `supported_speeds`.
export interface CoverMoveOptions {
  readonly speed?: string;
}

export const Cover = {
  open: (entityId: EntityId<"cover">, options?: CoverMoveOptions) =>
    onEntity("cover.open_cover", entityId, { speed: options?.speed }),
  close: (entityId: EntityId<"cover">, options?: CoverMoveOptions) =>
    onEntity("cover.close_cover", entityId, { speed: options?.speed }),
  toggle: (entityId: EntityId<"cover">) => onEntity("cover.toggle", entityId),
  stop: (entityId: EntityId<"cover">) => onEntity("cover.stop_cover", entityId),
  setPosition: (
    entityId: EntityId<"cover">,
    position: number,
    options?: CoverMoveOptions,
  ) =>
    onEntity("cover.set_cover_position", entityId, {
      position,
      speed: options?.speed,
    }),
  openTilt: (entityId: EntityId<"cover">) =>
    onEntity("cover.open_cover_tilt", entityId),
  closeTilt: (entityId: EntityId<"cover">) =>
    onEntity("cover.close_cover_tilt", entityId),
  toggleTilt: (entityId: EntityId<"cover">) =>
    onEntity("cover.toggle_cover_tilt", entityId),
  stopTilt: (entityId: EntityId<"cover">) =>
    onEntity("cover.stop_cover_tilt", entityId),
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
