import { Effect, Schema } from "effect";
import { HomeAssistantError } from "./HomeAssistantError.js";
import { Target } from "./Target.js";

// A Home Assistant action, such as `light.turn_on`, in the shape automations use.
export const Action = Schema.Struct({
  action: Schema.String.check(Schema.isPattern(/^[a-z0-9_]+\.[a-z0-9_]+$/)),
  data: Schema.optionalKey(Schema.Record(Schema.String, Schema.Json)),
  target: Schema.optionalKey(Target),
  return_response: Schema.optionalKey(Schema.Boolean),
});

export type Action = typeof Action.Type;

export type EntityId<Domain extends string> = `${Domain}.${string}`;

export const isEntityIdIn =
  <const Domain extends string>(domain: Domain) =>
  (entityId: string): entityId is EntityId<Domain> =>
    entityId.startsWith(`${domain}.`);

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

const definedFields = (data: ActionData | undefined) => {
  const fields: Record<string, Schema.Json> = {};

  for (const [key, value] of Object.entries(data ?? {})) {
    if (value !== undefined) {
      fields[key] = value;
    }
  }

  return Object.keys(fields).length === 0 ? undefined : fields;
};

const switchable = (domain: string) => ({
  turnOn: (target: Target) => onTarget(`${domain}.turn_on`, target),
  turnOff: (target: Target) => onTarget(`${domain}.turn_off`, target),
  toggle: (target: Target) => onTarget(`${domain}.toggle`, target),
});

// Reloads a domain's YAML configuration.
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
  turnOn: (target: Target, data?: LightTurnOnData) =>
    onTarget("light.turn_on", target, data),
  turnOff: (target: Target, data?: LightTurnOffData) =>
    onTarget("light.turn_off", target, data),
  toggle: (target: Target, data?: LightTurnOnData) =>
    onTarget("light.toggle", target, data),
};

export const Switch = switchable("switch");

export const InputNumber = {
  reload: reload("input_number"),
  setValue: (target: Target, value: number) =>
    onTarget("input_number.set_value", target, { value }),
  increment: (target: Target) => onTarget("input_number.increment", target),
  decrement: (target: Target) => onTarget("input_number.decrement", target),
};

// `speed` must be one of the cover's `supported_speeds`.
export interface CoverMoveOptions {
  readonly speed?: string;
}

