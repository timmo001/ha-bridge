import { Schema } from "effect";
import { Target } from "@timmo001/effect-ha";

// A number Home Assistant can set but has no action to raise or lower by any
// step, named `<domain>.<setting>`. Volume, input number and counter values
// have actions that step by the entity's own size only.
export const StepSetting = Schema.Literals([
  "cover.position",
  "cover.tilt_position",
  "valve.position",
  "light.brightness",
  "climate.temperature",
  "climate.humidity",
  "humidifier.humidity",
  "water_heater.temperature",
  "number.value",
  "input_number.value",
  "counter.value",
  "media_player.volume",
]);

export type StepSetting = typeof StepSetting.Type;

// Raises or lowers a setting on every entity the target refers to, from its
// current value and within its range. `step` defaults to the entity's own
// step size, such as `target_temp_step`, or 10 for percentages.
export const StepRequest = Schema.Struct({
  target: Target,
  setting: StepSetting,
  direction: Schema.Literals(["increase", "decrease"]),
  step: Schema.optionalKey(Schema.Finite.check(Schema.isGreaterThan(0))),
});

export type StepRequest = typeof StepRequest.Type;

// The value each entity was set to.
export const StepResult = Schema.Struct({
  entity_id: Schema.String,
  value: Schema.Finite,
});

export type StepResult = typeof StepResult.Type;
