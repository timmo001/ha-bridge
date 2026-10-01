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

// An action with no target, such as a reload or `scene.apply`.
const onDomain = (action: string, data?: ActionData): Action => {
  const fields = definedFields(data);

  return fields === undefined ? { action } : { action, data: fields };
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
const reload = (domain: string) => () => onDomain(`${domain}.reload`);

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

// `camera.record` options. Core records 30 seconds by default, and `lookback`
// adds seconds from before the call when the stream keeps them.
export interface CameraRecordOptions {
  readonly duration?: number;
  readonly lookback?: number;
}

// `snapshot` and `record` write on the Home Assistant host, to a path in
// `allowlist_external_dirs`. `filename` is a template, so it can use values
// such as `{{ entity_id.name }}`.
export const Camera = {
  turnOn: (entityId: EntityId<"camera">) =>
    onEntity("camera.turn_on", entityId),
  turnOff: (entityId: EntityId<"camera">) =>
    onEntity("camera.turn_off", entityId),
  enableMotionDetection: (entityId: EntityId<"camera">) =>
    onEntity("camera.enable_motion_detection", entityId),
  disableMotionDetection: (entityId: EntityId<"camera">) =>
    onEntity("camera.disable_motion_detection", entityId),
  snapshot: (entityId: EntityId<"camera">, filename: string) =>
    onEntity("camera.snapshot", entityId, { filename }),
  record: (
    entityId: EntityId<"camera">,
    filename: string,
    options?: CameraRecordOptions,
  ) =>
    onEntity("camera.record", entityId, {
      filename,
      duration: options?.duration,
      lookback: options?.lookback,
    }),
  // Plays the camera's stream on media players. HLS is the only format.
  playStream: (
    entityId: EntityId<"camera">,
    mediaPlayer:
      EntityId<"media_player"> | ReadonlyArray<EntityId<"media_player">>,
    format?: "hls",
  ) =>
    onEntity("camera.play_stream", entityId, {
      media_player: mediaPlayer,
      format,
    }),
};

export const Button = {
  press: (entityId: EntityId<"button">) => onEntity("button.press", entityId),
};

export const InputButton = {
  press: (entityId: EntityId<"input_button">) =>
    onEntity("input_button.press", entityId),
  reload: reload("input_button"),
};

// `code` is the lock's code, when it needs one.
export interface LockOptions {
  readonly code?: string;
}

export const Lock = {
  lock: (entityId: EntityId<"lock">, options?: LockOptions) =>
    onEntity("lock.lock", entityId, { code: options?.code }),
  unlock: (entityId: EntityId<"lock">, options?: LockOptions) =>
    onEntity("lock.unlock", entityId, { code: options?.code }),
  open: (entityId: EntityId<"lock">, options?: LockOptions) =>
    onEntity("lock.open", entityId, { code: options?.code }),
};

export const Valve = {
  open: (entityId: EntityId<"valve">) => onEntity("valve.open_valve", entityId),
  close: (entityId: EntityId<"valve">) =>
    onEntity("valve.close_valve", entityId),
  toggle: (entityId: EntityId<"valve">) => onEntity("valve.toggle", entityId),
  stop: (entityId: EntityId<"valve">) => onEntity("valve.stop_valve", entityId),
  // `position` is 0 to 100.
  setPosition: (entityId: EntityId<"valve">, position: number) =>
    onEntity("valve.set_valve_position", entityId, { position }),
};

// `siren.turn_on` data. `tone` is one of the siren's `available_tones`.
export const SirenTurnOnData = Schema.Struct({
  tone: Schema.optionalKey(Schema.Union([Schema.String, Schema.Int])),
  duration: Schema.optionalKey(
    Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
  ),
  volume_level: Schema.optionalKey(between(0, 1)),
});

export type SirenTurnOnData = typeof SirenTurnOnData.Type;

export const Siren = {
  ...switchable("siren"),
  turnOn: (entityId: EntityId<"siren">, data?: SirenTurnOnData) =>
    onEntity("siren.turn_on", entityId, data),
};

const NonNegativeInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0));

// `remote.send_command` data. Core repeats `num_repeats` times (default 1),
// waits `delay_secs` between commands (default 0.4) and holds each for
// `hold_secs` (default 0).
export const RemoteSendCommandData = Schema.Struct({
  command: Schema.Array(Schema.String).check(Schema.isMinLength(1)),
  device: Schema.optionalKey(Schema.String),
  num_repeats: Schema.optionalKey(NonNegativeInt),
  delay_secs: Schema.optionalKey(Schema.Finite),
  hold_secs: Schema.optionalKey(Schema.Finite),
});

export type RemoteSendCommandData = typeof RemoteSendCommandData.Type;

