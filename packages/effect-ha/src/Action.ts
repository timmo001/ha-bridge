import { Effect, Schema } from "effect";
import { HomeAssistantError } from "./HomeAssistantError.js";

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

type ActionData = Readonly<Record<string, Schema.Json | undefined>>;

// Unset optional fields are left out, so Home Assistant applies its defaults.
const onTarget = (
  action: string,
  target: Target,
  data?: ActionData,
): Action => {
  const fields = definedFields(data);

  return fields === undefined
    ? { action, target }
    : { action, data: fields, target };
};

const onEntity = (action: string, entityId: string, data?: ActionData) =>
  onTarget(action, { entity_id: entityId }, data);

const definedFields = (data: ActionData | undefined) => {
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

// Fails unless at least one of `keys` is set, like Core's `AtLeastOne`.
const atLeastOne = <T extends object>(keys: ReadonlyArray<keyof T & string>) =>
  Schema.makeFilter<T>(
    (input) =>
      keys.some((key) => Object.hasOwn(input, key)) ||
      `set at least one of ${keys.join(", ")}`,
  );

// Fails unless all or none of `keys` are set, like Core's `Inclusive` groups.
const inclusive = <T extends object>(keys: ReadonlyArray<keyof T & string>) =>
  Schema.makeFilter<T>((input) => {
    const set = keys.filter((key) => Object.hasOwn(input, key));

    return (
      set.length === 0 ||
      set.length === keys.length ||
      `set ${keys.join(" and ")} together`
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

export const HvacMode = Schema.Literals([
  "off",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "dry",
  "fan_only",
]);

export type HvacMode = typeof HvacMode.Type;

// `climate.set_temperature` data, in the instance's temperature unit. Set
// `temperature`, or `target_temp_low` and `target_temp_high` together, or all
// three. Core checks each value against the entity's `min_temp` and `max_temp`.
const ClimateSetTemperatureFields = Schema.Struct({
  temperature: Schema.optionalKey(Schema.Finite),
  target_temp_high: Schema.optionalKey(Schema.Finite),
  target_temp_low: Schema.optionalKey(Schema.Finite),
  hvac_mode: Schema.optionalKey(HvacMode),
});

type ClimateSetTemperatureFields = typeof ClimateSetTemperatureFields.Type;

export const ClimateSetTemperatureData = ClimateSetTemperatureFields.check(
  atLeastOne<ClimateSetTemperatureFields>([
    "temperature",
    "target_temp_high",
    "target_temp_low",
  ]),
  inclusive<ClimateSetTemperatureFields>([
    "target_temp_low",
    "target_temp_high",
  ]),
  Schema.makeFilter<ClimateSetTemperatureFields>(
    ({ target_temp_low: low, target_temp_high: high }) =>
      low === undefined ||
      high === undefined ||
      low <= high ||
      "target_temp_low must not be higher than target_temp_high",
  ),
);

export type ClimateSetTemperatureData = typeof ClimateSetTemperatureData.Type;

// Mode names other than `hvac_mode` come from the entity's attributes, such as
// `preset_modes` and `fan_modes`. Core checks `humidity` against the entity's
// `min_humidity` and `max_humidity`.
export const Climate = {
  ...switchable("climate"),
  setHvacMode: (entityId: EntityId<"climate">, hvacMode: HvacMode) =>
    onEntity("climate.set_hvac_mode", entityId, { hvac_mode: hvacMode }),
  setTemperature: (
    entityId: EntityId<"climate">,
    data: ClimateSetTemperatureData,
  ) => onEntity("climate.set_temperature", entityId, data),
  setHumidity: (entityId: EntityId<"climate">, humidity: number) =>
    onEntity("climate.set_humidity", entityId, { humidity }),
  setPresetMode: (entityId: EntityId<"climate">, presetMode: string) =>
    onEntity("climate.set_preset_mode", entityId, { preset_mode: presetMode }),
  setFanMode: (entityId: EntityId<"climate">, fanMode: string) =>
    onEntity("climate.set_fan_mode", entityId, { fan_mode: fanMode }),
  setSwingMode: (entityId: EntityId<"climate">, swingMode: string) =>
    onEntity("climate.set_swing_mode", entityId, { swing_mode: swingMode }),
  setSwingHorizontalMode: (
    entityId: EntityId<"climate">,
    swingHorizontalMode: string,
  ) =>
    onEntity("climate.set_swing_horizontal_mode", entityId, {
      swing_horizontal_mode: swingHorizontalMode,
    }),
};

// A media ID, or the value a media selector gives. Core keeps only the ID.
export const MediaId = Schema.Union([
  Schema.String,
  Schema.Struct({
    media_content_id: Schema.String,
    media_content_type: Schema.String,
  }),
]);

export type MediaId = typeof MediaId.Type;

// `assist_satellite.announce` options besides the message. `media_id` plays
// instead of speaking the message; `preannounce` defaults to true.
export const AssistSatelliteAnnounceOptions = Schema.Struct({
  media_id: Schema.optionalKey(MediaId),
  preannounce: Schema.optionalKey(Schema.Boolean),
  preannounce_media_id: Schema.optionalKey(MediaId),
});

export type AssistSatelliteAnnounceOptions =
  typeof AssistSatelliteAnnounceOptions.Type;

const AssistSatelliteStartConversationFields = Schema.Struct({
  start_message: Schema.optionalKey(Schema.String),
  start_media_id: Schema.optionalKey(MediaId),
  extra_system_prompt: Schema.optionalKey(Schema.String),
  preannounce: Schema.optionalKey(Schema.Boolean),
  preannounce_media_id: Schema.optionalKey(MediaId),
});

type AssistSatelliteStartConversationFields =
  typeof AssistSatelliteStartConversationFields.Type;

// `assist_satellite.start_conversation` data. Set `start_message`,
// `start_media_id` or both.
export const AssistSatelliteStartConversationData =
  AssistSatelliteStartConversationFields.check(
    atLeastOne<AssistSatelliteStartConversationFields>([
      "start_message",
      "start_media_id",
    ]),
  );

export type AssistSatelliteStartConversationData =
  typeof AssistSatelliteStartConversationData.Type;

// A possible answer to `assist_satellite.ask_question`. Sentences use Assist's
// template syntax, such as `play {genre}`, without punctuation.
export const AssistSatelliteAnswerOption = Schema.Struct({
  id: Schema.String,
  sentences: Schema.Array(Schema.NonEmptyString).check(Schema.isMinLength(1)),
});

export type AssistSatelliteAnswerOption =
  typeof AssistSatelliteAnswerOption.Type;

const AssistSatelliteAskQuestionFields = Schema.Struct({
  question: Schema.optionalKey(Schema.String),
  question_media_id: Schema.optionalKey(MediaId),
  preannounce: Schema.optionalKey(Schema.Boolean),
  preannounce_media_id: Schema.optionalKey(MediaId),
  answers: Schema.optionalKey(Schema.Array(AssistSatelliteAnswerOption)),
});

type AssistSatelliteAskQuestionFields =
  typeof AssistSatelliteAskQuestionFields.Type;

// `assist_satellite.ask_question` data. Set `question`, `question_media_id` or
// both.
export const AssistSatelliteAskQuestionData =
  AssistSatelliteAskQuestionFields.check(
    atLeastOne<AssistSatelliteAskQuestionFields>([
      "question",
      "question_media_id",
    ]),
  );

export type AssistSatelliteAskQuestionData =
  typeof AssistSatelliteAskQuestionData.Type;

// The reply to `assist_satellite.ask_question`. `id` is the matched answer's
// ID, or null when the reply matched none; `slots` holds the matched values.
export const AssistSatelliteAnswer = Schema.Struct({
  id: Schema.NullOr(Schema.String),
  sentence: Schema.String,
  slots: Schema.Record(Schema.String, Schema.Json),
});

export type AssistSatelliteAnswer = typeof AssistSatelliteAnswer.Type;

const decodeAnswer = Schema.decodeUnknownEffect(AssistSatelliteAnswer);

export const AssistSatellite = {
  announce: (
    target: Target,
    message: string,
    options?: AssistSatelliteAnnounceOptions,
  ) => onTarget("assist_satellite.announce", target, { message, ...options }),
  startConversation: (
    target: Target,
    data: AssistSatelliteStartConversationData,
  ) => onTarget("assist_satellite.start_conversation", target, data),
  // Waits for the satellite's user to reply; read it with `answerFrom`.
  askQuestion: (
    entityId: EntityId<"assist_satellite">,
    data: AssistSatelliteAskQuestionData,
  ): Action => ({
    action: "assist_satellite.ask_question",
    data: { entity_id: entityId, ...definedFields(data) },
    return_response: true,
  }),
  // Reads the answer from an `assist_satellite.ask_question` response.
  answerFrom: (response: Schema.Json | null) =>
    decodeAnswer(response).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode assist satellite answer: ${error.message}`,
          }),
      ),
    ),
};
