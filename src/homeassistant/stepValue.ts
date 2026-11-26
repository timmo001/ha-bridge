import {
  type Action,
  Climate,
  Counter,
  Cover,
  type EntityState,
  Humidifier,
  InputNumber,
  Light,
  MediaPlayer,
  NumberEntity,
  numberAttribute,
  Valve,
  WaterHeater,
} from "@timmo001/effect-ha";
import type { StepSetting } from "@timmo001/effect-ha-bridge";

export interface Range {
  readonly min: number;
  readonly max: number;
}

export interface StepSpec {
  // Says what the entity lacks when it has no current value.
  readonly label: string;
  readonly current: (state: EntityState) => number | undefined;
  readonly range: (state: EntityState) => Range;
  // The entity's own step size, when it reports one.
  readonly ownStep: (state: EntityState) => number | undefined;
  // Used without an own step; `temperature` is 1 in °F and 0.5 otherwise.
  readonly defaultStep: number | "temperature";
  // Sent as a whole number, such as a position or a percentage.
  readonly whole: boolean;
  // Still moving towards the value an earlier step set.
  readonly moving: (state: EntityState) => boolean;
  readonly toAction: (entityId: string, value: number) => Action;
}

const percent: Range = { min: 0, max: 100 };

const rangeFrom =
  (minName: string, maxName: string, fallback: Range) =>
  (state: EntityState): Range => ({
    min: numberAttribute(state, minName) ?? fallback.min,
    max: numberAttribute(state, maxName) ?? fallback.max,
  });

const unbounded: Range = {
  min: Number.NEGATIVE_INFINITY,
  max: Number.POSITIVE_INFINITY,
};

const attributeValue = (name: string) => (state: EntityState) =>
  numberAttribute(state, name);

const stateValue = (state: EntityState) => {
  const value = state.state.trim() === "" ? Number.NaN : Number(state.state);

  return Number.isFinite(value) ? value : undefined;
};

const ownAttribute = (name: string) => (state: EntityState) => {
  const step = numberAttribute(state, name);

  return step !== undefined && step > 0 ? step : undefined;
};

const never = () => false;

const travelling = (state: EntityState) =>
  state.state === "opening" || state.state === "closing";

const entity = (entityId: string) => ({ entity_id: entityId });

// A light that only turns on and off has no brightness to step.
const dimmable = (state: EntityState) => {
  const modes = state.attributes?.["supported_color_modes"];

  return (
    Array.isArray(modes) &&
    modes.some((mode) => mode !== "onoff" && mode !== "unknown")
  );
};

// In percent. An off light is at 0, and Home Assistant turns a light off at
// 0, so stepping up turns it on.
const lightBrightness = (state: EntityState) => {
  if (!dimmable(state)) {
    return undefined;
  }

  if (state.state === "off") {
    return 0;
  }

  const brightness = numberAttribute(state, "brightness");

  return brightness === undefined ? undefined : (brightness / 255) * 100;
};