// `remote.learn_command` data. `command_type` is `ir` (the default) or `rf`.
export const RemoteLearnCommandData = Schema.Struct({
  command: Schema.optionalKey(Schema.Array(Schema.String)),
  device: Schema.optionalKey(Schema.String),
  command_type: Schema.optionalKey(Schema.String),
  alternative: Schema.optionalKey(Schema.Boolean),
  timeout: Schema.optionalKey(NonNegativeInt),
});

export type RemoteLearnCommandData = typeof RemoteLearnCommandData.Type;

export const Remote = {
  ...switchable("remote"),
  // `activity` is one of the remote's `activity_list`.
  turnOn: (
    entityId: EntityId<"remote">,
    options?: { readonly activity?: string },
  ) => onEntity("remote.turn_on", entityId, { activity: options?.activity }),
  sendCommand: (entityId: EntityId<"remote">, data: RemoteSendCommandData) =>
    onEntity("remote.send_command", entityId, data),
  learnCommand: (entityId: EntityId<"remote">, data?: RemoteLearnCommandData) =>
    onEntity("remote.learn_command", entityId, data),
  deleteCommand: (
    entityId: EntityId<"remote">,
    command: ReadonlyArray<string>,
    options?: { readonly device?: string },
  ) =>
    onEntity("remote.delete_command", entityId, {
      command,
      device: options?.device,
    }),
};

// `select_next` and `select_previous` wrap round from the end by default;
// `cycle: false` stops there instead.
export interface SelectStepOptions {
  readonly cycle?: boolean;
}

const selectable = <const Domain extends string>(domain: Domain) => ({
  selectOption: (entityId: EntityId<Domain>, option: string) =>
    onEntity(`${domain}.select_option`, entityId, { option }),
  selectFirst: (entityId: EntityId<Domain>) =>
    onEntity(`${domain}.select_first`, entityId),
  selectLast: (entityId: EntityId<Domain>) =>
    onEntity(`${domain}.select_last`, entityId),
  selectNext: (entityId: EntityId<Domain>, options?: SelectStepOptions) =>
    onEntity(`${domain}.select_next`, entityId, { cycle: options?.cycle }),
  selectPrevious: (entityId: EntityId<Domain>, options?: SelectStepOptions) =>
    onEntity(`${domain}.select_previous`, entityId, { cycle: options?.cycle }),
});

export const Select = selectable("select");

export const InputSelect = {
  ...selectable("input_select"),
  // Replaces the options until Home Assistant restarts or reloads.
  setOptions: (
    entityId: EntityId<"input_select">,
    options: readonly [string, ...Array<string>],
  ) => onEntity("input_select.set_options", entityId, { options }),
  reload: reload("input_select"),
};

// Core checks `value` against the entity's `min`, `max` and `step`.
export const NumberEntity = {
  setValue: (entityId: EntityId<"number">, value: number) =>
    onEntity("number.set_value", entityId, { value }),
};

// Core checks `value` against the entity's `min`, `max` and `pattern`.
export const Text = {
  setValue: (entityId: EntityId<"text">, value: string) =>
    onEntity("text.set_value", entityId, { value }),
};

export const InputText = {
  setValue: (entityId: EntityId<"input_text">, value: string) =>
    onEntity("input_text.set_value", entityId, { value }),
  reload: reload("input_text"),
};

// A date as `YYYY-MM-DD`.
export const DateString = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{1,2}-\d{1,2}$/, {
    message: "Expected a date as YYYY-MM-DD",
  }),
);

// A time as `HH:MM` or `HH:MM:SS`.
export const TimeString = Schema.String.check(
  Schema.isPattern(/^\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?$/, {
    message: "Expected a time as HH:MM or HH:MM:SS",
  }),
);

// A date and time, such as `2026-10-01 18:30:00` or an ISO 8601 timestamp.
// Without an offset it's in Home Assistant's time zone.
export const DateTimeString = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{1,2}-\d{1,2}[T ]\d{1,2}:\d{2}/, {
    message: "Expected a date and time, such as 2026-10-01 18:30",
  }),
);

export const DateEntity = {
  setValue: (entityId: EntityId<"date">, date: string) =>
    onEntity("date.set_value", entityId, { date }),
};

export const TimeEntity = {
  setValue: (entityId: EntityId<"time">, time: string) =>
    onEntity("time.set_value", entityId, { time }),
};

export const DateTimeEntity = {
  setValue: (entityId: EntityId<"datetime">, datetime: string) =>
    onEntity("datetime.set_value", entityId, { datetime }),
};

const InputDateTimeSetFields = Schema.Struct({
  date: Schema.optionalKey(DateString),
  time: Schema.optionalKey(TimeString),
  datetime: Schema.optionalKey(DateTimeString),
  timestamp: Schema.optionalKey(Schema.Finite),
});

type InputDateTimeSetFields = typeof InputDateTimeSetFields.Type;

