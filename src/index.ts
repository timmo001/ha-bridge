import { BunRuntime, BunServices, BunSocket } from "@effect/platform-bun";
import {
  Cause,
  Console,
  Data,
  Effect,
  FileSystem,
  Layer,
  Logger,
  Option,
  Predicate,
  Schema,
  Stream,
} from "effect";
import { Argument, CliError, Command, Flag } from "effect/cli";
import { RpcClientError } from "effect/rpc/RpcClientError";
import packageJson from "../package.json" with { type: "json" };
import {
  AssistSatellite,
  AssistSatelliteAnnounceOptions,
  AssistSatelliteAskQuestionData,
  AiTask,
  AlarmControlPanel,
  AssistSatelliteStartConversationData,
  Automation,
  Button,
  Camera,
  Calendar,
  CalendarActions,
  Climate,
  Conversation,
  Counter,
  DateEntity,
  DateString,
  DateTimeEntity,
  DateTimeString,
  DeviceTracker,
  DeviceTrackerSeeData,
  DurationValue,
  Fan,
  FanTurnOnData,
  Group,
  GroupSetData,
  HomeAssistantCore,
  Humidifier,
  Image,
  ImageProcessing,
  ClimateSetTemperatureData,
  Cover,
  HvacMode,
  InputBoolean,
  InputButton,
  InputDateTime,
  InputDateTimeSetData,
  InputSelect,
  InputText,
  InputNumber,
  LawnMower,
  Light,
  Lock,
  MediaPlayer,
  MediaPlayerPlayMediaData,
  Notify,
  NumberEntity,
  PersistentNotification,
  Person,
  Scene,
  SceneCreateData,
  SceneEntities,
  Schedule,
  Script,
  Select,
  Text,
  TimeEntity,
  TimeString,
  Todo,
  TodoItemFields,
  Tts,
  Update,
  Vacuum,
  Weather,
  WaterHeater,
  Timer,
  Zone,
  Remote,
  RemoteLearnCommandData,
  RemoteSendCommandData,
  Siren,
  SirenTurnOnData,
  Valve,
  LightTurnOffData,
  LightTurnOnData,
  Switch,
  type Action,
  type CoverMoveOptions,
  type CalendarEventWhen,
  type EntityId,
  type LockOptions,
  type SelectStepOptions,
  type Target,
} from "@timmo001/effect-ha";
import {
  BridgeClient,
  resolveSocketPath,
  type EntityUpdate,
  type SearchMatch,
  type SearchResults,
} from "@timmo001/effect-ha-bridge";
import { serve as serveBridge } from "./bridge/Server.js";
import {
  invalidAnswerOptionMessage,
  parseAnswerOptions,
} from "./homeassistant/assistSatellite.js";
import {
  climateStateText,
  coverStateText,
  entityBar,
  entityFields,
  searchLine,
  stateTextBar,
} from "./cli/output.js";
import { BridgeConfig } from "./config/Config.js";
import {
  invalidInputNumberMessage,
  parseInputNumberValue,
} from "./homeassistant/inputNumber.js";
import { lightData } from "./homeassistant/light.js";
import {
  commandItems,
  commandKeys,
  toCommandMatch,
  type CommandMatch,
} from "./search/commands.js";
import { Search, selectResults } from "./search/Search.js";

const haBridge = Command.make("ha-bridge").pipe(
  Command.withSharedFlags({
    socket: Flag.String("socket").pipe(
      Flag.withDescription(
        "Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)",
      ),
      Flag.optional,
    ),
  }),
  Command.withDescription(
    "One shared Home Assistant connection for your machine, served to local apps over a single socket",
  ),
);

const socketPath = Effect.flatMap(haBridge, ({ socket }) =>
  resolveSocketPath(socket),
);

class CommandError extends Data.TaggedError("CommandError")<{
  readonly message: string;
}> {}

// Runs a client effect against the bridge socket, explaining connection failures.
const withBridge = <A, E, R>(
  effect: Effect.Effect<A, E | RpcClientError, R | BridgeClient>,
) =>
  Effect.gen(function* () {
    const path = yield* socketPath;

    return yield* effect.pipe(
      Effect.catchIf(
        (error) => error instanceof RpcClientError,
        (error) =>
          Effect.fail(
            new CommandError({
              message: `Could not reach the bridge at ${path} (is ha-bridge serve running?): ${error.message}`,
            }),
          ),
      ),
      Effect.provide(BridgeClient.layer(path)),
    );
  });

const callAction = Effect.fn("callAction")(function* (action: Action) {
  const client = yield* BridgeClient;

  return yield* client.CallAction(action).pipe(
    Effect.catchTag("HomeAssistantError", (error) =>
      Effect.fail(
        new CommandError({
          message: `home assistant action ${action.action} failed: ${error.message}`,
        }),
      ),
    ),
  );
});

const failWith = (message: string) =>
  Effect.fail(new CommandError({ message }));

const nameArgument = (description: string) =>
  Argument.String("name").pipe(Argument.withDescription(description));

const domainCommand = <
  const Subcommands extends ReadonlyArray<Command.Command.SubcommandEntry>,
>(
  name: string,
  alias: string | undefined,
  description: string,
  subcommands: Subcommands,
) =>
  Command.make(name).pipe(
    (command) =>
      alias === undefined ? command : command.pipe(Command.withAlias(alias)),
    Command.withDescription(description),
    Command.withSubcommands(subcommands),
  );