export const Cover = {
  open: (target: Target, options?: CoverMoveOptions) =>
    onTarget("cover.open_cover", target, { speed: options?.speed }),
  close: (target: Target, options?: CoverMoveOptions) =>
    onTarget("cover.close_cover", target, { speed: options?.speed }),
  toggle: (target: Target) => onTarget("cover.toggle", target),
  stop: (target: Target) => onTarget("cover.stop_cover", target),
  setPosition: (target: Target, position: number, options?: CoverMoveOptions) =>
    onTarget("cover.set_cover_position", target, {
      position,
      speed: options?.speed,
    }),
  openTilt: (target: Target) => onTarget("cover.open_cover_tilt", target),
  closeTilt: (target: Target) => onTarget("cover.close_cover_tilt", target),
  toggleTilt: (target: Target) => onTarget("cover.toggle_cover_tilt", target),
  stopTilt: (target: Target) => onTarget("cover.stop_cover_tilt", target),
  setTiltPosition: (target: Target, tiltPosition: number) =>
    onTarget("cover.set_cover_tilt_position", target, {
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
  setHvacMode: (target: Target, hvacMode: HvacMode) =>
    onTarget("climate.set_hvac_mode", target, { hvac_mode: hvacMode }),
  setTemperature: (target: Target, data: ClimateSetTemperatureData) =>
    onTarget("climate.set_temperature", target, data),
  setHumidity: (target: Target, humidity: number) =>
    onTarget("climate.set_humidity", target, { humidity }),
  setPresetMode: (target: Target, presetMode: string) =>
    onTarget("climate.set_preset_mode", target, { preset_mode: presetMode }),
  setFanMode: (target: Target, fanMode: string) =>
    onTarget("climate.set_fan_mode", target, { fan_mode: fanMode }),
  setSwingMode: (target: Target, swingMode: string) =>
    onTarget("climate.set_swing_mode", target, { swing_mode: swingMode }),
  setSwingHorizontalMode: (target: Target, swingHorizontalMode: string) =>
    onTarget("climate.set_swing_horizontal_mode", target, {
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
  turnOn: (target: Target) => onTarget("camera.turn_on", target),
  turnOff: (target: Target) => onTarget("camera.turn_off", target),
  enableMotionDetection: (target: Target) =>
    onTarget("camera.enable_motion_detection", target),
  disableMotionDetection: (target: Target) =>
    onTarget("camera.disable_motion_detection", target),
  snapshot: (target: Target, filename: string) =>
    onTarget("camera.snapshot", target, { filename }),
  record: (target: Target, filename: string, options?: CameraRecordOptions) =>
    onTarget("camera.record", target, {
      filename,
      duration: options?.duration,
      lookback: options?.lookback,
    }),
  // Plays the camera's stream on media players. HLS is the only format.
  playStream: (
    target: Target,
    mediaPlayer:
      EntityId<"media_player"> | ReadonlyArray<EntityId<"media_player">>,
    format?: "hls",
  ) =>
    onTarget("camera.play_stream", target, {
      media_player: mediaPlayer,
      format,
    }),
};

export const Button = {
  press: (target: Target) => onTarget("button.press", target),
};

export const InputButton = {
  press: (target: Target) => onTarget("input_button.press", target),
  reload: reload("input_button"),
};

// `code` is the lock's code, when it needs one.
export interface LockOptions {
  readonly code?: string;
}

export const Lock = {
  lock: (target: Target, options?: LockOptions) =>
    onTarget("lock.lock", target, { code: options?.code }),
  unlock: (target: Target, options?: LockOptions) =>
    onTarget("lock.unlock", target, { code: options?.code }),
  open: (target: Target, options?: LockOptions) =>
    onTarget("lock.open", target, { code: options?.code }),
};

export const Valve = {
  open: (target: Target) => onTarget("valve.open_valve", target),
  close: (target: Target) => onTarget("valve.close_valve", target),
  toggle: (target: Target) => onTarget("valve.toggle", target),
  stop: (target: Target) => onTarget("valve.stop_valve", target),
  // `position` is 0 to 100.
  setPosition: (target: Target, position: number) =>
    onTarget("valve.set_valve_position", target, { position }),
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
  turnOn: (target: Target, data?: SirenTurnOnData) =>
    onTarget("siren.turn_on", target, data),
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
  turnOn: (target: Target, options?: { readonly activity?: string }) =>
    onTarget("remote.turn_on", target, { activity: options?.activity }),
  sendCommand: (target: Target, data: RemoteSendCommandData) =>
    onTarget("remote.send_command", target, data),
  learnCommand: (target: Target, data?: RemoteLearnCommandData) =>
    onTarget("remote.learn_command", target, data),
  deleteCommand: (
    target: Target,
    command: ReadonlyArray<string>,
    options?: { readonly device?: string },
  ) =>
    onTarget("remote.delete_command", target, {
      command,
      device: options?.device,
    }),
};

// `select_next` and `select_previous` wrap round from the end by default;
// `cycle: false` stops there instead.
export interface SelectStepOptions {
  readonly cycle?: boolean;
}

const selectable = (domain: string) => ({
  selectOption: (target: Target, option: string) =>
    onTarget(`${domain}.select_option`, target, { option }),
  selectFirst: (target: Target) => onTarget(`${domain}.select_first`, target),
  selectLast: (target: Target) => onTarget(`${domain}.select_last`, target),
  selectNext: (target: Target, options?: SelectStepOptions) =>
    onTarget(`${domain}.select_next`, target, { cycle: options?.cycle }),
  selectPrevious: (target: Target, options?: SelectStepOptions) =>
    onTarget(`${domain}.select_previous`, target, { cycle: options?.cycle }),
});

export const Select = selectable("select");

export const InputSelect = {
  ...selectable("input_select"),
  // Replaces the options until Home Assistant restarts or reloads.
  setOptions: (target: Target, options: readonly [string, ...Array<string>]) =>
    onTarget("input_select.set_options", target, { options }),
  reload: reload("input_select"),
};

// Core checks `value` against the entity's `min`, `max` and `step`.
export const NumberEntity = {
  setValue: (target: Target, value: number) =>
    onTarget("number.set_value", target, { value }),
};

// Core checks `value` against the entity's `min`, `max` and `pattern`.
export const Text = {
  setValue: (target: Target, value: string) =>
    onTarget("text.set_value", target, { value }),
};

export const InputText = {
  setValue: (target: Target, value: string) =>
    onTarget("input_text.set_value", target, { value }),
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
  setValue: (target: Target, date: string) =>
    onTarget("date.set_value", target, { date }),
};

export const TimeEntity = {
  setValue: (target: Target, time: string) =>
    onTarget("time.set_value", target, { time }),
};

export const DateTimeEntity = {
  setValue: (target: Target, datetime: string) =>
    onTarget("datetime.set_value", target, { datetime }),
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
  setDateTime: (target: Target, data: InputDateTimeSetData) =>
    onTarget("input_datetime.set_datetime", target, data),
  reload: reload("input_datetime"),
};

export const Counter = {
  increment: (target: Target) => onTarget("counter.increment", target),
  decrement: (target: Target) => onTarget("counter.decrement", target),
  reset: (target: Target) => onTarget("counter.reset", target),
  // `value` is a whole number within the counter's `minimum` and `maximum`.
  setValue: (target: Target, value: number) =>
    onTarget("counter.set_value", target, { value }),
};

// Values passed to a script as `variables`.
export type ScriptVariables = Readonly<Record<string, Schema.Json>>;

export const Script = {
  // Starts the script without waiting for it to finish.
  turnOn: (target: Target, variables?: ScriptVariables) =>
    onTarget("script.turn_on", target, { variables }),
  turnOff: (target: Target) => onTarget("script.turn_off", target),
  toggle: (target: Target) => onTarget("script.toggle", target),
  // Runs the script through its own action and waits for it to finish. The
  // response is whatever the script returns with a `stop` action.
  run: (entityId: EntityId<"script">, variables?: ScriptVariables): Action => ({
    ...onDomain(entityId, variables),
    return_response: true,
  }),
  reload: reload("script"),
};

export const Automation = {
  turnOn: (target: Target) => onTarget("automation.turn_on", target),
  // `stopActions: false` lets running actions finish; Core stops them by
  // default.
  turnOff: (target: Target, options?: { readonly stopActions?: boolean }) =>
    onTarget("automation.turn_off", target, {
      stop_actions: options?.stopActions,
    }),
  toggle: (target: Target) => onTarget("automation.toggle", target),
  // Runs the actions. `skipCondition: false` checks the conditions first;
  // Core skips them by default.
  trigger: (target: Target, options?: { readonly skipCondition?: boolean }) =>
    onTarget("automation.trigger", target, {
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
  turnOn: (target: Target, options?: SceneTransitionOptions) =>
    onTarget("scene.turn_on", target, { transition: options?.transition }),
  // Sets entity states without creating a scene.
  apply: (entities: SceneEntities, options?: SceneTransitionOptions) =>
    onDomain("scene.apply", { entities, transition: options?.transition }),
  create: (data: SceneCreateData) => onDomain("scene.create", data),
  // Deletes a scene made with `create`.
  delete: (target: Target) => onTarget("scene.delete", target),
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
  start: (target: Target, duration?: DurationValue) =>
    onTarget("timer.start", target, { duration }),
  pause: (target: Target) => onTarget("timer.pause", target),
  cancel: (target: Target) => onTarget("timer.cancel", target),
  finish: (target: Target) => onTarget("timer.finish", target),
  // Adds `duration` to a running timer; negative values shorten it.
  change: (target: Target, duration: DurationValue) =>
    onTarget("timer.change", target, { duration }),
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
  getSchedule: (target: Target): Action => ({
    action: "schedule.get_schedule",
    target,
    return_response: true,
  }),
  // Reads each schedule's week, keyed by entity ID, from a
  // `schedule.get_schedule` response.
  schedulesFrom: (response: Schema.Json | null) =>
    decodeScheduleResponse(response).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode schedules: ${error.message}`,
          }),
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
  turnOn: (target: Target, data?: FanTurnOnData) =>
    onTarget("fan.turn_on", target, data),
  // `percentage` is 0 to 100; 0 turns the fan off.
  setPercentage: (target: Target, percentage: number) =>
    onTarget("fan.set_percentage", target, { percentage }),
  // `step` is in percent; Core uses the fan's own step by default.
  increaseSpeed: (target: Target, step?: number) =>
    onTarget("fan.increase_speed", target, { percentage_step: step }),
  decreaseSpeed: (target: Target, step?: number) =>
    onTarget("fan.decrease_speed", target, { percentage_step: step }),
  setPresetMode: (target: Target, presetMode: string) =>
    onTarget("fan.set_preset_mode", target, { preset_mode: presetMode }),
  oscillate: (target: Target, oscillating: boolean) =>
    onTarget("fan.oscillate", target, { oscillating }),
  setDirection: (target: Target, direction: "forward" | "reverse") =>
    onTarget("fan.set_direction", target, { direction }),
};

export const Humidifier = {
  ...switchable("humidifier"),
  // `mode` is one of the humidifier's `available_modes`.
  setMode: (target: Target, mode: string) =>
    onTarget("humidifier.set_mode", target, { mode }),
  // `humidity` is a whole percentage.
  setHumidity: (target: Target, humidity: number) =>
    onTarget("humidifier.set_humidity", target, { humidity }),
};

export const WaterHeater = {
  turnOn: (target: Target) => onTarget("water_heater.turn_on", target),
  turnOff: (target: Target) => onTarget("water_heater.turn_off", target),
  // `temperature` is in the entity's unit. `operationMode` also switches
  // mode, to one of the entity's `operation_list`.
  setTemperature: (
    target: Target,
    temperature: number,
    options?: { readonly operationMode?: string },
  ) =>
    onTarget("water_heater.set_temperature", target, {
      temperature,
      operation_mode: options?.operationMode,
    }),
  setOperationMode: (target: Target, operationMode: string) =>
    onTarget("water_heater.set_operation_mode", target, {
      operation_mode: operationMode,
    }),
  setAwayMode: (target: Target, awayMode: boolean) =>
    onTarget("water_heater.set_away_mode", target, { away_mode: awayMode }),
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

const mediaPlayerAction = (action: string) => (target: Target) =>
  onTarget(`media_player.${action}`, target);

export const MediaPlayer = {
  ...switchable("media_player"),
  volumeUp: mediaPlayerAction("volume_up"),
  volumeDown: mediaPlayerAction("volume_down"),
  // `volume` is 0 to 1.
  setVolume: (target: Target, volume: number) =>
    onTarget("media_player.volume_set", target, { volume_level: volume }),
  mute: (target: Target, muted: boolean) =>
    onTarget("media_player.volume_mute", target, { is_volume_muted: muted }),
  play: mediaPlayerAction("media_play"),
  pause: mediaPlayerAction("media_pause"),
  playPause: mediaPlayerAction("media_play_pause"),
  stop: mediaPlayerAction("media_stop"),
  nextTrack: mediaPlayerAction("media_next_track"),
  previousTrack: mediaPlayerAction("media_previous_track"),
  // `position` is in seconds.
  seek: (target: Target, position: number) =>
    onTarget("media_player.media_seek", target, { seek_position: position }),
  playMedia: (target: Target, data: MediaPlayerPlayMediaData) =>
    onTarget("media_player.play_media", target, data),
  // `source` is one of the player's `source_list`.
  selectSource: (target: Target, source: string) =>
    onTarget("media_player.select_source", target, { source }),
  // `soundMode` is one of the player's `sound_mode_list`.
  selectSoundMode: (target: Target, soundMode: string) =>
    onTarget("media_player.select_sound_mode", target, {
      sound_mode: soundMode,
    }),
  clearPlaylist: mediaPlayerAction("clear_playlist"),
  setShuffle: (target: Target, shuffle: boolean) =>
    onTarget("media_player.shuffle_set", target, { shuffle }),
  setRepeat: (target: Target, repeat: "off" | "all" | "one") =>
    onTarget("media_player.repeat_set", target, { repeat }),
  // Groups other players with this one for synchronised playback.
  join: (target: Target, members: ReadonlyArray<EntityId<"media_player">>) =>
    onTarget("media_player.join", target, { group_members: members }),
  unjoin: mediaPlayerAction("unjoin"),
  // Responds with the media under `location`, or the top level.
  browseMedia: (target: Target, location?: MediaLocation): Action => ({
    ...onTarget("media_player.browse_media", target, mediaLocation(location)),
    return_response: true,
  }),
  search: (
    target: Target,
    query: string,
    location?: MediaLocation,
  ): Action => ({
    ...onTarget("media_player.search_media", target, {
      search_query: query,
      ...mediaLocation(location),
    }),
    return_response: true,
  }),
};

const vacuumAction = (action: string) => (target: Target) =>
  onTarget(`vacuum.${action}`, target);

export const Vacuum = {
  start: vacuumAction("start"),
  pause: vacuumAction("pause"),
  startPause: vacuumAction("start_pause"),
  stop: vacuumAction("stop"),
  returnToBase: vacuumAction("return_to_base"),
  locate: vacuumAction("locate"),
  cleanSpot: vacuumAction("clean_spot"),
  // Cleans the areas mapped to the vacuum's segments, by area ID.
  cleanArea: (target: Target, areaIds: ReadonlyArray<string>) =>
    onTarget("vacuum.clean_area", target, { cleaning_area_id: areaIds }),
  // `fanSpeed` is one of the vacuum's `fan_speed_list`.
  setFanSpeed: (target: Target, fanSpeed: string) =>
    onTarget("vacuum.set_fan_speed", target, { fan_speed: fanSpeed }),
  // Sends a command the integration understands, with optional parameters.
  sendCommand: (target: Target, command: string, params?: Schema.Json) =>
    onTarget("vacuum.send_command", target, { command, params }),
};

const lawnMowerAction = (action: string) => (target: Target) =>
  onTarget(`lawn_mower.${action}`, target);

export const LawnMower = {
  startMowing: lawnMowerAction("start_mowing"),
  pause: lawnMowerAction("pause"),
  stop: lawnMowerAction("stop"),
  dock: lawnMowerAction("dock"),
};

const alarmAction =
  (action: string) => (target: Target, options?: LockOptions) =>
    onTarget(`alarm_control_panel.${action}`, target, {
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
    target: Target,
    options?: { readonly version?: string; readonly backup?: boolean },
  ) =>
    onTarget("update.install", target, {
      version: options?.version,
      backup: options?.backup,
    }),
  skip: (target: Target) => onTarget("update.skip", target),
  clearSkipped: (target: Target) => onTarget("update.clear_skipped", target),
};

export interface NotifyMessage {
  readonly message: string;
  readonly title?: string;
}

export const Notify = {
  // Sends to a notify entity.
  sendMessage: (target: Target, message: NotifyMessage) =>
    onTarget("notify.send_message", target, { ...message }),
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
    target: Target,
    mediaPlayer: EntityId<"media_player">,
    message: string,
    options?: TtsSpeakOptions,
  ) =>
    onTarget("tts.speak", target, {
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
  getItems: (target: Target, status?: ReadonlyArray<TodoStatus>): Action => ({
    ...onTarget("todo.get_items", target, { status }),
    return_response: true,
  }),
  addItem: (target: Target, item: string, fields?: TodoItemFields) =>
    onTarget("todo.add_item", target, { item, ...fields }),
  // `item` is the item's name or UID.
  updateItem: (
    target: Target,
    item: string,
    changes: TodoItemFields & {
      readonly rename?: string;
      readonly status?: TodoStatus;
    },
  ) => onTarget("todo.update_item", target, { item, ...changes }),
  removeItem: (target: Target, items: ReadonlyArray<string>) =>
    onTarget("todo.remove_item", target, { item: items }),
  removeCompletedItems: (target: Target) =>
    onTarget("todo.remove_completed_items", target),
};

export const Weather = {
  // Responds with forecasts keyed by entity ID.
  getForecasts: (
    target: Target,
    type: "daily" | "hourly" | "twice_daily",
  ): Action => ({
    ...onTarget("weather.get_forecasts", target, { type }),
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
  snapshot: (target: Target, filename: string) =>
    onTarget("image.snapshot", target, { filename }),
};

export const ImageProcessing = {
  scan: (target: Target) => onTarget("image_processing.scan", target),
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
    target: Target,
    summary: string,
    when: CalendarEventWhen,
    options?: { readonly description?: string; readonly location?: string },
  ) =>
    onTarget("calendar.create_event", target, {
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

export const Alert = switchable("alert");

export const UtilityMeter = {
  // Resets the meters behind these tariff selects, every tariff at once.
  reset: (entityIds: ReadonlyArray<EntityId<"select">>) =>
    onDomain("utility_meter.reset", { entity_id: entityIds }),
  // Sets the meter sensors to `value`.
  calibrate: (target: Target, value: number) =>
    onTarget("utility_meter.calibrate", target, { value }),
};

export const Logbook = {
  // Adds an entry, such as "Kitchen is being used". `entityId` ties the entry
  // to an entity; `domain` picks its icon.
  log: (
    name: string,
    message: string,
    options?: { readonly entityId?: string; readonly domain?: string },
  ) =>
    onDomain("logbook.log", {
      name,
      message,
      entity_id: options?.entityId,
      domain: options?.domain,
    }),
};

export const SystemLogLevel = Schema.Literals([
  "debug",
  "info",
  "warning",
  "error",
  "critical",
]);

export type SystemLogLevel = typeof SystemLogLevel.Type;

export const SystemLog = {
  // Writes to the log and the system log. Core uses `error` and the
  // `homeassistant.components.system_log.external` logger by default.
  write: (
    message: string,
    options?: { readonly level?: SystemLogLevel; readonly logger?: string },
  ) =>
    onDomain("system_log.write", {
      message,
      level: options?.level,
      logger: options?.logger,
    }),
  clear: () => onDomain("system_log.clear"),
};

export const LogLevel = Schema.Literals([
  "debug",
  "info",
  "warning",
  "error",
  "fatal",
  "critical",
]);

export type LogLevel = typeof LogLevel.Type;

export const LoggerActions = {
  setDefaultLevel: (level: LogLevel) =>
    onDomain("logger.set_default_level", { level }),
  // Sets each logger's level, keyed by logger name, such as
  // `homeassistant.components.mqtt`.
  setLevel: (levels: Readonly<Record<string, LogLevel>>) =>
    onDomain("logger.set_level", levels),
};

const Days = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 365 }));

// `recorder.purge` data. `keep_days` defaults to the recorder's
// `purge_keep_days`; `repack` frees the disk space; `apply_filter` also
// removes what the recorder's filters now exclude.
export const RecorderPurgeData = Schema.Struct({
  keep_days: Schema.optionalKey(Days),
  repack: Schema.optionalKey(Schema.Boolean),
  apply_filter: Schema.optionalKey(Schema.Boolean),
});

export type RecorderPurgeData = typeof RecorderPurgeData.Type;

// What `recorder.purge_entities` removes: entities from `target`, whole
// domains, or entity ID globs such as `sensor.weather_*`. Set at least one.
export interface RecorderPurgeEntitiesOptions {
  readonly target?: Target;
  readonly domains?: ReadonlyArray<string>;
  readonly entityGlobs?: ReadonlyArray<string>;
  // Keeps this many days of history; Core removes all of it by default.
  readonly keepDays?: number;
}

export const StatisticsPeriod = Schema.Literals([
  "5minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
]);

export type StatisticsPeriod = typeof StatisticsPeriod.Type;

export const StatisticType = Schema.Literals([
  "change",
  "last_reset",
  "max",
  "mean",
  "min",
  "state",
  "sum",
]);

export type StatisticType = typeof StatisticType.Type;

// `recorder.get_statistics` data. `statistic_ids` are entity IDs or external
// statistic IDs; `units` converts by unit class, such as `{ "energy": "kWh" }`.
export const RecorderGetStatisticsData = Schema.Struct({
  start_time: DateTimeString,
  end_time: Schema.optionalKey(DateTimeString),
  statistic_ids: Schema.Array(Schema.String).check(Schema.isMinLength(1)),
  period: StatisticsPeriod,
  types: Schema.Array(StatisticType).check(Schema.isMinLength(1)),
  units: Schema.optionalKey(Schema.Record(Schema.String, Schema.String)),
});

export type RecorderGetStatisticsData = typeof RecorderGetStatisticsData.Type;

// One period of a statistic. Times are UTC ISO 8601; only the requested
// types with a value are present.
export const StatisticRow = Schema.Struct({
  start: Schema.String,
  end: Schema.String,
  last_reset: Schema.optionalKey(Schema.String),
  state: Schema.optionalKey(Schema.Finite),
  sum: Schema.optionalKey(Schema.Finite),
  min: Schema.optionalKey(Schema.Finite),
  max: Schema.optionalKey(Schema.Finite),
  mean: Schema.optionalKey(Schema.Finite),
  change: Schema.optionalKey(Schema.Finite),
});

export type StatisticRow = typeof StatisticRow.Type;

const decodeStatisticsResponse = Schema.decodeUnknownEffect(
  Schema.Struct({
    statistics: Schema.Record(Schema.String, Schema.Array(StatisticRow)),
  }),
);

export const Recorder = {
  purge: (data?: RecorderPurgeData) => onDomain("recorder.purge", data),
  purgeEntities: (options: RecorderPurgeEntitiesOptions): Action => {
    const action = onDomain("recorder.purge_entities", {
      domains: options.domains,
      entity_globs: options.entityGlobs,
      keep_days: options.keepDays,
    });

    return options.target === undefined
      ? action
      : { ...action, target: options.target };
  },
  // Starts recording again after `disable`.
  enable: () => onDomain("recorder.enable"),
  // Stops recording until `enable` or a restart.
  disable: () => onDomain("recorder.disable"),
  getStatistics: (data: RecorderGetStatisticsData): Action => ({
    ...onDomain("recorder.get_statistics", data),
    return_response: true,
  }),
  // Reads each statistic's rows, keyed by statistic ID, from a
  // `recorder.get_statistics` response.
  statisticsFrom: (response: Schema.Json | null) =>
    decodeStatisticsResponse(response).pipe(
      Effect.map(({ statistics }) => statistics),
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode statistics: ${error.message}`,
          }),
      ),
    ),
};

const FrontendSetThemeFields = Schema.Struct({
  name: Schema.optionalKey(Schema.String),
  name_dark: Schema.optionalKey(Schema.String),
  mode: Schema.optionalKey(Schema.Literals(["light", "dark"])),
});

type FrontendSetThemeFields = typeof FrontendSetThemeFields.Type;

// `frontend.set_theme` data. `name` sets the default theme, or with `mode`
// the default for that mode; `name_dark` sets the dark mode default. The
// theme name `none` goes back to Home Assistant's own theme.
export const FrontendSetThemeData = FrontendSetThemeFields.check(
  atLeastOne<FrontendSetThemeFields>(["name", "name_dark"]),
  exclusive<FrontendSetThemeFields>("dark mode", ["name_dark", "mode"]),
);

export type FrontendSetThemeData = typeof FrontendSetThemeData.Type;

export const Frontend = {
  setTheme: (data: FrontendSetThemeData) =>
    onDomain("frontend.set_theme", data),
  reloadThemes: () => onDomain("frontend.reload_themes"),
};

// Without the Supervisor only; with it, back up through `Hassio`.
export const Backup = {
  // Backs up Home Assistant to the default backup location.
  create: () => onDomain("backup.create"),
  // Backs up with the automatic backup settings.
  createAutomatic: () => onDomain("backup.create_automatic"),
};

// `wake_on_lan.send_magic_packet` data. Core broadcasts on port 9 to the
// whole network by default.
export const WakeOnLanData = Schema.Struct({
  mac: Schema.String,
  secureon_password: Schema.optionalKey(Schema.String),
  broadcast_address: Schema.optionalKey(Schema.String),
  broadcast_port: Schema.optionalKey(
    Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 65535 })),
  ),
});

export type WakeOnLanData = typeof WakeOnLanData.Type;

export const WakeOnLan = {
  sendMagicPacket: (data: WakeOnLanData) =>
    onDomain("wake_on_lan.send_magic_packet", data),
};

// Domains whose only action reloads their YAML configuration.
export const YamlReloadDomain = Schema.Literals([
  "bayesian",
  "command_line",
  "derivative",
  "filter",
  "generic_thermostat",
  "history_stats",
  "intent_script",
  "min_max",
  "person",
  "rest",
  "statistics",
  "template",
  "trend",
  "universal",
  "zone",
]);

export type YamlReloadDomain = typeof YamlReloadDomain.Type;

export const reloadYaml = (domain: YamlReloadDomain) =>
  onDomain(`${domain}.reload`);