// `input_datetime.set_datetime` data. Set `date`, `time` or both, or one of
// `datetime` and `timestamp` (seconds since the Unix epoch).
export const InputDateTimeSetData = InputDateTimeSetFields.check(
  atLeastOne<InputDateTimeSetFields>(["date", "time", "datetime", "timestamp"]),
  Schema.makeFilter<InputDateTimeSetFields>((input) => {
    const groups = [
      Object.hasOwn(input, "date") || Object.hasOwn(input, "time"),
      Object.hasOwn(input, "datetime"),
      Object.hasOwn(input, "timestamp"),
    ].filter(Boolean).length;

    return (
      groups <= 1 || "set only one of date and time, datetime or timestamp"
    );
  }),
);

export type InputDateTimeSetData = typeof InputDateTimeSetData.Type;

export const InputDateTime = {
  setDateTime: (
    entityId: EntityId<"input_datetime">,
    data: InputDateTimeSetData,
  ) => onEntity("input_datetime.set_datetime", entityId, data),
  reload: reload("input_datetime"),
};

export const Counter = {
  increment: (entityId: EntityId<"counter">) =>
    onEntity("counter.increment", entityId),
  decrement: (entityId: EntityId<"counter">) =>
    onEntity("counter.decrement", entityId),
  reset: (entityId: EntityId<"counter">) => onEntity("counter.reset", entityId),
  // `value` is a whole number within the counter's `minimum` and `maximum`.
  setValue: (entityId: EntityId<"counter">, value: number) =>
    onEntity("counter.set_value", entityId, { value }),
};

// Values passed to a script as `variables`.
export type ScriptVariables = Readonly<Record<string, Schema.Json>>;

export const Script = {
  // Starts the script without waiting for it to finish.
  turnOn: (entityId: EntityId<"script">, variables?: ScriptVariables) =>
    onEntity("script.turn_on", entityId, { variables }),
  turnOff: (entityId: EntityId<"script">) =>
    onEntity("script.turn_off", entityId),
  toggle: (entityId: EntityId<"script">) => onEntity("script.toggle", entityId),
  // Runs the script through its own action and waits for it to finish. The
  // response is whatever the script returns with a `stop` action.
  run: (entityId: EntityId<"script">, variables?: ScriptVariables): Action => ({
    ...onDomain(entityId, variables),
    return_response: true,
  }),
  reload: reload("script"),
};

export const Automation = {
  turnOn: (entityId: EntityId<"automation">) =>
    onEntity("automation.turn_on", entityId),
  // `stopActions: false` lets running actions finish; Core stops them by
  // default.
  turnOff: (
    entityId: EntityId<"automation">,
    options?: { readonly stopActions?: boolean },
  ) =>
    onEntity("automation.turn_off", entityId, {
      stop_actions: options?.stopActions,
    }),
  toggle: (entityId: EntityId<"automation">) =>
    onEntity("automation.toggle", entityId),
  // Runs the actions. `skipCondition: false` checks the conditions first;
  // Core skips them by default.
  trigger: (
    entityId: EntityId<"automation">,
    options?: { readonly skipCondition?: boolean },
  ) =>
    onEntity("automation.trigger", entityId, {
      skip_condition: options?.skipCondition,
    }),
  reload: reload("automation"),
};

// Scene entity states, keyed by entity ID: a state such as `"on"`, or an
// object with `state` and attributes such as `brightness`.
export const SceneEntities = Schema.Record(
  Schema.String,
  Schema.Union([Schema.String, Schema.Record(Schema.String, Schema.Json)]),
);

export type SceneEntities = typeof SceneEntities.Type;

const SceneCreateFields = Schema.Struct({
  scene_id: Schema.String.check(
    Schema.isPattern(/^[a-z0-9_]+$/, {
      message: "Expected a scene ID of lowercase letters, digits and _",
    }),
  ),
  entities: Schema.optionalKey(SceneEntities),
  snapshot_entities: Schema.optionalKey(Schema.Array(Schema.String)),
});

// `scene.create` data. The scene lasts until Home Assistant restarts; set
// `entities`, `snapshot_entities` (current states to capture) or both.
export const SceneCreateData = SceneCreateFields.check(
  atLeastOne<typeof SceneCreateFields.Type>(["entities", "snapshot_entities"]),
);

export type SceneCreateData = typeof SceneCreateData.Type;

// `transition` is in seconds, for entities that support it.
export interface SceneTransitionOptions {
  readonly transition?: number;
}

export const Scene = {
  turnOn: (entityId: EntityId<"scene">, options?: SceneTransitionOptions) =>
    onEntity("scene.turn_on", entityId, { transition: options?.transition }),
  // Sets entity states without creating a scene.
  apply: (entities: SceneEntities, options?: SceneTransitionOptions) =>
    onDomain("scene.apply", { entities, transition: options?.transition }),
  create: (data: SceneCreateData) => onDomain("scene.create", data),
  // Deletes a scene made with `create`.
  delete: (entityId: EntityId<"scene">) => onEntity("scene.delete", entityId),
  reload: reload("scene"),
};