export const stepSpecs: Record<StepSetting, StepSpec> = {
  "cover.position": {
    label: "position",
    current: attributeValue("current_position"),
    range: () => percent,
    ownStep: () => undefined,
    defaultStep: 10,
    whole: true,
    moving: travelling,
    toAction: (entityId, value) => Cover.setPosition(entity(entityId), value),
  },
  "cover.tilt_position": {
    label: "tilt position",
    current: attributeValue("current_tilt_position"),
    range: () => percent,
    ownStep: () => undefined,
    defaultStep: 10,
    whole: true,
    moving: travelling,
    toAction: (entityId, value) =>
      Cover.setTiltPosition(entity(entityId), value),
  },
  "valve.position": {
    label: "position",
    current: attributeValue("current_position"),
    range: () => percent,
    ownStep: () => undefined,
    defaultStep: 10,
    whole: true,
    moving: travelling,
    toAction: (entityId, value) => Valve.setPosition(entity(entityId), value),
  },
  "light.brightness": {
    label: "brightness",
    current: lightBrightness,
    range: () => percent,
    ownStep: () => undefined,
    defaultStep: 10,
    whole: true,
    moving: never,
    toAction: (entityId, value) =>
      Light.turnOn(entity(entityId), { brightness_pct: value }),
  },
  "climate.temperature": {
    label: "single target temperature",
    current: attributeValue("temperature"),
    range: rangeFrom("min_temp", "max_temp", unbounded),
    ownStep: ownAttribute("target_temp_step"),
    defaultStep: "temperature",
    whole: false,
    moving: never,
    toAction: (entityId, value) =>
      Climate.setTemperature(entity(entityId), { temperature: value }),
  },
  "climate.humidity": {
    label: "target humidity",
    current: attributeValue("humidity"),
    range: rangeFrom("min_humidity", "max_humidity", percent),
    ownStep: ownAttribute("target_humidity_step"),
    defaultStep: 1,
    whole: true,
    moving: never,
    toAction: (entityId, value) => Climate.setHumidity(entity(entityId), value),
  },
  "humidifier.humidity": {
    label: "target humidity",
    current: attributeValue("humidity"),
    range: rangeFrom("min_humidity", "max_humidity", percent),
    ownStep: ownAttribute("target_humidity_step"),
    defaultStep: 1,
    whole: true,
    moving: never,
    toAction: (entityId, value) =>
      Humidifier.setHumidity(entity(entityId), value),
  },
  "water_heater.temperature": {
    label: "target temperature",
    current: attributeValue("temperature"),
    range: rangeFrom("min_temp", "max_temp", unbounded),
    ownStep: ownAttribute("target_temp_step"),
    defaultStep: "temperature",
    whole: false,
    moving: never,
    toAction: (entityId, value) =>
      WaterHeater.setTemperature(entity(entityId), value),
  },
  "number.value": {
    label: "value",
    current: stateValue,
    range: rangeFrom("min", "max", unbounded),
    ownStep: ownAttribute("step"),
    defaultStep: 1,
    whole: false,
    moving: never,
    toAction: (entityId, value) =>
      NumberEntity.setValue(entity(entityId), value),
  },
  "input_number.value": {
    label: "value",
    current: stateValue,
    range: rangeFrom("min", "max", unbounded),
    ownStep: ownAttribute("step"),
    defaultStep: 1,
    whole: false,
    moving: never,
    toAction: (entityId, value) =>
      InputNumber.setValue(entity(entityId), value),
  },
  "counter.value": {
    label: "count",
    current: stateValue,
    range: rangeFrom("minimum", "maximum", unbounded),
    ownStep: ownAttribute("step"),
    defaultStep: 1,
    whole: true,
    moving: never,
    toAction: (entityId, value) => Counter.setValue(entity(entityId), value),
  },
  "media_player.volume": {
    label: "volume",
    current: attributeValue("volume_level"),
    range: () => ({ min: 0, max: 1 }),
    ownStep: () => undefined,
    defaultStep: 0.1,
    whole: false,
    moving: never,
    toAction: (entityId, value) =>
      MediaPlayer.setVolume(entity(entityId), value),
  },
};

/** How long a step's value is built on, from the last step. */
export const stepMemoryMillis = 5_000;

/** How long it's built on while a cover or valve still reports moving. */
export const movingMemoryMillis = 60_000;

export interface Remembered {
  readonly value: number;
  readonly at: number;
}

// Steps in quick succession build on the value the last one set: a moving
// cover reports its position late, so the reported value would lose them.
export const startValue = (
  reported: number | undefined,
  remembered: Remembered | undefined,
  now: number,
  moving: boolean,
) => {
  if (remembered === undefined) {
    return reported;
  }

  const age = now - remembered.at;

  return age < stepMemoryMillis || (moving && age < movingMemoryMillis)
    ? remembered.value
    : reported;
};

const decimals = (value: number) => {
  const [, fraction = ""] = value.toString().split(".");

  return Math.min(fraction.length, 10);
};

// Rounds away floating point noise, such as 0.1 + 0.2, to the precision of
// the start and the step, then keeps the result within the range.
export const nextValue = (options: {
  readonly start: number;
  readonly step: number;
  readonly direction: "increase" | "decrease";
  readonly range: Range;
  readonly whole: boolean;
}) => {
  const { start, step, direction, range, whole } = options;
  const raw = direction === "increase" ? start + step : start - step;

  const rounded = whole
    ? Math.round(raw)
    : Number(raw.toFixed(Math.max(decimals(start), decimals(step))));

  return Math.min(range.max, Math.max(range.min, rounded));
};