const entityActionCommand = <const Domain extends string>(
  domain: Domain,
  name: string,
  toAction: (entityId: EntityId<Domain>) => Action,
  description: string,
) =>
  Command.make(
    name,
    { name: nameArgument(`Entity name without the ${domain}. prefix`) },
    (input) => callAction(toAction(`${domain}.${input.name}`)).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const toggleCommands = <const Domain extends string>(
  domain: Domain,
  actions: Record<
    "turnOn" | "turnOff" | "toggle",
    (entityId: EntityId<Domain>) => Action
  >,
) => [
  entityActionCommand(domain, "turn-on", actions.turnOn, "Turn on").pipe(
    Command.withAlias("on"),
  ),
  entityActionCommand(domain, "turn-off", actions.turnOff, "Turn off").pipe(
    Command.withAlias("off"),
  ),
  entityActionCommand(domain, "toggle", actions.toggle, "Toggle").pipe(
    Command.withAlias("t"),
  ),
];

const reloadCommand = (domain: string, toAction: () => Action) =>
  Command.make("reload", {}, () =>
    callAction(toAction()).pipe(withBridge),
  ).pipe(Command.withDescription(`Reload ${domain} helpers from YAML`));

const optionalFlag = <A>(flag: Flag.Flag<A>, description: string) =>
  flag.pipe(Flag.withDescription(description), Flag.optional);

// Leaves unset options out, so schemas see missing keys rather than undefined.
const setFields = (
  fields: Readonly<Record<string, Option.Option<Schema.Json>>>,
) =>
  Object.fromEntries(
    Object.entries(fields).flatMap(([key, value]) =>
      Option.isSome(value) ? [[key, value.value]] : [],
    ),
  );

// Reports a failed effect-ha schema check on data built from flags.
const decodeData = <A>(
  label: string,
  decoded: Effect.Effect<A, Schema.SchemaError>,
) =>
  decoded.pipe(
    Effect.mapError(
      (error) =>
        new CommandError({ message: `invalid ${label}: ${error.message}` }),
    ),
  );

const parsePercent = (value: string) => {
  const position = /^[+-]?\d+$/.test(value) ? Number(value) : Number.NaN;

  return position >= 0 && position <= 100
    ? Effect.succeed(position)
    : failWith("value must be an integer from 0 to 100");
};

const percentArgument = Argument.String("position").pipe(
  Argument.withDescription("Position from 0 to 100"),
);

const stateWatchCommand = (
  domain: string,
  toText: (state: EntityUpdate["state"]) => string,
) =>
  Command.make(
    "watch",
    { name: nameArgument(`Entity name without the ${domain}. prefix`) },
    (input) =>
      Effect.gen(function* () {
        const client = yield* BridgeClient;

        yield* client
          .WatchEntity({ entityId: `${domain}.${input.name}` })
          .pipe(
            Stream.runForEach(({ state, name }) =>
              Console.log(stateTextBar(state, name, toText)),
            ),
          );
      }).pipe(withBridge),
  ).pipe(
    Command.withAlias("w"),
    Command.withDescription("Print bar JSON now and on every change"),
  );

const inputNumberName = nameArgument(
  "Entity name without the input_number. prefix",
);

const areaArgument = (description: string) =>
  Argument.String("area_id").pipe(Argument.withDescription(description));

const preannounceFlags = {
  preannounce: optionalFlag(
    Flag.Boolean("preannounce"),
    "Play the pre-announcement sound first (the default); --no-preannounce skips it",
  ),
  preannounce_media_id: optionalFlag(
    Flag.String("preannounce-media-id"),
    "Media ID to play as the pre-announcement",
  ),
};

const decodeAnnounceOptions = Schema.decodeUnknownEffect(
  AssistSatelliteAnnounceOptions,
);

const decodeStartConversation = Schema.decodeUnknownEffect(
  AssistSatelliteStartConversationData,
);

const decodeAskQuestion = Schema.decodeUnknownEffect(
  AssistSatelliteAskQuestionData,
);

const assistSatellite = domainCommand(
  "assist_satellite",
  "as",
  "Assist satellite actions",
  [
    Command.make(
      "announce",
      {
        area: areaArgument("Area to announce in"),
        message: Argument.String("message").pipe(
          Argument.withDescription("Message to announce"),
        ),
        media_id: optionalFlag(
          Flag.String("media-id"),
          "Media ID to play instead of speaking the message",
        ),
        ...preannounceFlags,
      },
      ({ area, message, ...flags }) =>
        Effect.gen(function* () {
          const options = yield* decodeData(
            "announce options",
            decodeAnnounceOptions(setFields(flags)),
          );

          yield* callAction(
            AssistSatellite.announce({ area_id: area }, message, options),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withAlias("a"),
      Command.withDescription("Announce a message on an area's satellites"),
    ),
    Command.make(
      "start-conversation",
      {
        area: areaArgument("Area to start the conversation in"),
        message: Argument.String("message").pipe(
          Argument.withDescription("Message to start with"),
        ),
        start_media_id: optionalFlag(
          Flag.String("media-id"),
          "Media ID to play instead of speaking the message",
        ),
        extra_system_prompt: optionalFlag(
          Flag.String("extra-system-prompt"),
          "Context for the conversation agent, such as why it was started",
        ),
        ...preannounceFlags,
      },
      ({ area, message, ...flags }) =>
        Effect.gen(function* () {
          const data = yield* decodeData(
            "conversation options",
            decodeStartConversation({
              start_message: message,
              ...setFields(flags),
            }),
          );

          yield* callAction(
            AssistSatellite.startConversation({ area_id: area }, data),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withAlias("c"),
      Command.withDescription(
        "Speak a message on an area's satellites, then listen for a reply",
      ),
    ),
    Command.make(
      "ask-question",
      {
        name: nameArgument("Entity name without the assist_satellite. prefix"),
        question: Argument.String("question").pipe(
          Argument.withDescription("Question to ask"),
        ),
        answers: Flag.String("answer").pipe(
          Flag.withDescription(
            "Possible answer as id=sentence,sentence; repeat for more answers",
          ),
          Flag.atLeast(0),
        ),
        question_media_id: optionalFlag(
          Flag.String("media-id"),
          "Media ID to play instead of speaking the question",
        ),
        ...preannounceFlags,
      },
      ({ name, question, answers, ...flags }) =>
        Effect.gen(function* () {
          const answerOptions = parseAnswerOptions(answers);

          if (answerOptions === undefined) {
            return yield* failWith(invalidAnswerOptionMessage);
          }

          const data = yield* decodeData(
            "question options",
            decodeAskQuestion({
              question,
              ...setFields({
                ...flags,
                answers: Option.some(answerOptions).pipe(
                  Option.filter((options) => options.length > 0),
                ),
              }),
            }),
          );

          const response = yield* callAction(
            AssistSatellite.askQuestion(`assist_satellite.${name}`, data),
          );

          const reply = yield* AssistSatellite.answerFrom(response).pipe(
            Effect.mapError(
              (error) => new CommandError({ message: error.message }),
            ),
          );

          yield* Console.log(JSON.stringify(reply));
        }).pipe(withBridge),
    ).pipe(
      Command.withAlias("q"),
      Command.withDescription(
        "Ask a question on a satellite and print the reply as JSON",
      ),
    ),
  ],
);

const inputNumber = domainCommand(
  "input_number",
  "in",
  "Input number actions",
  [
    entityActionCommand(
      "input_number",
      "increment",
      InputNumber.increment,
      "Raise the value by one step",
    ),
    entityActionCommand(
      "input_number",
      "decrement",
      InputNumber.decrement,
      "Lower the value by one step",
    ),
    Command.make(
      "set-value",
      {
        name: inputNumberName,
        value: Argument.String("value").pipe(
          Argument.withDescription("New value"),
        ),
      },
      (input) =>
        Effect.gen(function* () {
          const value = parseInputNumberValue(input.value);

          if (value === undefined) {
            return yield* failWith(invalidInputNumberMessage);
          }

          yield* callAction(
            InputNumber.setValue(`input_number.${input.name}`, value),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Set the value")),
    reloadCommand("input_number", InputNumber.reload),
  ],
);

const lightName = nameArgument("Entity name without the light. prefix");

const lightOffFlags = {
  transition: optionalFlag(
    Flag.String("transition"),
    "Transition time in seconds",
  ),
  flash: optionalFlag(
    Flag.Literals("flash", ["short", "long"]),
    "Flash the light",
  ),
};

const lightOnFlags = {
  ...lightOffFlags,
  brightness: optionalFlag(
    Flag.String("brightness"),
    "Brightness from 0 to 255",
  ),
  brightness_pct: optionalFlag(
    Flag.String("brightness-pct"),
    "Brightness from 0 to 100 percent",
  ),
  brightness_step: optionalFlag(
    Flag.String("brightness-step"),
    "Change the brightness by -255 to 255",
  ),
  brightness_step_pct: optionalFlag(
    Flag.String("brightness-step-pct"),
    "Change the brightness by -100 to 100 percent",
  ),
  profile: optionalFlag(
    Flag.String("profile"),
    "Light profile, for example relax",
  ),
  color_name: optionalFlag(
    Flag.String("color-name"),
    "Colour name, for example red",
  ),
  color_temp_kelvin: optionalFlag(
    Flag.String("color-temp-kelvin"),
    "Colour temperature in kelvin",
  ),
  hs_color: optionalFlag(
    Flag.String("hs-color"),
    "Hue and saturation, for example 300,70",
  ),
  rgb_color: optionalFlag(
    Flag.String("rgb-color"),
    "Red, green and blue, for example 255,100,100",
  ),
  rgbw_color: optionalFlag(
    Flag.String("rgbw-color"),
    "Red, green, blue and white, for example 255,100,100,50",
  ),
  rgbww_color: optionalFlag(
    Flag.String("rgbww-color"),
    "Red, green, blue, cold and warm white, for example 255,100,100,50,70",
  ),
  xy_color: optionalFlag(
    Flag.String("xy-color"),
    "XY colour, for example 0.52,0.43",
  ),
  white: optionalFlag(
    Flag.String("white"),
    "true for white mode, or a white brightness from 0 to 255",
  ),
  effect: optionalFlag(
    Flag.String("effect"),
    "Effect from the light's effect_list",
  ),
};

const decodeLightTurnOn = Schema.decodeUnknownEffect(LightTurnOnData);

const decodeLightTurnOff = Schema.decodeUnknownEffect(LightTurnOffData);

const lightOnCommand = (
  name: string,
  toAction: (entityId: EntityId<"light">, data: LightTurnOnData) => Action,
  description: string,
) =>
  Command.make(
    name,
    { name: lightName, ...lightOnFlags },
    ({ name, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "light options",
          decodeLightTurnOn(lightData(flags)),
        );

        yield* callAction(toAction(`light.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const light = domainCommand("light", "l", "Light actions", [
  lightOnCommand("turn-on", Light.turnOn, "Turn on").pipe(
    Command.withAlias("on"),
  ),
  Command.make(
    "turn-off",
    { name: lightName, ...lightOffFlags },
    ({ name, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "light options",
          decodeLightTurnOff(lightData(flags)),
        );

        yield* callAction(Light.turnOff(`light.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("off"), Command.withDescription("Turn off")),
  lightOnCommand("toggle", Light.toggle, "Toggle").pipe(Command.withAlias("t")),
]);

const coverName = nameArgument("Entity name without the cover. prefix");

const speedFlag = Flag.String("speed").pipe(
  Flag.withDescription("Speed, one of the cover's supported_speeds"),
  Flag.optional,
);

const coverMoveCommand = (
  name: string,
  toAction: (entityId: EntityId<"cover">, options: CoverMoveOptions) => Action,
  description: string,
) =>
  Command.make(name, { name: coverName, speed: speedFlag }, (input) =>
    callAction(
      toAction(`cover.${input.name}`, {
        speed: Option.getOrUndefined(input.speed),
      }),
    ).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const cover = domainCommand("cover", "c", "Cover actions", [
  stateWatchCommand("cover", coverStateText),
  coverMoveCommand("open", Cover.open, "Open the cover"),
  coverMoveCommand("close", Cover.close, "Close the cover"),
  entityActionCommand(
    "cover",
    "toggle",
    Cover.toggle,
    "Open or close the cover",
  ),
  entityActionCommand("cover", "stop", Cover.stop, "Stop the cover"),
  Command.make(
    "position",
    { name: coverName, position: percentArgument, speed: speedFlag },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);
        yield* callAction(
          Cover.setPosition(`cover.${input.name}`, position, {
            speed: Option.getOrUndefined(input.speed),
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the position")),
  entityActionCommand("cover", "open-tilt", Cover.openTilt, "Open the tilt"),
  entityActionCommand("cover", "close-tilt", Cover.closeTilt, "Close the tilt"),
  entityActionCommand(
    "cover",
    "toggle-tilt",
    Cover.toggleTilt,
    "Open or close the tilt",
  ),
  entityActionCommand("cover", "stop-tilt", Cover.stopTilt, "Stop the tilt"),
  Command.make(
    "tilt-position",
    { name: coverName, position: percentArgument },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);
        yield* callAction(
          Cover.setTiltPosition(`cover.${input.name}`, position),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the tilt position")),
]);

const climateName = nameArgument("Entity name without the climate. prefix");

// Sets a mode the entity lists in an attribute, such as `fan_modes`.
const climateModeCommand = (
  name: string,
  label: string,
  example: string,
  toAction: (entityId: EntityId<"climate">, mode: string) => Action,
) =>
  Command.make(
    name,
    {
      name: climateName,
      mode: Argument.String("mode").pipe(
        Argument.withDescription(`${label}, for example ${example}`),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        if (input.mode === "") {
          return yield* failWith(`climate ${label.toLowerCase()} is required`);
        }

        yield* callAction(toAction(`climate.${input.name}`, input.mode));
      }).pipe(withBridge),
  ).pipe(Command.withDescription(`Set the ${label.toLowerCase()}`));

const decodeClimateSetTemperature = Schema.decodeUnknownEffect(
  ClimateSetTemperatureData,
);

const climate = domainCommand("climate", "cl", "Climate actions", [
  stateWatchCommand("climate", climateStateText),
  ...toggleCommands("climate", Climate),
  Command.make(
    "hvac-mode",
    {
      name: climateName,
      mode: Argument.Literals("mode", HvacMode.literals).pipe(
        Argument.withDescription("HVAC mode"),
      ),
    },
    (input) =>
      callAction(Climate.setHvacMode(`climate.${input.name}`, input.mode)).pipe(
        withBridge,
      ),
  ).pipe(Command.withDescription("Set the HVAC mode")),
  Command.make(
    "temperature",
    {
      name: climateName,
      temperature: Argument.Finite("temperature").pipe(
        Argument.withDescription("Target temperature"),
        Argument.optional,
      ),
      targetTempLow: optionalFlag(
        Flag.Finite("target-temp-low"),
        "Lower target temperature, set with --target-temp-high",
      ),
      targetTempHigh: optionalFlag(
        Flag.Finite("target-temp-high"),
        "Upper target temperature, set with --target-temp-low",
      ),
      hvacMode: optionalFlag(
        Flag.Literals("hvac-mode", HvacMode.literals),
        "HVAC mode to switch to",
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "climate temperature",
          decodeClimateSetTemperature(
            setFields({
              temperature: input.temperature,
              target_temp_low: input.targetTempLow,
              target_temp_high: input.targetTempHigh,
              hvac_mode: input.hvacMode,
            }),
          ),
        );

        yield* callAction(
          Climate.setTemperature(`climate.${input.name}`, data),
        );
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Set the target temperature, or a range with --target-temp-low and --target-temp-high",
    ),
  ),
  Command.make(
    "humidity",
    {
      name: climateName,
      humidity: Argument.Int("humidity").pipe(
        Argument.withDescription("Target humidity in percent"),
      ),
    },
    (input) =>
      callAction(
        Climate.setHumidity(`climate.${input.name}`, input.humidity),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Set the target humidity")),
  climateModeCommand(
    "preset-mode",
    "Preset mode",
    "away",
    Climate.setPresetMode,
  ),
  climateModeCommand("fan-mode", "Fan mode", "1 or auto", Climate.setFanMode),
  climateModeCommand("swing-mode", "Swing mode", "on", Climate.setSwingMode),
  climateModeCommand(
    "swing-horizontal-mode",
    "Horizontal swing mode",
    "on",
    Climate.setSwingHorizontalMode,
  ),
]);

const cameraName = nameArgument("Entity name without the camera. prefix");

const serverFilenameArgument = Argument.String("filename").pipe(
  Argument.withDescription(
    "Path on the Home Assistant host, in allowlist_external_dirs",
  ),
);

const camera = Command.make("camera").pipe(
  Command.withDescription("Camera actions"),
  Command.withSubcommands([
    Command.make(
      "snapshot",
      {
        name: cameraName,
        output: Argument.String("output").pipe(
          Argument.withDescription("File to write the image to"),
        ),
      },
      (input) =>
        Effect.gen(function* () {
          const client = yield* BridgeClient;
          const fs = yield* FileSystem.FileSystem;

          const snapshot = yield* client
            .CameraSnapshot({ entityId: `camera.${input.name}` })
            .pipe(
              Effect.mapError(
                (error) => new CommandError({ message: error.message }),
              ),
            );

          // Write beside the target, then rename, so readers never see a partial image.
          const temporary = `${input.output}.tmp.${process.pid}`;

          yield* fs.writeFile(temporary, snapshot.data, { mode: 0o600 }).pipe(
            Effect.andThen(fs.rename(temporary, input.output)),
            Effect.onError(() =>
              fs.remove(temporary, { force: true }).pipe(Effect.ignore),
            ),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Save the camera's current image")),
    entityActionCommand("camera", "turn-on", Camera.turnOn, "Turn on").pipe(
      Command.withAlias("on"),
    ),
    entityActionCommand("camera", "turn-off", Camera.turnOff, "Turn off").pipe(
      Command.withAlias("off"),
    ),
    entityActionCommand(
      "camera",
      "enable-motion-detection",
      Camera.enableMotionDetection,
      "Enable motion detection",
    ),
    entityActionCommand(
      "camera",
      "disable-motion-detection",
      Camera.disableMotionDetection,
      "Disable motion detection",
    ),
    Command.make(
      "server-snapshot",
      { name: cameraName, filename: serverFilenameArgument },
      (input) =>
        callAction(
          Camera.snapshot(`camera.${input.name}`, input.filename),
        ).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Save the camera's current image on the Home Assistant host",
      ),
    ),
    Command.make(
      "record",
      {
        name: cameraName,
        filename: serverFilenameArgument,
        duration: optionalFlag(
          Flag.Int("duration"),
          "Seconds to record (default: 30)",
        ),
        lookback: optionalFlag(
          Flag.Int("lookback"),
          "Seconds from before the call to include (default: 0)",
        ),
      },
      (input) =>
        callAction(
          Camera.record(`camera.${input.name}`, input.filename, {
            duration: Option.getOrUndefined(input.duration),
            lookback: Option.getOrUndefined(input.lookback),
          }),
        ).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Record the camera's stream on the Home Assistant host",
      ),
    ),
    Command.make(
      "play-stream",
      {
        name: cameraName,
        mediaPlayer: Argument.String("media_player").pipe(
          Argument.withDescription(
            "Media player name without the media_player. prefix",
          ),
        ),
      },
      (input) =>
        callAction(
          Camera.playStream(
            `camera.${input.name}`,
            `media_player.${input.mediaPlayer}`,
          ),
        ).pipe(withBridge),
    ).pipe(
      Command.withDescription("Play the camera's stream on a media player"),
    ),
  ]),
);

const codeFlag = optionalFlag(Flag.String("code"), "The lock's code");

const lockCommand = (
  name: string,
  toAction: (entityId: EntityId<"lock">, options: LockOptions) => Action,
  description: string,
) =>
  Command.make(
    name,
    {
      name: nameArgument("Entity name without the lock. prefix"),
      code: codeFlag,
    },
    (input) =>
      callAction(
        toAction(`lock.${input.name}`, {
          code: Option.getOrUndefined(input.code),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const lock = domainCommand("lock", undefined, "Lock actions", [
  lockCommand("lock", Lock.lock, "Lock"),
  lockCommand("unlock", Lock.unlock, "Unlock"),
  lockCommand("open", Lock.open, "Open the latch"),
]);

const button = domainCommand("button", undefined, "Button actions", [
  entityActionCommand("button", "press", Button.press, "Press the button"),
]);

const inputButton = domainCommand(
  "input_button",
  undefined,
  "Input button actions",
  [
    entityActionCommand(
      "input_button",
      "press",
      InputButton.press,
      "Press the button",
    ),
    reloadCommand("input_button", InputButton.reload),
  ],
);

const valveName = nameArgument("Entity name without the valve. prefix");

const valve = domainCommand("valve", undefined, "Valve actions", [
  entityActionCommand("valve", "open", Valve.open, "Open the valve"),
  entityActionCommand("valve", "close", Valve.close, "Close the valve"),
  entityActionCommand(
    "valve",
    "toggle",
    Valve.toggle,
    "Open or close the valve",
  ),
  entityActionCommand("valve", "stop", Valve.stop, "Stop the valve"),
  Command.make(
    "position",
    { name: valveName, position: percentArgument },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);

        yield* callAction(Valve.setPosition(`valve.${input.name}`, position));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the position")),
]);

const decodeSirenTurnOn = Schema.decodeUnknownEffect(SirenTurnOnData);

const siren = domainCommand("siren", undefined, "Siren actions", [
  Command.make(
    "turn-on",
    {
      name: nameArgument("Entity name without the siren. prefix"),
      tone: optionalFlag(
        Flag.String("tone"),
        "Tone, one of the siren's available_tones",
      ),
      duration: optionalFlag(Flag.Int("duration"), "Seconds to sound for"),
      volume_level: optionalFlag(
        Flag.Finite("volume-level"),
        "Volume from 0 to 1",
      ),
    },
    ({ name, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "siren options",
          decodeSirenTurnOn(setFields(flags)),
        );

        yield* callAction(Siren.turnOn(`siren.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("on"), Command.withDescription("Turn on")),
  entityActionCommand("siren", "turn-off", Siren.turnOff, "Turn off").pipe(
    Command.withAlias("off"),
  ),
  entityActionCommand("siren", "toggle", Siren.toggle, "Toggle").pipe(
    Command.withAlias("t"),
  ),
]);

const remoteName = nameArgument("Entity name without the remote. prefix");

const deviceFlag = optionalFlag(
  Flag.String("device"),
  "Device the command is for",
);

const commandsArgument = Argument.String("command").pipe(
  Argument.withDescription("Command to send; repeat for a sequence"),
  Argument.atLeast(1),
);

const decodeRemoteSendCommand = Schema.decodeUnknownEffect(
  RemoteSendCommandData,
);

const decodeRemoteLearnCommand = Schema.decodeUnknownEffect(
  RemoteLearnCommandData,
);

const remote = domainCommand("remote", undefined, "Remote actions", [
  Command.make(
    "turn-on",
    {
      name: remoteName,
      activity: optionalFlag(
        Flag.String("activity"),
        "Activity, one of the remote's activity_list",
      ),
    },
    (input) =>
      callAction(
        Remote.turnOn(`remote.${input.name}`, {
          activity: Option.getOrUndefined(input.activity),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withAlias("on"), Command.withDescription("Turn on")),
  entityActionCommand("remote", "turn-off", Remote.turnOff, "Turn off").pipe(
    Command.withAlias("off"),
  ),
  entityActionCommand("remote", "toggle", Remote.toggle, "Toggle").pipe(
    Command.withAlias("t"),
  ),
  Command.make(
    "send-command",
    {
      name: remoteName,
      command: commandsArgument,
      device: deviceFlag,
      num_repeats: optionalFlag(
        Flag.Int("num-repeats"),
        "Times to repeat the commands (default: 1)",
      ),
      delay_secs: optionalFlag(
        Flag.Finite("delay-secs"),
        "Seconds between commands (default: 0.4)",
      ),
      hold_secs: optionalFlag(
        Flag.Finite("hold-secs"),
        "Seconds to hold each command (default: 0)",
      ),
    },
    ({ name, command, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "remote command",
          decodeRemoteSendCommand({ command, ...setFields(flags) }),
        );

        yield* callAction(Remote.sendCommand(`remote.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Send commands")),
  Command.make(
    "learn-command",
    {
      name: remoteName,
      command: Argument.String("command").pipe(
        Argument.withDescription("Name for each command to learn"),
        Argument.atLeast(0),
      ),
      device: deviceFlag,
      command_type: optionalFlag(
        Flag.Literals("command-type", ["ir", "rf"]),
        "Command type (default: ir)",
      ),
      alternative: optionalFlag(
        Flag.Boolean("alternative"),
        "Learn an alternative code for the command",
      ),
      timeout: optionalFlag(
        Flag.Int("timeout"),
        "Seconds to wait for each command",
      ),
    },
    ({ name, command, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "remote learn options",
          decodeRemoteLearnCommand(
            setFields({
              ...flags,
              command: Option.some(command).pipe(
                Option.filter((commands) => commands.length > 0),
              ),
            }),
          ),
        );

        yield* callAction(Remote.learnCommand(`remote.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Learn commands from a physical remote")),
  Command.make(
    "delete-command",
    { name: remoteName, command: commandsArgument, device: deviceFlag },
    (input) =>
      callAction(
        Remote.deleteCommand(`remote.${input.name}`, input.command, {
          device: Option.getOrUndefined(input.device),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Delete learned commands")),
]);

const entityName = (domain: string) =>
  nameArgument(`Entity name without the ${domain}. prefix`);

const cycleFlag = optionalFlag(
  Flag.Boolean("cycle"),
  "Wrap round at the end (the default); --no-cycle stops there",
);

const selectCommands = <const Domain extends string>(
  domain: Domain,
  actions: {
    readonly selectOption: (
      entityId: EntityId<Domain>,
      option: string,
    ) => Action;
    readonly selectFirst: (entityId: EntityId<Domain>) => Action;
    readonly selectLast: (entityId: EntityId<Domain>) => Action;
    readonly selectNext: (
      entityId: EntityId<Domain>,
      options: SelectStepOptions,
    ) => Action;
    readonly selectPrevious: (
      entityId: EntityId<Domain>,
      options: SelectStepOptions,
    ) => Action;
  },
) => {
  const stepCommand = (
    name: string,
    toAction: (
      entityId: EntityId<Domain>,
      options: SelectStepOptions,
    ) => Action,
    description: string,
  ) =>
    Command.make(
      name,
      { name: entityName(domain), cycle: cycleFlag },
      (input) =>
        callAction(
          toAction(`${domain}.${input.name}`, {
            cycle: Option.getOrUndefined(input.cycle),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription(description));

  return [
    Command.make(
      "select-option",
      {
        name: entityName(domain),
        option: Argument.String("option").pipe(
          Argument.withDescription("Option to select"),
        ),
      },
      (input) =>
        callAction(
          actions.selectOption(`${domain}.${input.name}`, input.option),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Select an option")),
    entityActionCommand(
      domain,
      "select-first",
      actions.selectFirst,
      "Select the first option",
    ),
    entityActionCommand(
      domain,
      "select-last",
      actions.selectLast,
      "Select the last option",
    ),
    stepCommand("select-next", actions.selectNext, "Select the next option"),
    stepCommand(
      "select-previous",
      actions.selectPrevious,
      "Select the previous option",
    ),
  ];
};

// A `set-value` command whose value is checked by `decode` before sending.
const setValueCommand = <const Domain extends string, A>(
  domain: Domain,
  description: string,
  decode: (value: string) => Effect.Effect<A, CommandError>,
  toAction: (entityId: EntityId<Domain>, value: A) => Action,
) =>
  Command.make(
    "set-value",
    {
      name: entityName(domain),
      value: Argument.String("value").pipe(
        Argument.withDescription(description),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const value = yield* decode(input.value);

        yield* callAction(toAction(`${domain}.${input.name}`, value));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the value"));

const anyText = (value: string) => Effect.succeed(value);

const finiteNumber = (value: string) => {
  const number = parseInputNumberValue(value);

  return number === undefined
    ? failWith("value must be a finite number")
    : Effect.succeed(number);
};

const wholeNumber = (value: string) => {
  const number = parseInputNumberValue(value);

  return number === undefined || !Number.isInteger(number)
    ? failWith("value must be a whole number")
    : Effect.succeed(number);
};

const schemaText =
  (
    label: string,
    decode: (value: string) => Effect.Effect<string, Schema.SchemaError>,
  ) =>
  (value: string) =>
    decodeData(label, decode(value));

const decodeDate = Schema.decodeUnknownEffect(DateString);

const decodeTime = Schema.decodeUnknownEffect(TimeString);

const decodeDateTime = Schema.decodeUnknownEffect(DateTimeString);

const decodeInputDateTimeSet = Schema.decodeUnknownEffect(InputDateTimeSetData);

const select = domainCommand(
  "select",
  undefined,
  "Select actions",
  selectCommands("select", Select),
);

const inputSelect = domainCommand(
  "input_select",
  undefined,
  "Input select actions",
  [
    ...selectCommands("input_select", InputSelect),
    Command.make(
      "set-options",
      {
        name: entityName("input_select"),
        options: Argument.String("option").pipe(
          Argument.withDescription("Option; repeat for each option"),
          Argument.atLeast(1),
        ),
      },
      (input) =>
        Effect.gen(function* () {
          const [first, ...rest] = input.options;

          if (first === undefined) {
            return yield* failWith("set at least one option");
          }

          yield* callAction(
            InputSelect.setOptions(`input_select.${input.name}`, [
              first,
              ...rest,
            ]),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Replace the options until Home Assistant restarts or reloads",
      ),
    ),
    reloadCommand("input_select", InputSelect.reload),
  ],
);

const number = domainCommand("number", undefined, "Number actions", [
  setValueCommand("number", "New value", finiteNumber, NumberEntity.setValue),
]);

const text = domainCommand("text", undefined, "Text actions", [
  setValueCommand("text", "New text", anyText, Text.setValue),
]);

const inputText = domainCommand("input_text", undefined, "Input text actions", [
  setValueCommand("input_text", "New text", anyText, InputText.setValue),
  reloadCommand("input_text", InputText.reload),
]);

const date = domainCommand("date", undefined, "Date actions", [
  setValueCommand(
    "date",
    "Date as YYYY-MM-DD",
    schemaText("date", decodeDate),
    DateEntity.setValue,
  ),
]);

const time = domainCommand("time", undefined, "Time actions", [
  setValueCommand(
    "time",
    "Time as HH:MM or HH:MM:SS",
    schemaText("time", decodeTime),
    TimeEntity.setValue,
  ),
]);

const dateTime = domainCommand("datetime", undefined, "Date and time actions", [
  setValueCommand(
    "datetime",
    'Date and time, such as "2026-10-01 18:30"',
    schemaText("date and time", decodeDateTime),
    DateTimeEntity.setValue,
  ),
]);

const inputDateTime = domainCommand(
  "input_datetime",
  undefined,
  "Input date and time actions",
  [
    Command.make(
      "set-datetime",
      {
        name: entityName("input_datetime"),
        date: optionalFlag(Flag.String("date"), "Date as YYYY-MM-DD"),
        time: optionalFlag(Flag.String("time"), "Time as HH:MM or HH:MM:SS"),
        datetime: optionalFlag(
          Flag.String("datetime"),
          'Date and time, such as "2026-10-01 18:30"',
        ),
        timestamp: optionalFlag(
          Flag.Finite("timestamp"),
          "Seconds since the Unix epoch",
        ),
      },
      ({ name, ...flags }) =>
        Effect.gen(function* () {
          const data = yield* decodeData(
            "date and time",
            decodeInputDateTimeSet(setFields(flags)),
          );

          yield* callAction(
            InputDateTime.setDateTime(`input_datetime.${name}`, data),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Set the date, time or both, or a date and time or timestamp",
      ),
    ),
    reloadCommand("input_datetime", InputDateTime.reload),
  ],
);

const counter = domainCommand("counter", undefined, "Counter actions", [
  entityActionCommand(
    "counter",
    "increment",
    Counter.increment,
    "Raise the count by one step",
  ),
  entityActionCommand(
    "counter",
    "decrement",
    Counter.decrement,
    "Lower the count by one step",
  ),
  entityActionCommand(
    "counter",
    "reset",
    Counter.reset,
    "Reset to the initial value",
  ),
  setValueCommand("counter", "New count", wholeNumber, Counter.setValue),
]);

const printJson = (value: Schema.Json | null) =>
  Console.log(JSON.stringify(value));

const decodeScriptVariables = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Record(Schema.String, Schema.Json)),
);

const variablesFlag = optionalFlag(
  Flag.String("variables"),
  'Script variables as a JSON object, such as \'{"room":"office"}\'',
);

// Parses an optional flag or argument, leaving it undefined when unset.
const parseOptional = <A, E>(
  value: Option.Option<string>,
  parse: (value: string) => Effect.Effect<A, E>,
): Effect.Effect<A | undefined, E> =>
  Option.isSome(value) ? parse(value.value) : Effect.succeed(undefined);

const parseVariables = (value: Option.Option<string>) =>
  parseOptional(value, (json) =>
    decodeData("variables", decodeScriptVariables(json)),
  );

const scriptName = entityName("script");

const script = domainCommand("script", undefined, "Script actions", [
  Command.make(
    "turn-on",
    { name: scriptName, variables: variablesFlag },
    (input) =>
      Effect.gen(function* () {
        const variables = yield* parseVariables(input.variables);

        yield* callAction(Script.turnOn(`script.${input.name}`, variables));
      }).pipe(withBridge),
  ).pipe(
    Command.withAlias("on"),
    Command.withDescription("Start the script without waiting for it"),
  ),
  entityActionCommand(
    "script",
    "turn-off",
    Script.turnOff,
    "Stop the script",
  ).pipe(Command.withAlias("off")),
  entityActionCommand(
    "script",
    "toggle",
    Script.toggle,
    "Start or stop the script",
  ).pipe(Command.withAlias("t")),
  Command.make("run", { name: scriptName, variables: variablesFlag }, (input) =>
    Effect.gen(function* () {
      const variables = yield* parseVariables(input.variables);

      const response = yield* callAction(
        Script.run(`script.${input.name}`, variables),
      );

      yield* printJson(response);
    }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Run the script, wait for it to finish and print its response as JSON",
    ),
  ),
  reloadCommand("script", Script.reload),
]);

const automationName = entityName("automation");

const automation = domainCommand(
  "automation",
  undefined,
  "Automation actions",
  [
    entityActionCommand(
      "automation",
      "turn-on",
      Automation.turnOn,
      "Turn on",
    ).pipe(Command.withAlias("on")),
    Command.make(
      "turn-off",
      {
        name: automationName,
        stopActions: optionalFlag(
          Flag.Boolean("stop-actions"),
          "Stop running actions (the default); --no-stop-actions lets them finish",
        ),
      },
      (input) =>
        callAction(
          Automation.turnOff(`automation.${input.name}`, {
            stopActions: Option.getOrUndefined(input.stopActions),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withAlias("off"), Command.withDescription("Turn off")),
    entityActionCommand(
      "automation",
      "toggle",
      Automation.toggle,
      "Toggle",
    ).pipe(Command.withAlias("t")),
    Command.make(
      "trigger",
      {
        name: automationName,
        skipCondition: optionalFlag(
          Flag.Boolean("skip-condition"),
          "Skip the conditions (the default); --no-skip-condition checks them",
        ),
      },
      (input) =>
        callAction(
          Automation.trigger(`automation.${input.name}`, {
            skipCondition: Option.getOrUndefined(input.skipCondition),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Run the automation's actions")),
    reloadCommand("automation", Automation.reload),
  ],
);

const transitionFlag = optionalFlag(
  Flag.Finite("transition"),
  "Transition time in seconds",
);

const decodeSceneEntities = Schema.decodeUnknownEffect(
  Schema.fromJsonString(SceneEntities),
);

const decodeSceneCreate = Schema.decodeUnknownEffect(SceneCreateData);

const sceneEntitiesDescription =
  'Entity states as a JSON object, such as \'{"light.desk":{"state":"on","brightness":80}}\'';

const scene = domainCommand("scene", undefined, "Scene actions", [
  Command.make(
    "turn-on",
    { name: entityName("scene"), transition: transitionFlag },
    (input) =>
      callAction(
        Scene.turnOn(`scene.${input.name}`, {
          transition: Option.getOrUndefined(input.transition),
        }),
      ).pipe(withBridge),
  ).pipe(
    Command.withAlias("on"),
    Command.withDescription("Activate the scene"),
  ),
  Command.make(
    "apply",
    {
      entities: Argument.String("entities").pipe(
        Argument.withDescription(sceneEntitiesDescription),
      ),
      transition: transitionFlag,
    },
    (input) =>
      Effect.gen(function* () {
        const entities = yield* decodeData(
          "scene entities",
          decodeSceneEntities(input.entities),
        );

        yield* callAction(
          Scene.apply(entities, {
            transition: Option.getOrUndefined(input.transition),
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set entity states without making a scene")),
  Command.make(
    "create",
    {
      sceneId: Argument.String("scene_id").pipe(
        Argument.withDescription("ID for the new scene, such as before_movie"),
      ),
      entities: optionalFlag(Flag.String("entities"), sceneEntitiesDescription),
      snapshot: Flag.String("snapshot-entity").pipe(
        Flag.withDescription(
          "Entity ID whose current state to capture; repeat for more",
        ),
        Flag.atLeast(0),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const entities = yield* parseOptional(input.entities, (json) =>
          decodeData("scene entities", decodeSceneEntities(json)),
        );

        const data = yield* decodeData(
          "scene",
          decodeSceneCreate({
            scene_id: input.sceneId,
            ...setFields({
              entities: Option.fromUndefinedOr(entities),
              snapshot_entities: Option.some(input.snapshot).pipe(
                Option.filter((ids) => ids.length > 0),
              ),
            }),
          }),
        );

        yield* callAction(Scene.create(data));
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Make a scene that lasts until Home Assistant restarts",
    ),
  ),
  entityActionCommand(
    "scene",
    "delete",
    Scene.delete,
    "Delete a scene made with create",
  ),
  reloadCommand("scene", Scene.reload),
]);

const decodeDuration = Schema.decodeUnknownEffect(DurationValue);

// A duration argument: seconds, or HH:MM:SS.
const parseDuration = (value: string) =>
  decodeData("duration", decodeDuration(parseInputNumberValue(value) ?? value));

const timerName = entityName("timer");

const timer = domainCommand("timer", undefined, "Timer actions", [
  Command.make(
    "start",
    {
      name: timerName,
      duration: Argument.String("duration").pipe(
        Argument.withDescription(
          "Seconds or HH:MM:SS (default: the timer's own duration)",
        ),
        Argument.optional,
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const duration = yield* parseOptional(input.duration, parseDuration);

        yield* callAction(Timer.start(`timer.${input.name}`, duration));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Start or restart the timer")),
  entityActionCommand("timer", "pause", Timer.pause, "Pause the timer"),
  entityActionCommand("timer", "cancel", Timer.cancel, "Cancel the timer"),
  entityActionCommand("timer", "finish", Timer.finish, "Finish the timer now"),
  Command.make(
    "change",
    {
      name: timerName,
      duration: Argument.String("duration").pipe(
        Argument.withDescription(
          "Seconds or HH:MM:SS to add; negative to take away, after --",
        ),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const duration = yield* parseDuration(input.duration);

        yield* callAction(Timer.change(`timer.${input.name}`, duration));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Add time to a running timer")),
  reloadCommand("timer", Timer.reload),
]);

const schedule = domainCommand("schedule", undefined, "Schedule actions", [
  Command.make("get", { name: entityName("schedule") }, (input) =>
    Effect.gen(function* () {
      const entityId: EntityId<"schedule"> = `schedule.${input.name}`;
      const response = yield* callAction(Schedule.getSchedule(entityId));

      const week = yield* Schedule.scheduleFrom(entityId, response).pipe(
        Effect.mapError(
          (error) => new CommandError({ message: error.message }),
        ),
      );

      yield* printJson(week);
    }).pipe(withBridge),
  ).pipe(Command.withDescription("Print the schedule's week as JSON")),
  reloadCommand("schedule", Schedule.reload),
]);

const entityIdsFlag = (name: string, description: string) =>
  Flag.String(name).pipe(Flag.withDescription(description), Flag.atLeast(0));

const nonEmpty = (ids: ReadonlyArray<string>) =>
  Option.some(ids).pipe(Option.filter((list) => list.length > 0));

const decodeGroupSet = Schema.decodeUnknownEffect(GroupSetData);

const objectIdArgument = Argument.String("object_id").pipe(
  Argument.withDescription("Group ID, without group."),
);

const group = domainCommand("group", undefined, "Group actions", [
  Command.make(
    "set",
    {
      objectId: objectIdArgument,
      name: optionalFlag(Flag.String("name"), "Group name"),
      icon: optionalFlag(Flag.String("icon"), "Icon, such as mdi:lamp"),
      all: optionalFlag(Flag.Boolean("all"), "On only when every member is on"),
      entities: entityIdsFlag(
        "entity",
        "Member entity ID, replacing the members; repeat for more",
      ),
      addEntities: entityIdsFlag("add-entity", "Entity ID to add"),
      removeEntities: entityIdsFlag("remove-entity", "Entity ID to remove"),
    },
    (input) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "group",
          decodeGroupSet({
            object_id: input.objectId,
            ...setFields({
              name: input.name,
              icon: input.icon,
              all: input.all,
              entities: nonEmpty(input.entities),
              add_entities: nonEmpty(input.addEntities),
              remove_entities: nonEmpty(input.removeEntities),
            }),
          }),
        );

        yield* callAction(Group.set(data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Create or change a group")),
  Command.make("remove", { objectId: objectIdArgument }, (input) =>
    callAction(Group.remove(input.objectId)).pipe(withBridge),
  ).pipe(Command.withDescription("Remove a group made with set")),
  reloadCommand("group", Group.reload),
]);

const zone = domainCommand("zone", undefined, "Zone actions", [
  reloadCommand("zone", Zone.reload),
]);

const person = domainCommand("person", undefined, "Person actions", [
  reloadCommand("person", Person.reload),
]);

const entityIdsArgument = Argument.String("entity_id").pipe(
  Argument.withDescription(
    "Full entity ID, such as light.desk; repeat for more",
  ),
  Argument.atLeast(1),
);

const anyEntityCommand = (
  name: string,
  alias: string,
  toAction: (target: Target) => Action,
  description: string,
) =>
  Command.make(name, { entityIds: entityIdsArgument }, (input) =>
    callAction(toAction({ entity_id: input.entityIds })).pipe(withBridge),
  ).pipe(Command.withAlias(alias), Command.withDescription(description));

const systemCommand = (
  name: string,
  toAction: () => Action,
  description: string,
) =>
  Command.make(name, {}, () => callAction(toAction()).pipe(withBridge)).pipe(
    Command.withDescription(description),
  );

const homeAssistant = domainCommand(
  "homeassistant",
  undefined,
  "Home Assistant actions",
  [
    anyEntityCommand(
      "turn-on",
      "on",
      HomeAssistantCore.turnOn,
      "Turn on entities of any domain",
    ),
    anyEntityCommand(
      "turn-off",
      "off",
      HomeAssistantCore.turnOff,
      "Turn off entities of any domain",
    ),
    anyEntityCommand(
      "toggle",
      "t",
      HomeAssistantCore.toggle,
      "Toggle entities of any domain",
    ),
    Command.make("update-entity", { entityIds: entityIdsArgument }, (input) =>
      callAction(HomeAssistantCore.updateEntity(input.entityIds)).pipe(
        withBridge,
      ),
    ).pipe(Command.withDescription("Refresh entities now")),
    Command.make(
      "restart",
      {
        safeMode: optionalFlag(
          Flag.Boolean("safe-mode"),
          "Restart in safe mode, without custom integrations",
        ),
      },
      (input) =>
        callAction(
          HomeAssistantCore.restart({
            safeMode: Option.getOrUndefined(input.safeMode),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Restart Home Assistant")),
    systemCommand("stop", HomeAssistantCore.stop, "Stop Home Assistant"),
    systemCommand(
      "check-config",
      HomeAssistantCore.checkConfig,
      "Check the configuration files",
    ),
    systemCommand(
      "reload-core-config",
      HomeAssistantCore.reloadCoreConfig,
      "Reload the core configuration, such as location and customisations",
    ),
    systemCommand(
      "reload-custom-templates",
      HomeAssistantCore.reloadCustomTemplates,
      "Reload custom Jinja templates",
    ),
    systemCommand(
      "reload-all",
      HomeAssistantCore.reloadAll,
      "Reload all YAML configuration",
    ),
    Command.make(
      "reload-config-entry",
      {
        entryId: Argument.String("entry_id").pipe(
          Argument.withDescription("Config entry ID"),
        ),
      },
      (input) =>
        callAction(HomeAssistantCore.reloadConfigEntry(input.entryId)).pipe(
          withBridge,
        ),
    ).pipe(Command.withDescription("Reload an integration's config entry")),
    systemCommand(
      "save-persistent-states",
      HomeAssistantCore.savePersistentStates,
      "Save states that are restored after a restart",
    ),
    Command.make(
      "set-location",
      {
        latitude: Argument.Finite("latitude").pipe(
          Argument.withDescription("Latitude from -90 to 90"),
        ),
        longitude: Argument.Finite("longitude").pipe(
          Argument.withDescription("Longitude from -180 to 180"),
        ),
        elevation: optionalFlag(Flag.Int("elevation"), "Elevation in metres"),
      },
      (input) =>
        Effect.gen(function* () {
          if (
            Math.abs(input.latitude) > 90 ||
            Math.abs(input.longitude) > 180
          ) {
            return yield* failWith(
              "latitude must be from -90 to 90 and longitude from -180 to 180",
            );
          }

          yield* callAction(
            HomeAssistantCore.setLocation(input.latitude, input.longitude, {
              elevation: Option.getOrUndefined(input.elevation),
            }),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Set the home location")),
  ],
);

// A command taking an entity name and one value argument.
const valueCommand = <const Domain extends string, A>(
  domain: Domain,
  name: string,
  argument: { readonly name: string; readonly description: string },
  parse: (value: string) => Effect.Effect<A, CommandError>,
  toAction: (entityId: EntityId<Domain>, value: A) => Action,
  description: string,
) =>
  Command.make(
    name,
    {
      name: entityName(domain),
      value: Argument.String(argument.name).pipe(
        Argument.withDescription(argument.description),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const value = yield* parse(input.value);

        yield* callAction(toAction(`${domain}.${input.name}`, value));
      }).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const onOffArgument = (value: string) =>
  value === "on" || value === "off"
    ? Effect.succeed(value === "on")
    : failWith("value must be on or off");

const decodeFanTurnOn = Schema.decodeUnknownEffect(FanTurnOnData);

const fanStepFlag = optionalFlag(
  Flag.Int("step"),
  "Percent to change by (default: the fan's own step)",
);

const fan = domainCommand("fan", undefined, "Fan actions", [
  Command.make(
    "turn-on",
    {
      name: entityName("fan"),
      percentage: optionalFlag(Flag.Int("percentage"), "Speed from 0 to 100"),
      preset_mode: optionalFlag(
        Flag.String("preset-mode"),
        "Preset mode, one of the fan's preset_modes",
      ),
    },
    ({ name, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "fan options",
          decodeFanTurnOn(setFields(flags)),
        );

        yield* callAction(Fan.turnOn(`fan.${name}`, data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("on"), Command.withDescription("Turn on")),
  entityActionCommand("fan", "turn-off", Fan.turnOff, "Turn off").pipe(
    Command.withAlias("off"),
  ),
  entityActionCommand("fan", "toggle", Fan.toggle, "Toggle").pipe(
    Command.withAlias("t"),
  ),
  valueCommand(
    "fan",
    "percentage",
    { name: "percentage", description: "Speed from 0 to 100" },
    parsePercent,
    Fan.setPercentage,
    "Set the speed",
  ),
  ...(
    [
      ["increase-speed", Fan.increaseSpeed, "Speed up by a step"],
      ["decrease-speed", Fan.decreaseSpeed, "Slow down by a step"],
    ] as const
  ).map(([command, toAction, description]) =>
    Command.make(
      command,
      { name: entityName("fan"), step: fanStepFlag },
      (input) =>
        callAction(
          toAction(`fan.${input.name}`, Option.getOrUndefined(input.step)),
        ).pipe(withBridge),
    ).pipe(Command.withDescription(description)),
  ),
  valueCommand(
    "fan",
    "preset-mode",
    { name: "mode", description: "One of the fan's preset_modes" },
    Effect.succeed,
    Fan.setPresetMode,
    "Set the preset mode",
  ),
  valueCommand(
    "fan",
    "oscillate",
    { name: "state", description: "on or off" },
    onOffArgument,
    Fan.oscillate,
    "Turn oscillation on or off",
  ),
  valueCommand(
    "fan",
    "direction",
    { name: "direction", description: "forward or reverse" },
    (value) =>
      value === "forward" || value === "reverse"
        ? Effect.succeed(value)
        : failWith("direction must be forward or reverse"),
    Fan.setDirection,
    "Set the direction",
  ),
]);

const humidifier = domainCommand(
  "humidifier",
  undefined,
  "Humidifier actions",
  [
    ...toggleCommands("humidifier", Humidifier),
    valueCommand(
      "humidifier",
      "mode",
      { name: "mode", description: "One of the humidifier's available_modes" },
      Effect.succeed,
      Humidifier.setMode,
      "Set the mode",
    ),
    valueCommand(
      "humidifier",
      "humidity",
      { name: "humidity", description: "Target humidity from 0 to 100" },
      parsePercent,
      Humidifier.setHumidity,
      "Set the target humidity",
    ),
  ],
);

const waterHeater = domainCommand(
  "water_heater",
  undefined,
  "Water heater actions",
  [
    entityActionCommand(
      "water_heater",
      "turn-on",
      WaterHeater.turnOn,
      "Turn on",
    ).pipe(Command.withAlias("on")),
    entityActionCommand(
      "water_heater",
      "turn-off",
      WaterHeater.turnOff,
      "Turn off",
    ).pipe(Command.withAlias("off")),
    Command.make(
      "temperature",
      {
        name: entityName("water_heater"),
        temperature: Argument.String("temperature").pipe(
          Argument.withDescription("Target temperature in the entity's unit"),
        ),
        operationMode: optionalFlag(
          Flag.String("operation-mode"),
          "Also switch to this operation mode",
        ),
      },
      (input) =>
        Effect.gen(function* () {
          const temperature = yield* finiteNumber(input.temperature);

          yield* callAction(
            WaterHeater.setTemperature(
              `water_heater.${input.name}`,
              temperature,
              { operationMode: Option.getOrUndefined(input.operationMode) },
            ),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Set the target temperature")),
    valueCommand(
      "water_heater",
      "operation-mode",
      { name: "mode", description: "One of the entity's operation_list" },
      Effect.succeed,
      WaterHeater.setOperationMode,
      "Set the operation mode",
    ),
    valueCommand(
      "water_heater",
      "away-mode",
      { name: "state", description: "on or off" },
      onOffArgument,
      WaterHeater.setAwayMode,
      "Turn away mode on or off",
    ),
  ],
);

const simpleCommands = <const Domain extends string>(
  domain: Domain,
  commands: ReadonlyArray<
    readonly [string, (entityId: EntityId<Domain>) => Action, string]
  >,
) =>
  commands.map(([name, toAction, description]) =>
    entityActionCommand(domain, name, toAction, description),
  );

const printResponse = (action: Action) =>
  callAction(action).pipe(Effect.flatMap(printJson));

const mediaPlayerName = entityName("media_player");

const decodePlayMedia = Schema.decodeUnknownEffect(MediaPlayerPlayMediaData);

const mediaLocationFlags = {
  mediaContentType: optionalFlag(
    Flag.String("content-type"),
    "Media content type, from a browse response",
  ),
  mediaContentId: optionalFlag(
    Flag.String("content-id"),
    "Media content ID, from a browse response",
  ),
};

const mediaPlayer = domainCommand(
  "media_player",
  "mp",
  "Media player actions",
  [
    ...toggleCommands("media_player", MediaPlayer),
    ...simpleCommands("media_player", [
      ["play", MediaPlayer.play, "Play"],
      ["pause", MediaPlayer.pause, "Pause"],
      ["play-pause", MediaPlayer.playPause, "Play or pause"],
      ["stop", MediaPlayer.stop, "Stop"],
      ["next", MediaPlayer.nextTrack, "Next track"],
      ["previous", MediaPlayer.previousTrack, "Previous track"],
      ["volume-up", MediaPlayer.volumeUp, "Turn the volume up"],
      ["volume-down", MediaPlayer.volumeDown, "Turn the volume down"],
      ["clear-playlist", MediaPlayer.clearPlaylist, "Clear the playlist"],
      ["unjoin", MediaPlayer.unjoin, "Leave the player's group"],
    ]),
    valueCommand(
      "media_player",
      "volume",
      { name: "volume", description: "Volume from 0 to 1" },
      (value) => {
        const volume = parseInputNumberValue(value);

        return volume !== undefined && volume >= 0 && volume <= 1
          ? Effect.succeed(volume)
          : failWith("volume must be a number from 0 to 1");
      },
      MediaPlayer.setVolume,
      "Set the volume",
    ),
    valueCommand(
      "media_player",
      "mute",
      { name: "state", description: "on or off" },
      onOffArgument,
      MediaPlayer.mute,
      "Mute or unmute",
    ),
    valueCommand(
      "media_player",
      "seek",
      { name: "position", description: "Position in seconds" },
      (value) => {
        const position = parseInputNumberValue(value);

        return position !== undefined && position >= 0
          ? Effect.succeed(position)
          : failWith("position must be a number of seconds from 0");
      },
      MediaPlayer.seek,
      "Seek to a position",
    ),
    valueCommand(
      "media_player",
      "source",
      { name: "source", description: "One of the player's source_list" },
      Effect.succeed,
      MediaPlayer.selectSource,
      "Select the input source",
    ),
    valueCommand(
      "media_player",
      "sound-mode",
      { name: "mode", description: "One of the player's sound_mode_list" },
      Effect.succeed,
      MediaPlayer.selectSoundMode,
      "Select the sound mode",
    ),
    valueCommand(
      "media_player",
      "shuffle",
      { name: "state", description: "on or off" },
      onOffArgument,
      MediaPlayer.setShuffle,
      "Turn shuffle on or off",
    ),
    valueCommand(
      "media_player",
      "repeat",
      { name: "mode", description: "off, all or one" },
      (value) =>
        value === "off" || value === "all" || value === "one"
          ? Effect.succeed(value)
          : failWith("repeat must be off, all or one"),
      MediaPlayer.setRepeat,
      "Set the repeat mode",
    ),
    Command.make(
      "play-media",
      {
        name: mediaPlayerName,
        media_content_id: Argument.String("content_id").pipe(
          Argument.withDescription("Media to play, such as a URL"),
        ),
        media_content_type: Flag.String("content-type").pipe(
          Flag.withDescription("Media type, such as music or url"),
          Flag.withDefault("music"),
        ),
        enqueue: optionalFlag(
          Flag.Literals("enqueue", ["play", "next", "add", "replace"]),
          "Queue behaviour (default: play)",
        ),
        announce: optionalFlag(
          Flag.Boolean("announce"),
          "Pause what's playing to announce the media",
        ),
      },
      ({ name, media_content_id, media_content_type, ...flags }) =>
        Effect.gen(function* () {
          const data = yield* decodeData(
            "media",
            decodePlayMedia({
              media_content_id,
              media_content_type,
              ...setFields(flags),
            }),
          );

          yield* callAction(
            MediaPlayer.playMedia(`media_player.${name}`, data),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Play media")),
    Command.make(
      "join",
      {
        name: mediaPlayerName,
        members: Argument.String("member").pipe(
          Argument.withDescription(
            "Player to group with this one, without media_player.; repeat for more",
          ),
          Argument.atLeast(1),
        ),
      },
      (input) =>
        callAction(
          MediaPlayer.join(
            `media_player.${input.name}`,
            input.members.map(
              (member): EntityId<"media_player"> => `media_player.${member}`,
            ),
          ),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Group players with this one")),
    Command.make(
      "browse",
      { name: mediaPlayerName, ...mediaLocationFlags },
      ({ name, ...location }) =>
        printResponse(
          MediaPlayer.browseMedia(`media_player.${name}`, {
            mediaContentType: Option.getOrUndefined(location.mediaContentType),
            mediaContentId: Option.getOrUndefined(location.mediaContentId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Print the player's media library as JSON")),
    Command.make(
      "search",
      {
        name: mediaPlayerName,
        query: Argument.String("query").pipe(
          Argument.withDescription("Text to search for"),
        ),
        ...mediaLocationFlags,
      },
      ({ name, query, ...location }) =>
        printResponse(
          MediaPlayer.search(`media_player.${name}`, query, {
            mediaContentType: Option.getOrUndefined(location.mediaContentType),
            mediaContentId: Option.getOrUndefined(location.mediaContentId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Search the player's media, printing JSON")),
  ],
);

const decodeJsonValue = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Json),
);

const vacuum = domainCommand("vacuum", undefined, "Vacuum actions", [
  ...simpleCommands("vacuum", [
    ["start", Vacuum.start, "Start cleaning"],
    ["pause", Vacuum.pause, "Pause cleaning"],
    ["start-pause", Vacuum.startPause, "Start or pause cleaning"],
    ["stop", Vacuum.stop, "Stop cleaning"],
    ["return-to-base", Vacuum.returnToBase, "Go back to the dock"],
    ["locate", Vacuum.locate, "Make the vacuum sound so you can find it"],
    ["clean-spot", Vacuum.cleanSpot, "Clean the spot it's on"],
  ]),
  Command.make(
    "clean-area",
    {
      name: entityName("vacuum"),
      areas: Argument.String("area_id").pipe(
        Argument.withDescription("Area ID to clean; repeat for more"),
        Argument.atLeast(1),
      ),
    },
    (input) =>
      callAction(Vacuum.cleanArea(`vacuum.${input.name}`, input.areas)).pipe(
        withBridge,
      ),
  ).pipe(Command.withDescription("Clean areas")),
  valueCommand(
    "vacuum",
    "fan-speed",
    { name: "speed", description: "One of the vacuum's fan_speed_list" },
    Effect.succeed,
    Vacuum.setFanSpeed,
    "Set the fan speed",
  ),
  Command.make(
    "send-command",
    {
      name: entityName("vacuum"),
      command: Argument.String("command").pipe(
        Argument.withDescription("Command the integration understands"),
      ),
      params: optionalFlag(
        Flag.String("params"),
        'Parameters as JSON, such as {"speed":2}',
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const params = yield* parseOptional(input.params, (json) =>
          decodeData("params", decodeJsonValue(json)),
        );

        yield* callAction(
          Vacuum.sendCommand(`vacuum.${input.name}`, input.command, params),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Send a raw command")),
]);

const lawnMower = domainCommand("lawn_mower", undefined, "Lawn mower actions", [
  ...simpleCommands("lawn_mower", [
    ["start", LawnMower.startMowing, "Start mowing"],
    ["pause", LawnMower.pause, "Pause mowing"],
    ["stop", LawnMower.stop, "Stop mowing"],
    ["dock", LawnMower.dock, "Go back to the dock"],
  ]),
]);

const codeCommands = <const Domain extends string>(
  domain: Domain,
  commands: ReadonlyArray<
    readonly [
      string,
      (entityId: EntityId<Domain>, options: LockOptions) => Action,
      string,
    ]
  >,
) =>
  commands.map(([name, toAction, description]) =>
    Command.make(name, { name: entityName(domain), code: codeFlag }, (input) =>
      callAction(
        toAction(`${domain}.${input.name}`, {
          code: Option.getOrUndefined(input.code),
        }),
      ).pipe(withBridge),
    ).pipe(Command.withDescription(description)),
  );

const alarm = domainCommand(
  "alarm_control_panel",
  "alarm",
  "Alarm control panel actions",
  codeCommands("alarm_control_panel", [
    ["disarm", AlarmControlPanel.disarm, "Disarm"],
    ["arm-home", AlarmControlPanel.armHome, "Arm for when you're home"],
    ["arm-away", AlarmControlPanel.armAway, "Arm for when you're away"],
    ["arm-night", AlarmControlPanel.armNight, "Arm for the night"],
    ["arm-vacation", AlarmControlPanel.armVacation, "Arm for a holiday"],
    [
      "arm-custom-bypass",
      AlarmControlPanel.armCustomBypass,
      "Arm with the panel's bypassed zones",
    ],
    ["trigger", AlarmControlPanel.trigger, "Set off the alarm"],
  ]),
);

const update = domainCommand("update", undefined, "Update actions", [
  Command.make(
    "install",
    {
      name: entityName("update"),
      version: optionalFlag(
        Flag.String("version"),
        "Version to install (default: the latest)",
      ),
      backup: optionalFlag(
        Flag.Boolean("backup"),
        "Back up first, where the integration supports it",
      ),
    },
    (input) =>
      callAction(
        Update.install(`update.${input.name}`, {
          version: Option.getOrUndefined(input.version),
          backup: Option.getOrUndefined(input.backup),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Install the update")),
  ...simpleCommands("update", [
    ["skip", Update.skip, "Skip this version"],
    ["clear-skipped", Update.clearSkipped, "Stop skipping the version"],
  ]),
]);

const decodeJsonObject = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Record(Schema.String, Schema.Json)),
);

const parseJsonObject = (label: string) => (json: string) =>
  decodeData(label, decodeJsonObject(json));

const titleFlag = optionalFlag(Flag.String("title"), "Title");

const messageArgument = Argument.String("message").pipe(
  Argument.withDescription("Message text"),
);

const notify = domainCommand("notify", undefined, "Notification actions", [
  Command.make(
    "send-message",
    { name: entityName("notify"), message: messageArgument, title: titleFlag },
    (input) =>
      callAction(
        Notify.sendMessage(`notify.${input.name}`, {
          message: input.message,
          title: Option.getOrUndefined(input.title),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Send a message to a notify entity")),
  Command.make(
    "legacy",
    {
      service: Argument.String("action").pipe(
        Argument.withDescription(
          "Notify action without notify., such as mobile_app_pixel",
        ),
      ),
      message: messageArgument,
      title: titleFlag,
      data: optionalFlag(
        Flag.String("data"),
        "Extra data for the integration, as a JSON object",
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const data = yield* parseOptional(input.data, parseJsonObject("data"));

        yield* callAction(
          Notify.legacy(input.service, {
            message: input.message,
            title: Option.getOrUndefined(input.title),
            data,
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Send through a legacy notify action")),
]);

const persistentNotification = domainCommand(
  "persistent_notification",
  "pn",
  "Persistent notification actions",
  [
    Command.make(
      "create",
      {
        message: messageArgument,
        title: titleFlag,
        notificationId: optionalFlag(
          Flag.String("id"),
          "Notification ID; reusing one replaces that notification",
        ),
      },
      (input) =>
        callAction(
          PersistentNotification.create({
            message: input.message,
            title: Option.getOrUndefined(input.title),
            notificationId: Option.getOrUndefined(input.notificationId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Show a notification in Home Assistant")),
    Command.make(
      "dismiss",
      {
        notificationId: Argument.String("id").pipe(
          Argument.withDescription("Notification ID"),
        ),
      },
      (input) =>
        callAction(PersistentNotification.dismiss(input.notificationId)).pipe(
          withBridge,
        ),
    ).pipe(Command.withDescription("Dismiss a notification")),
    systemCommand(
      "dismiss-all",
      PersistentNotification.dismissAll,
      "Dismiss every notification",
    ),
  ],
);

const tts = domainCommand("tts", undefined, "Text-to-speech actions", [
  Command.make(
    "speak",
    {
      name: entityName("tts"),
      mediaPlayer: Argument.String("media_player").pipe(
        Argument.withDescription("Media player name without media_player."),
      ),
      message: messageArgument,
      language: optionalFlag(
        Flag.String("language"),
        "Language, such as en-GB",
      ),
      cache: optionalFlag(
        Flag.Boolean("cache"),
        "Cache the audio (the default); --no-cache skips it",
      ),
      options: optionalFlag(
        Flag.String("options"),
        "Engine options, such as a voice, as a JSON object",
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const options = yield* parseOptional(
          input.options,
          parseJsonObject("options"),
        );

        yield* callAction(
          Tts.speak(
            `tts.${input.name}`,
            `media_player.${input.mediaPlayer}`,
            input.message,
            {
              language: Option.getOrUndefined(input.language),
              cache: Option.getOrUndefined(input.cache),
              options,
            },
          ),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Speak a message on a media player")),
  systemCommand("clear-cache", Tts.clearCache, "Clear the speech cache"),
]);

const todoName = entityName("todo");

const todoStatusFlag = Flag.Literals("status", ["needs_action", "completed"]);

const decodeTodoItemFields = Schema.decodeUnknownEffect(TodoItemFields);

const todoFieldFlags = {
  due_date: optionalFlag(Flag.String("due-date"), "Due date as YYYY-MM-DD"),
  due_datetime: optionalFlag(
    Flag.String("due-datetime"),
    'Due date and time, such as "2026-10-01 18:30"',
  ),
  description: optionalFlag(Flag.String("description"), "Description"),
};

const itemArgument = Argument.String("item").pipe(
  Argument.withDescription("Item name or UID"),
);

const todo = domainCommand("todo", undefined, "To-do list actions", [
  Command.make(
    "get",
    {
      name: todoName,
      status: todoStatusFlag.pipe(
        Flag.withDescription("Only items with this status; repeat for both"),
        Flag.atLeast(0),
      ),
    },
    (input) =>
      printResponse(
        Todo.getItems(
          `todo.${input.name}`,
          input.status.length > 0 ? input.status : undefined,
        ),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Print the list's items as JSON")),
  Command.make(
    "add",
    {
      name: todoName,
      item: Argument.String("item").pipe(Argument.withDescription("Item name")),
      ...todoFieldFlags,
    },
    ({ name, item, ...flags }) =>
      Effect.gen(function* () {
        const fields = yield* decodeData(
          "item",
          decodeTodoItemFields(setFields(flags)),
        );

        yield* callAction(Todo.addItem(`todo.${name}`, item, fields));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Add an item")),
  Command.make(
    "update",
    {
      name: todoName,
      item: itemArgument,
      rename: optionalFlag(Flag.String("rename"), "New name"),
      status: optionalFlag(todoStatusFlag, "New status"),
      ...todoFieldFlags,
    },
    ({ name, item, rename, status, ...flags }) =>
      Effect.gen(function* () {
        const fields = yield* decodeData(
          "item",
          decodeTodoItemFields(setFields(flags)),
        );

        yield* callAction(
          Todo.updateItem(`todo.${name}`, item, {
            ...fields,
            rename: Option.getOrUndefined(rename),
            status: Option.getOrUndefined(status),
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Change an item")),
  Command.make(
    "remove",
    {
      name: todoName,
      items: itemArgument.pipe(Argument.atLeast(1)),
    },
    (input) =>
      callAction(Todo.removeItem(`todo.${input.name}`, input.items)).pipe(
        withBridge,
      ),
  ).pipe(Command.withDescription("Remove items")),
  entityActionCommand(
    "todo",
    "remove-completed",
    Todo.removeCompletedItems,
    "Remove completed items",
  ),
]);

const calendarName = entityName("calendar");

const isDateOnly = (value: string) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(value);

const calendarWhen = (input: {
  readonly start: Option.Option<string>;
  readonly end: Option.Option<string>;
  readonly inDays: Option.Option<number>;
  readonly inWeeks: Option.Option<number>;
}): Effect.Effect<CalendarEventWhen, CommandError> => {
  const set = [
    Option.isSome(input.start) || Option.isSome(input.end),
    Option.isSome(input.inDays),
    Option.isSome(input.inWeeks),
  ].filter(Boolean).length;

  if (set !== 1) {
    return failWith("set --start and --end, --in-days or --in-weeks");
  }

  if (Option.isSome(input.inDays)) {
    return Effect.succeed({ in: { days: input.inDays.value } });
  }

  if (Option.isSome(input.inWeeks)) {
    return Effect.succeed({ in: { weeks: input.inWeeks.value } });
  }

  if (Option.isNone(input.start) || Option.isNone(input.end)) {
    return failWith("set both --start and --end");
  }

  const start = input.start.value;

  const end = input.end.value;

  if (isDateOnly(start) !== isDateOnly(end)) {
    return failWith("--start and --end must both be dates or both date-times");
  }

  return Effect.succeed(
    isDateOnly(start)
      ? { startDate: start, endDate: end }
      : { startDateTime: start, endDateTime: end },
  );
};

const calendar = domainCommand("calendar", undefined, "Calendar actions", [
  Command.make(
    "events",
    {
      name: calendarName,
      days: Flag.Int("days").pipe(
        Flag.withDescription("Days ahead to read, from now"),
        Flag.withDefault(7),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        if (input.days < 1) {
          return yield* failWith("days must be at least 1");
        }

        const entityId: EntityId<"calendar"> = `calendar.${input.name}`;

        const start = new Date();

        const response = yield* callAction(
          Calendar.getEvents(entityId, {
            start,
            end: new Date(start.getTime() + input.days * 86_400_000),
          }),
        );

        const events = yield* Calendar.eventsFrom(entityId, response).pipe(
          Effect.mapError(
            (error) => new CommandError({ message: error.message }),
          ),
        );

        yield* printJson(events);
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Print upcoming events as JSON")),
  Command.make(
    "create-event",
    {
      name: calendarName,
      summary: Argument.String("summary").pipe(
        Argument.withDescription("Event title"),
      ),
      start: optionalFlag(
        Flag.String("start"),
        "Start date (all day) or date and time",
      ),
      end: optionalFlag(
        Flag.String("end"),
        "End date (exclusive, all day) or date and time",
      ),
      inDays: optionalFlag(
        Flag.Int("in-days"),
        "All day, this many days from today",
      ),
      inWeeks: optionalFlag(
        Flag.Int("in-weeks"),
        "All day, this many weeks from today",
      ),
      description: optionalFlag(Flag.String("description"), "Description"),
      location: optionalFlag(Flag.String("location"), "Location"),
    },
    (input) =>
      Effect.gen(function* () {
        const when = yield* calendarWhen(input);

        yield* callAction(
          CalendarActions.createEvent(
            `calendar.${input.name}`,
            input.summary,
            when,
            {
              description: Option.getOrUndefined(input.description),
              location: Option.getOrUndefined(input.location),
            },
          ),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Add an event")),
]);

const weather = domainCommand("weather", undefined, "Weather actions", [
  Command.make(
    "forecast",
    {
      name: entityName("weather"),
      type: Flag.Literals("type", ["daily", "hourly", "twice_daily"]).pipe(
        Flag.withDescription("Forecast type"),
        Flag.withDefault("daily"),
      ),
    },
    (input) =>
      printResponse(
        Weather.getForecasts(`weather.${input.name}`, input.type),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Print the forecast as JSON")),
]);

const languageFlag = optionalFlag(
  Flag.String("language"),
  "Language, such as en",
);

const agentFlag = optionalFlag(
  Flag.String("agent-id"),
  "Conversation agent (default: Home Assistant)",
);

const conversation = domainCommand(
  "conversation",
  undefined,
  "Conversation actions",
  [
    Command.make(
      "process",
      {
        text: Argument.String("text").pipe(
          Argument.withDescription(
            'What to say, such as "turn on the desk light"',
          ),
        ),
        language: languageFlag,
        agentId: agentFlag,
        conversationId: optionalFlag(
          Flag.String("conversation-id"),
          "Continue this conversation",
        ),
      },
      (input) =>
        printResponse(
          Conversation.process(input.text, {
            language: Option.getOrUndefined(input.language),
            agentId: Option.getOrUndefined(input.agentId),
            conversationId: Option.getOrUndefined(input.conversationId),
          }),
        ).pipe(withBridge),
    ).pipe(
      Command.withDescription("Send text to an agent and print the reply"),
    ),
    Command.make(
      "reload",
      { language: languageFlag, agentId: agentFlag },
      (input) =>
        callAction(
          Conversation.reload({
            language: Option.getOrUndefined(input.language),
            agentId: Option.getOrUndefined(input.agentId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Reload the agent's intents")),
  ],
);

const taskArguments = {
  taskName: Argument.String("task_name").pipe(
    Argument.withDescription("Short name for the task"),
  ),
  instructions: Argument.String("instructions").pipe(
    Argument.withDescription("What to generate"),
  ),
};

const aiTask = domainCommand("ai_task", undefined, "AI task actions", [
  Command.make(
    "generate-data",
    {
      ...taskArguments,
      entity: optionalFlag(
        Flag.String("entity"),
        "AI task entity name without ai_task. (default: the preferred one)",
      ),
      structure: optionalFlag(
        Flag.String("structure"),
        "Output structure as a JSON object of selectors",
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const structure = yield* parseOptional(
          input.structure,
          parseJsonObject("structure"),
        );

        yield* printResponse(
          AiTask.generateData(input.taskName, input.instructions, {
            entityId: Option.getOrUndefined(
              Option.map(
                input.entity,
                (entity): EntityId<"ai_task"> => `ai_task.${entity}`,
              ),
            ),
            structure,
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Generate data and print it as JSON")),
  Command.make(
    "generate-image",
    { name: entityName("ai_task"), ...taskArguments },
    (input) =>
      printResponse(
        AiTask.generateImage(
          `ai_task.${input.name}`,
          input.taskName,
          input.instructions,
        ),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Generate an image and print its details")),
]);

const image = domainCommand("image", undefined, "Image actions", [
  valueCommand(
    "image",
    "snapshot",
    {
      name: "filename",
      description: "Path on the Home Assistant host to save to",
    },
    Effect.succeed,
    Image.snapshot,
    "Save the image on the Home Assistant host",
  ),
]);

const imageProcessing = domainCommand(
  "image_processing",
  undefined,
  "Image processing actions",
  [
    entityActionCommand(
      "image_processing",
      "scan",
      ImageProcessing.scan,
      "Process the image now",
    ),
  ],
);

const decodeDeviceTrackerSee = Schema.decodeUnknownEffect(DeviceTrackerSeeData);

const deviceTracker = domainCommand(
  "device_tracker",
  undefined,
  "Device tracker actions",
  [
    Command.make(
      "see",
      {
        mac: optionalFlag(Flag.String("mac"), "Device MAC address"),
        dev_id: optionalFlag(Flag.String("dev-id"), "Device ID"),
        host_name: optionalFlag(Flag.String("host-name"), "Host name"),
        location_name: optionalFlag(
          Flag.String("location-name"),
          "Zone name, home or not_home",
        ),
        latitude: optionalFlag(Flag.Finite("latitude"), "GPS latitude"),
        longitude: optionalFlag(Flag.Finite("longitude"), "GPS longitude"),
        gps_accuracy: optionalFlag(
          Flag.Int("gps-accuracy"),
          "GPS accuracy in metres",
        ),
        battery: optionalFlag(Flag.Int("battery"), "Battery percentage"),
      },
      ({ latitude, longitude, ...flags }) =>
        Effect.gen(function* () {
          if (Option.isSome(latitude) !== Option.isSome(longitude)) {
            return yield* failWith("set both --latitude and --longitude");
          }

          const data = yield* decodeData(
            "device",
            decodeDeviceTrackerSee(
              setFields({
                ...flags,
                gps: Option.all([latitude, longitude]),
              }),
            ),
          );

          yield* callAction(DeviceTracker.see(data));
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Report a legacy tracker's location")),
  ],
);

const serve = Command.make("serve", {}, () =>
  Effect.flatMap(socketPath, serveBridge).pipe(
    Effect.provide(
      Layer.mergeAll(BridgeConfig.layer, BunSocket.layerWebSocketConstructor),
    ),
  ),
).pipe(
  Command.withDescription(
    "Hold the shared Home Assistant connection and serve it on the bridge socket",
  ),
);

const setup = Command.make("setup", {}, () =>
  Effect.gen(function* () {
    const config = yield* BridgeConfig;
    yield* config.setup;
    yield* Console.log(`Saved ${config.path}`);
  }).pipe(Effect.provide(BridgeConfig.layer)),
).pipe(Command.withDescription("Set the Home Assistant URL and access token"));

const textFlag = (name: string, description: string) =>
  Flag.String(name).pipe(
    Flag.withDescription(description),
    Flag.withDefault(""),
  );

const entityOutputFlags = {
  json: Flag.Boolean("json").pipe(
    Flag.withDescription("Print the full entity update as JSON"),
    Flag.withDefault(false),
  ),
  fields: Flag.String("field").pipe(
    Flag.withDescription(
      "Print only this field, such as state or attributes.brightness; repeat for more",
    ),
    Flag.atLeast(0),
  ),
  barJson: Flag.Boolean("bar-json").pipe(
    Flag.withDescription("Print one bar JSON object per state"),
    Flag.withDefault(false),
  ),
  icon: textFlag("icon", "Same as --text"),
  text: textFlag(
    "text",
    "Text template shown instead of the state, such as {attributes.brightness}",
  ),
  textOn: textFlag("text-on", "Text appended when the entity is on"),
  textOff: textFlag("text-off", "Text appended when the entity is off"),
  tooltip: textFlag(
    "tooltip",
    "Tooltip template when no on or off tooltip applies",
  ),
  tooltipOn: textFlag("tooltip-on", "Tooltip when the entity is on"),
  tooltipOff: textFlag("tooltip-off", "Tooltip when the entity is off"),
  className: textFlag(
    "class",
    "Class template when no on or off class applies",
  ),
  classOn: textFlag("class-on", "Class when the entity is on"),
  classOff: textFlag("class-off", "Class when the entity is off"),
  onStates: Flag.String("on-state").pipe(
    Flag.withDescription(
      "State that counts as on; repeat for more (default: on)",
    ),
    Flag.atLeast(0),
  ),
};

type EntityOutputOptions = Command.Command.Config.Infer<
  typeof entityOutputFlags
>;

// Checks the output flags and returns how to print each entity update.
const entityFormatter = ({
  json,
  fields,
  barJson,
  ...options
}: EntityOutputOptions) =>
  Effect.gen(function* () {
    if (barJson && (json || fields.length > 0)) {
      return yield* failWith("--bar-json can't be used with --json or --field");
    }

    if (options.icon !== "" && options.text !== "") {
      return yield* failWith("use --text or --icon, not both");
    }

    return (update: EntityUpdate) => {
      if (barJson) {
        return entityBar(update.state, update.name, options);
      }

      if (fields.length > 0) {
        return entityFields(update.state, update.name, fields, json);
      }

      return json ? JSON.stringify(update) : update.state.state;
    };
  });

const entityIdArgument = (description: string) =>
  Argument.String("entity_id").pipe(Argument.withDescription(description));

const watchEntity = Command.make(
  "entity",
  {
    entityId: entityIdArgument("Entity to watch, for example light.office"),
    ...entityOutputFlags,
  },
  ({ entityId, ...output }) =>
    Effect.gen(function* () {
      const format = yield* entityFormatter(output);

      if (!output.barJson && !output.json && output.fields.length === 0) {
        yield* Effect.logWarning(
          "Watch output is plain text. Use --json, --field or --bar-json for output in scripts and bars.",
        );
      }

      const client = yield* BridgeClient;
      yield* client.WatchEntity({ entityId }).pipe(
        Stream.map(format),
        Stream.changes,
        Stream.runForEach((line) => Console.log(line)),
      );
    }).pipe(withBridge),
).pipe(
  Command.withAlias("e"),
  Command.withDescription("Print an entity's state now and on every change"),
);

const watch = Command.make("watch").pipe(
  Command.withAlias("w"),
  Command.withDescription("Watch entities through the bridge"),
  Command.withSubcommands([watchEntity]),
);

const getEntity = Command.make(
  "entity",
  {
    entityId: entityIdArgument("Entity to read, for example light.office"),
    ...entityOutputFlags,
  },
  ({ entityId, ...output }) =>
    Effect.gen(function* () {
      const format = yield* entityFormatter(output);
      const client = yield* BridgeClient;
      const update = yield* client.GetEntity({ entityId });

      if (update === null) {
        return yield* failWith(`entity ${entityId} not found`);
      }

      yield* Console.log(format(update));
    }).pipe(withBridge),
).pipe(
  Command.withAlias("e"),
  Command.withDescription("Print an entity's current state once"),
);

const get = Command.make("get").pipe(
  Command.withAlias("g"),
  Command.withDescription("Read entities through the bridge"),
  Command.withSubcommands([getEntity]),
);

const reportCliCause = (cause: Cause.Cause<unknown>) => {
  if (Cause.hasInterruptsOnly(cause)) {
    return Effect.failCause(cause);
  }

  const error = Cause.squash(cause);

  const setExitCode = Effect.sync(() => {
    process.exitCode = 1;
  });

  // effect/cli has already printed help and the usage error.
  if (CliError.isCliError(error)) {
    return setExitCode;
  }

  const message = Predicate.hasProperty(error, "message")
    ? String(error.message)
    : String(error);

  return Console.error(`ha-bridge: ${message}`).pipe(
    Effect.andThen(setExitCode),
  );
};

const commands = [
  serve,
  setup,
  get,
  watch,
  assistSatellite,
  domainCommand("input_boolean", "ib", "Input boolean actions", [
    ...toggleCommands("input_boolean", InputBoolean),
    reloadCommand("input_boolean", InputBoolean.reload),
  ]),
  inputNumber,
  light,
  domainCommand(
    "switch",
    "s",
    "Switch actions",
    toggleCommands("switch", Switch),
  ),
  cover,
  climate,
  camera,
  button,
  inputButton,
  lock,
  valve,
  siren,
  remote,
  select,
  inputSelect,
  number,
  text,
  inputText,
  date,
  time,
  dateTime,
  inputDateTime,
  counter,
  script,
  automation,
  scene,
  timer,
  schedule,
  group,
  zone,
  person,
  homeAssistant,
  fan,
  humidifier,
  waterHeater,
  mediaPlayer,
  vacuum,
  lawnMower,
  alarm,
  update,
  notify,
  persistentNotification,
  tts,
  todo,
  calendar,
  weather,
  conversation,
  aiTask,
  image,
  imageProcessing,
  deviceTracker,
] as const;

const searchKinds = ["entity", "device", "area", "command"] as const;

const search = Command.make(
  "search",
  {
    query: Argument.String("query").pipe(
      Argument.withDescription("Words to search for, such as kitchen lamp"),
      Argument.atLeast(1),
    ),
    kinds: Flag.Literals("kind", searchKinds).pipe(
      Flag.withDescription(
        "Only return this kind; repeat for more (default: all)",
      ),
      Flag.atLeast(0),
    ),
    domain: optionalFlag(
      Flag.String("domain"),
      "Only entities in this domain, such as light, and the devices, areas and commands for it",
    ),
    area: optionalFlag(
      Flag.String("area"),
      "Only entities, devices and areas in this area, by ID or name",
    ),
    deviceClass: optionalFlag(
      Flag.String("device-class"),
      "Only entities with this device class, such as temperature, and their devices and areas",
    ),
    limit: Flag.Int("limit").pipe(
      Flag.withDescription("Most results to show"),
      Flag.withDefault(20),
    ),
    page: optionalFlag(
      Flag.Int("page"),
      "Show this page of --limit results, starting at 1",
    ),
    json: Flag.Boolean("json").pipe(
      Flag.withDescription("Print the results as JSON"),
      Flag.withDefault(false),
    ),
  },
  (input) =>
    Effect.gen(function* () {
      const query = input.query.join(" ").trim();

      if (query === "") {
        return yield* failWith("enter something to search for");
      }

      if (input.limit < 1) {
        return yield* failWith("--limit must be at least 1");
      }

      const page = Option.getOrUndefined(input.page);

      if (page !== undefined && page < 1) {
        return yield* failWith("--page must be at least 1");
      }

      const offset = page === undefined ? 0 : (page - 1) * input.limit;
      const kinds = input.kinds.length === 0 ? searchKinds : input.kinds;
      const haKinds = kinds.filter((kind) => kind !== "command");
      const domain = Option.getOrUndefined(input.domain);

      // Commands have no area or device class.
      const includeCommands =
        kinds.includes("command") &&
        Option.isNone(input.area) &&
        Option.isNone(input.deviceClass);

      const searchBridge = (limit: number, offset: number) =>
        Effect.gen(function* () {
          const client = yield* BridgeClient;

          return yield* client
            .Search({
              query,
              kinds: haKinds,
              domain,
              area: Option.getOrUndefined(input.area),
              deviceClass: Option.getOrUndefined(input.deviceClass),
              limit,
              offset,
            })
            .pipe(
              Effect.catchTag("SearchQueryEmpty", () =>
                failWith("enter something to search for"),
              ),
            );
        }).pipe(withBridge);

      const noResults: SearchResults = {
        results: [],
        total: 0,
        unavailable: [],
      };

      const found = yield* Effect.gen(function* () {
        if (!includeCommands) {
          return yield* searchBridge(input.limit, offset);
        }

        const fromBridge =
          haKinds.length === 0
            ? noResults
            : yield* searchBridge(Number.MAX_SAFE_INTEGER, 0);

        const fromCommands = yield* (yield* Search)
          .fuzzy({
            items: commandItems(commands).filter(
              (item) =>
                domain === undefined || item.path.split(" ")[0] === domain,
            ),
            query,
            keys: commandKeys,
            primary: (item) => item.path,
            overrides: { limit: Number.POSITIVE_INFINITY },
          })
          .pipe(
            Effect.catchTag("SearchQueryEmpty", () =>
              failWith("enter something to search for"),
            ),
          );

        const merged = selectResults<SearchMatch | CommandMatch, string>(
          [
            ...fromBridge.results.map((result) => ({
              item: result,
              score: result.score,
              matched: result.matched,
            })),
            ...fromCommands.results.map(({ item, score, matched }) => ({
              item: toCommandMatch(item, score, matched),
              score,
              matched,
            })),
          ],
          (result) => result.name,
          { limit: input.limit, offset },
        );

        return {
          results: merged.results.map(({ item }) => item),
          total: merged.total,
          unavailable: fromBridge.unavailable,
        };
      });

      if (found.unavailable.length > 0) {
        yield* Effect.logWarning(
          `Results may be incomplete; the bridge could not load the ${found.unavailable.join(", ")}`,
        );
      }

      const pages = Math.ceil(found.total / input.limit);

      if (input.json) {
        // JSON.stringify leaves out page and pages without --page.
        yield* Console.log(
          JSON.stringify({
            ...found,
            page,
            pages: page === undefined ? undefined : pages,
          }),
        );

        return;
      }

      yield* Effect.forEach(
        found.results,
        (result) => Console.log(searchLine(result)),
        { discard: true },
      );

      if (found.results.length === 0) {
        yield* Console.error(
          found.total === 0 ? "No matches" : `No matches on page ${page}`,
        );
      } else if (page !== undefined || found.results.length < found.total) {
        yield* Console.error(
          `Showing ${offset + 1}-${offset + found.results.length} of ${found.total}${
            page === undefined
              ? "; use --limit or --page for more"
              : `, page ${page} of ${pages}`
          }`,
        );
      }
    }).pipe(Effect.provide(Search.layer)),
).pipe(
  Command.withDescription(
    "Search Home Assistant entities, devices and areas, and ha-bridge commands",
  ),
);

haBridge.pipe(
  Command.withSubcommands([...commands, search]),
  Command.run({ version: packageJson.version }),
  Effect.catchCause(reportCliCause),
  Effect.provide(
    Layer.mergeAll(BunServices.layer, Layer.succeed(Logger.LogToStderr, true)),
  ),
  BunRuntime.runMain,
);