// A duration as `HH:MM:SS` (or `HH:MM`), or seconds. Timer `change` takes a
// leading `-` to shorten the timer.
export const DurationValue = Schema.Union([
  Schema.String.check(
    Schema.isPattern(/^-?\d+:\d{1,2}(:\d{1,2}(\.\d+)?)?$/, {
      message: "Expected a duration as HH:MM:SS",
    }),
  ),
  Schema.Finite,
]);

export type DurationValue = typeof DurationValue.Type;

export const Timer = {
  // Starts or restarts the timer, for `duration` or its configured one.
  start: (entityId: EntityId<"timer">, duration?: DurationValue) =>
    onEntity("timer.start", entityId, { duration }),
  pause: (entityId: EntityId<"timer">) => onEntity("timer.pause", entityId),
  cancel: (entityId: EntityId<"timer">) => onEntity("timer.cancel", entityId),
  finish: (entityId: EntityId<"timer">) => onEntity("timer.finish", entityId),
  // Adds `duration` to a running timer; negative values shorten it.
  change: (entityId: EntityId<"timer">, duration: DurationValue) =>
    onEntity("timer.change", entityId, { duration }),
  reload: reload("timer"),
};

const ScheduleBlock = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  data: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
});

// A schedule's time blocks for each day, from `schedule.get_schedule`.
export const ScheduleWeek = Schema.Struct({
  monday: Schema.Array(ScheduleBlock),
  tuesday: Schema.Array(ScheduleBlock),
  wednesday: Schema.Array(ScheduleBlock),
  thursday: Schema.Array(ScheduleBlock),
  friday: Schema.Array(ScheduleBlock),
  saturday: Schema.Array(ScheduleBlock),
  sunday: Schema.Array(ScheduleBlock),
});

export type ScheduleWeek = typeof ScheduleWeek.Type;

const decodeScheduleResponse = Schema.decodeUnknownEffect(
  Schema.Record(Schema.String, ScheduleWeek),
);

export const Schedule = {
  getSchedule: (entityId: EntityId<"schedule">): Action => ({
    action: "schedule.get_schedule",
    target: { entity_id: entityId },
    return_response: true,
  }),
  // Reads one schedule's week from a `schedule.get_schedule` response.
  scheduleFrom: (
    entityId: EntityId<"schedule">,
    response: Schema.Json | null,
  ) =>
    decodeScheduleResponse(response).pipe(
      Effect.flatMap((schedules) => {
        const week = schedules[entityId];

        return week === undefined
          ? Effect.fail(
              new HomeAssistantError({
                message: `no schedule for ${entityId} in the response`,
              }),
            )
          : Effect.succeed(week);
      }),
      Effect.catchTag("SchemaError", (error) =>
        Effect.fail(
          new HomeAssistantError({
            message: `decode schedule: ${error.message}`,
          }),
        ),
      ),
    ),
  reload: reload("schedule"),
};

const GroupSetFields = Schema.Struct({
  object_id: Schema.String.check(
    Schema.isPattern(/^[a-z0-9_]+$/, {
      message: "Expected an object ID of lowercase letters, digits and _",
    }),
  ),
  name: Schema.optionalKey(Schema.String),
  icon: Schema.optionalKey(Schema.String),
  all: Schema.optionalKey(Schema.Boolean),
  entities: Schema.optionalKey(Schema.Array(Schema.String)),
  add_entities: Schema.optionalKey(Schema.Array(Schema.String)),
  remove_entities: Schema.optionalKey(Schema.Array(Schema.String)),
});

// `group.set` data, for old-style groups made by actions. Set one of
// `entities`, `add_entities` and `remove_entities`. `all: true` makes the
// group on only when every member is on.
export const GroupSetData = GroupSetFields.check(
  exclusive<typeof GroupSetFields.Type>("entities", [
    "entities",
    "add_entities",
    "remove_entities",
  ]),
);

export type GroupSetData = typeof GroupSetData.Type;

export const Group = {
  set: (data: GroupSetData) => onDomain("group.set", data),
  remove: (objectId: string) =>
    onDomain("group.remove", { object_id: objectId }),
  reload: reload("group"),
};

export const Zone = { reload: reload("zone") };

export const Person = { reload: reload("person") };

// Actions in the `homeassistant` domain. `turnOn`, `turnOff` and `toggle`
// work on entities of any domain.
export const HomeAssistantCore = {
  turnOn: (target: Target) => onTarget("homeassistant.turn_on", target),
  turnOff: (target: Target) => onTarget("homeassistant.turn_off", target),
  toggle: (target: Target) => onTarget("homeassistant.toggle", target),
  // Asks the integrations to refresh these entities now.
  updateEntity: (entityIds: ReadonlyArray<string>) =>
    onDomain("homeassistant.update_entity", { entity_id: entityIds }),
  restart: (options?: { readonly safeMode?: boolean }) =>
    onDomain("homeassistant.restart", { safe_mode: options?.safeMode }),
  stop: () => onDomain("homeassistant.stop"),
  checkConfig: () => onDomain("homeassistant.check_config"),
  reloadCoreConfig: () => onDomain("homeassistant.reload_core_config"),
  reloadCustomTemplates: () =>
    onDomain("homeassistant.reload_custom_templates"),
  reloadAll: () => onDomain("homeassistant.reload_all"),
  // Reloads one config entry, by ID or through an entity, device or area.
  reloadConfigEntry: (entryId: string) =>
    onDomain("homeassistant.reload_config_entry", { entry_id: entryId }),
  // Reloads the config entries behind an entity, device or area.
  reloadConfigEntryOf: (target: Target) =>
    onTarget("homeassistant.reload_config_entry", target),
  savePersistentStates: () => onDomain("homeassistant.save_persistent_states"),
  // Sets the home location. `elevation` is in metres.
  setLocation: (
    latitude: number,
    longitude: number,
    options?: { readonly elevation?: number },
  ) =>
    onDomain("homeassistant.set_location", {
      latitude,
      longitude,
      elevation: options?.elevation,
    }),
};

const Percent = Schema.Int.check(
  Schema.isBetween({ minimum: 0, maximum: 100 }),
);

// `fan.turn_on` data. `preset_mode` is one of the fan's `preset_modes`.
export const FanTurnOnData = Schema.Struct({
  percentage: Schema.optionalKey(Percent),
  preset_mode: Schema.optionalKey(Schema.String),
});

export type FanTurnOnData = typeof FanTurnOnData.Type;

export const Fan = {
  ...switchable("fan"),
  turnOn: (entityId: EntityId<"fan">, data?: FanTurnOnData) =>
    onEntity("fan.turn_on", entityId, data),
  // `percentage` is 0 to 100; 0 turns the fan off.
  setPercentage: (entityId: EntityId<"fan">, percentage: number) =>
    onEntity("fan.set_percentage", entityId, { percentage }),
  // `step` is in percent; Core uses the fan's own step by default.
  increaseSpeed: (entityId: EntityId<"fan">, step?: number) =>
    onEntity("fan.increase_speed", entityId, { percentage_step: step }),
  decreaseSpeed: (entityId: EntityId<"fan">, step?: number) =>
    onEntity("fan.decrease_speed", entityId, { percentage_step: step }),
  setPresetMode: (entityId: EntityId<"fan">, presetMode: string) =>
    onEntity("fan.set_preset_mode", entityId, { preset_mode: presetMode }),
  oscillate: (entityId: EntityId<"fan">, oscillating: boolean) =>
    onEntity("fan.oscillate", entityId, { oscillating }),
  setDirection: (entityId: EntityId<"fan">, direction: "forward" | "reverse") =>
    onEntity("fan.set_direction", entityId, { direction }),
};

export const Humidifier = {
  ...switchable("humidifier"),
  // `mode` is one of the humidifier's `available_modes`.
  setMode: (entityId: EntityId<"humidifier">, mode: string) =>
    onEntity("humidifier.set_mode", entityId, { mode }),
  // `humidity` is a whole percentage.
  setHumidity: (entityId: EntityId<"humidifier">, humidity: number) =>
    onEntity("humidifier.set_humidity", entityId, { humidity }),
};

export const WaterHeater = {
  turnOn: (entityId: EntityId<"water_heater">) =>
    onEntity("water_heater.turn_on", entityId),
  turnOff: (entityId: EntityId<"water_heater">) =>
    onEntity("water_heater.turn_off", entityId),
  // `temperature` is in the entity's unit. `operationMode` also switches
  // mode, to one of the entity's `operation_list`.
  setTemperature: (
    entityId: EntityId<"water_heater">,
    temperature: number,
    options?: { readonly operationMode?: string },
  ) =>
    onEntity("water_heater.set_temperature", entityId, {
      temperature,
      operation_mode: options?.operationMode,
    }),
  setOperationMode: (
    entityId: EntityId<"water_heater">,
    operationMode: string,
  ) =>
    onEntity("water_heater.set_operation_mode", entityId, {
      operation_mode: operationMode,
    }),
  setAwayMode: (entityId: EntityId<"water_heater">, awayMode: boolean) =>
    onEntity("water_heater.set_away_mode", entityId, { away_mode: awayMode }),
};

// `media_player.play_media` data. `media_content_type` is a type such as
// `music` or `url`; `enqueue` is `play` (the default), `next`, `add` or
// `replace`; `announce` pauses what's playing for the media.
export const MediaPlayerPlayMediaData = Schema.Struct({
  media_content_id: Schema.String,
  media_content_type: Schema.String,
  enqueue: Schema.optionalKey(
    Schema.Literals(["play", "next", "add", "replace"]),
  ),
  announce: Schema.optionalKey(Schema.Boolean),
});

export type MediaPlayerPlayMediaData = typeof MediaPlayerPlayMediaData.Type;

// Where to browse or search, from a previous `browse_media` response.
export interface MediaLocation {
  readonly mediaContentType?: string;
  readonly mediaContentId?: string;
}

const mediaLocation = (location?: MediaLocation) => ({
  media_content_type: location?.mediaContentType,
  media_content_id: location?.mediaContentId,
});

const mediaPlayerAction =
  (action: string) => (entityId: EntityId<"media_player">) =>
    onEntity(`media_player.${action}`, entityId);

export const MediaPlayer = {
  ...switchable("media_player"),
  volumeUp: mediaPlayerAction("volume_up"),
  volumeDown: mediaPlayerAction("volume_down"),
  // `volume` is 0 to 1.
  setVolume: (entityId: EntityId<"media_player">, volume: number) =>
    onEntity("media_player.volume_set", entityId, { volume_level: volume }),
  mute: (entityId: EntityId<"media_player">, muted: boolean) =>
    onEntity("media_player.volume_mute", entityId, { is_volume_muted: muted }),
  play: mediaPlayerAction("media_play"),
  pause: mediaPlayerAction("media_pause"),
  playPause: mediaPlayerAction("media_play_pause"),
  stop: mediaPlayerAction("media_stop"),
  nextTrack: mediaPlayerAction("media_next_track"),
  previousTrack: mediaPlayerAction("media_previous_track"),
  // `position` is in seconds.
  seek: (entityId: EntityId<"media_player">, position: number) =>
    onEntity("media_player.media_seek", entityId, { seek_position: position }),
  playMedia: (
    entityId: EntityId<"media_player">,
    data: MediaPlayerPlayMediaData,
  ) => onEntity("media_player.play_media", entityId, data),
  // `source` is one of the player's `source_list`.
  selectSource: (entityId: EntityId<"media_player">, source: string) =>
    onEntity("media_player.select_source", entityId, { source }),
  // `soundMode` is one of the player's `sound_mode_list`.
  selectSoundMode: (entityId: EntityId<"media_player">, soundMode: string) =>
    onEntity("media_player.select_sound_mode", entityId, {
      sound_mode: soundMode,
    }),
  clearPlaylist: mediaPlayerAction("clear_playlist"),
  setShuffle: (entityId: EntityId<"media_player">, shuffle: boolean) =>
    onEntity("media_player.shuffle_set", entityId, { shuffle }),
  setRepeat: (
    entityId: EntityId<"media_player">,
    repeat: "off" | "all" | "one",
  ) => onEntity("media_player.repeat_set", entityId, { repeat }),
  // Groups other players with this one for synchronised playback.
  join: (
    entityId: EntityId<"media_player">,
    members: ReadonlyArray<EntityId<"media_player">>,
  ) => onEntity("media_player.join", entityId, { group_members: members }),
  unjoin: mediaPlayerAction("unjoin"),
  // Responds with the media under `location`, or the top level.
  browseMedia: (
    entityId: EntityId<"media_player">,
    location?: MediaLocation,
  ): Action => ({
    ...onEntity("media_player.browse_media", entityId, mediaLocation(location)),
    return_response: true,
  }),
  search: (
    entityId: EntityId<"media_player">,
    query: string,
    location?: MediaLocation,
  ): Action => ({
    ...onEntity("media_player.search_media", entityId, {
      search_query: query,
      ...mediaLocation(location),
    }),
    return_response: true,
  }),
};

const vacuumAction = (action: string) => (entityId: EntityId<"vacuum">) =>
  onEntity(`vacuum.${action}`, entityId);

export const Vacuum = {
  start: vacuumAction("start"),
  pause: vacuumAction("pause"),
  startPause: vacuumAction("start_pause"),
  stop: vacuumAction("stop"),
  returnToBase: vacuumAction("return_to_base"),
  locate: vacuumAction("locate"),
  cleanSpot: vacuumAction("clean_spot"),
  // Cleans the areas mapped to the vacuum's segments, by area ID.
  cleanArea: (entityId: EntityId<"vacuum">, areaIds: ReadonlyArray<string>) =>
    onEntity("vacuum.clean_area", entityId, { cleaning_area_id: areaIds }),
  // `fanSpeed` is one of the vacuum's `fan_speed_list`.
  setFanSpeed: (entityId: EntityId<"vacuum">, fanSpeed: string) =>
    onEntity("vacuum.set_fan_speed", entityId, { fan_speed: fanSpeed }),
  // Sends a command the integration understands, with optional parameters.
  sendCommand: (
    entityId: EntityId<"vacuum">,
    command: string,
    params?: Schema.Json,
  ) => onEntity("vacuum.send_command", entityId, { command, params }),
};

const lawnMowerAction =
  (action: string) => (entityId: EntityId<"lawn_mower">) =>
    onEntity(`lawn_mower.${action}`, entityId);

export const LawnMower = {
  startMowing: lawnMowerAction("start_mowing"),
  pause: lawnMowerAction("pause"),
  stop: lawnMowerAction("stop"),
  dock: lawnMowerAction("dock"),
};

const alarmAction =
  (action: string) =>
  (entityId: EntityId<"alarm_control_panel">, options?: LockOptions) =>
    onEntity(`alarm_control_panel.${action}`, entityId, {
      code: options?.code,
    });

// `code` is the panel's code, when it needs one.
export const AlarmControlPanel = {
  disarm: alarmAction("alarm_disarm"),
  armHome: alarmAction("alarm_arm_home"),
  armAway: alarmAction("alarm_arm_away"),
  armNight: alarmAction("alarm_arm_night"),
  armVacation: alarmAction("alarm_arm_vacation"),
  armCustomBypass: alarmAction("alarm_arm_custom_bypass"),
  trigger: alarmAction("alarm_trigger"),
};

export const Update = {
  // Installs `version`, or the latest. `backup` backs up first, where the
  // integration supports it.
  install: (
    entityId: EntityId<"update">,
    options?: { readonly version?: string; readonly backup?: boolean },
  ) =>
    onEntity("update.install", entityId, {
      version: options?.version,
      backup: options?.backup,
    }),
  skip: (entityId: EntityId<"update">) => onEntity("update.skip", entityId),
  clearSkipped: (entityId: EntityId<"update">) =>
    onEntity("update.clear_skipped", entityId),
};

export interface NotifyMessage {
  readonly message: string;
  readonly title?: string;
}

export const Notify = {
  // Sends to a notify entity.
  sendMessage: (entityId: EntityId<"notify">, message: NotifyMessage) =>
    onEntity("notify.send_message", entityId, { ...message }),
  // Sends through a legacy notify action, such as `mobile_app_pixel`.
  // `data` is passed on to the integration.
  legacy: (
    service: string,
    message: NotifyMessage & { readonly data?: Schema.Json },
  ) => onDomain(`notify.${service}`, { ...message }),
};

export const PersistentNotification = {
  // Reusing a `notificationId` replaces that notification.
  create: (message: NotifyMessage & { readonly notificationId?: string }) =>
    onDomain("persistent_notification.create", {
      message: message.message,
      title: message.title,
      notification_id: message.notificationId,
    }),
  dismiss: (notificationId: string) =>
    onDomain("persistent_notification.dismiss", {
      notification_id: notificationId,
    }),
  dismissAll: () => onDomain("persistent_notification.dismiss_all"),
};

export interface TtsSpeakOptions {
  readonly language?: string;
  readonly cache?: boolean;
  readonly options?: Readonly<Record<string, Schema.Json>>;
}

export const Tts = {
  // Speaks `message` with a TTS entity on a media player.
  speak: (
    entityId: EntityId<"tts">,
    mediaPlayer: EntityId<"media_player">,
    message: string,
    options?: TtsSpeakOptions,
  ) =>
    onEntity("tts.speak", entityId, {
      media_player_entity_id: mediaPlayer,
      message,
      language: options?.language,
      cache: options?.cache,
      options: options?.options,
    }),
  clearCache: () => onDomain("tts.clear_cache"),
};

export type TodoStatus = "needs_action" | "completed";

// Fields for a to-do item. Set at most one of `due_date` (`YYYY-MM-DD`) and
// `due_datetime`.
export const TodoItemFields = Schema.Struct({
  due_date: Schema.optionalKey(DateString),
  due_datetime: Schema.optionalKey(DateTimeString),
  description: Schema.optionalKey(Schema.String),
}).check(
  Schema.makeFilter(
    (input) =>
      !(
        Object.hasOwn(input, "due_date") && Object.hasOwn(input, "due_datetime")
      ) || "set only one of due_date and due_datetime",
  ),
);

export type TodoItemFields = typeof TodoItemFields.Type;

export const Todo = {
  // Responds with the list's items, optionally only those with `status`.
  getItems: (
    entityId: EntityId<"todo">,
    status?: ReadonlyArray<TodoStatus>,
  ): Action => ({
    ...onEntity("todo.get_items", entityId, { status }),
    return_response: true,
  }),
  addItem: (
    entityId: EntityId<"todo">,
    item: string,
    fields?: TodoItemFields,
  ) => onEntity("todo.add_item", entityId, { item, ...fields }),
  // `item` is the item's name or UID.
  updateItem: (
    entityId: EntityId<"todo">,
    item: string,
    changes: TodoItemFields & {
      readonly rename?: string;
      readonly status?: TodoStatus;
    },
  ) => onEntity("todo.update_item", entityId, { item, ...changes }),
  removeItem: (entityId: EntityId<"todo">, items: ReadonlyArray<string>) =>
    onEntity("todo.remove_item", entityId, { item: items }),
  removeCompletedItems: (entityId: EntityId<"todo">) =>
    onEntity("todo.remove_completed_items", entityId),
};

export const Weather = {
  // Responds with forecasts keyed by entity ID.
  getForecasts: (
    entityId: EntityId<"weather">,
    type: "daily" | "hourly" | "twice_daily",
  ): Action => ({
    ...onEntity("weather.get_forecasts", entityId, { type }),
    return_response: true,
  }),
};

export const Conversation = {
  // Sends `text` to a conversation agent and responds with its reply.
  process: (
    text: string,
    options?: {
      readonly language?: string;
      readonly agentId?: string;
      readonly conversationId?: string;
    },
  ): Action => ({
    ...onDomain("conversation.process", {
      text,
      language: options?.language,
      agent_id: options?.agentId,
      conversation_id: options?.conversationId,
    }),
    return_response: true,
  }),
  reload: (options?: {
    readonly language?: string;
    readonly agentId?: string;
  }) =>
    onDomain("conversation.reload", {
      language: options?.language,
      agent_id: options?.agentId,
    }),
};

export const AiTask = {
  // Responds with generated data, matching `structure` when given.
  generateData: (
    taskName: string,
    instructions: string,
    options?: {
      readonly entityId?: EntityId<"ai_task">;
      readonly structure?: Readonly<Record<string, Schema.Json>>;
    },
  ): Action => ({
    ...onDomain("ai_task.generate_data", {
      task_name: taskName,
      instructions,
      entity_id: options?.entityId,
      structure: options?.structure,
    }),
    return_response: true,
  }),
  // Responds with the generated image's details.
  generateImage: (
    entityId: EntityId<"ai_task">,
    taskName: string,
    instructions: string,
  ): Action => ({
    ...onDomain("ai_task.generate_image", {
      task_name: taskName,
      instructions,
      entity_id: entityId,
    }),
    return_response: true,
  }),
};

export const Image = {
  // Saves the image to `filename` on the Home Assistant host. The path must
  // be allowed by `allowlist_external_dirs`.
  snapshot: (entityId: EntityId<"image">, filename: string) =>
    onEntity("image.snapshot", entityId, { filename }),
};

export const ImageProcessing = {
  scan: (entityId: EntityId<"image_processing">) =>
    onEntity("image_processing.scan", entityId),
};

// When a new event happens: all-day dates (end is exclusive), date-times,
// or all day a number of days or weeks from today.
export type CalendarEventWhen =
  | { readonly startDate: string; readonly endDate: string }
  | { readonly startDateTime: string; readonly endDateTime: string }
  | { readonly in: { readonly days: number } | { readonly weeks: number } };

// Adds an event to a calendar. `calendar.get_events` is on `Calendar`.
export const CalendarActions = {
  createEvent: (
    entityId: EntityId<"calendar">,
    summary: string,
    when: CalendarEventWhen,
    options?: { readonly description?: string; readonly location?: string },
  ) =>
    onEntity("calendar.create_event", entityId, {
      summary,
      start_date: "startDate" in when ? when.startDate : undefined,
      end_date: "endDate" in when ? when.endDate : undefined,
      start_date_time: "startDateTime" in when ? when.startDateTime : undefined,
      end_date_time: "endDateTime" in when ? when.endDateTime : undefined,
      in: "in" in when ? when.in : undefined,
      description: options?.description,
      location: options?.location,
    }),
};

const DeviceTrackerSeeFields = Schema.Struct({
  mac: Schema.optionalKey(Schema.String),
  dev_id: Schema.optionalKey(Schema.String),
  host_name: Schema.optionalKey(Schema.String),
  location_name: Schema.optionalKey(Schema.String),
  gps: Schema.optionalKey(Schema.Tuple([between(-90, 90), between(-180, 180)])),
  gps_accuracy: Schema.optionalKey(NonNegativeInt),
  battery: Schema.optionalKey(Percent),
});

// `device_tracker.see` data, for legacy trackers. Set `mac`, `dev_id` or
// both to say which device; `location_name` is a zone name, `home` or
// `not_home`.
export const DeviceTrackerSeeData = DeviceTrackerSeeFields.check(
  atLeastOne<typeof DeviceTrackerSeeFields.Type>(["mac", "dev_id"]),
);

export type DeviceTrackerSeeData = typeof DeviceTrackerSeeData.Type;

export const DeviceTracker = {
  see: (data: DeviceTrackerSeeData) => onDomain("device_tracker.see", data),
};
