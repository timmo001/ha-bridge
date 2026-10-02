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
  Ref,
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
  Alert,
  Backup,
  BackupFolder,
  Cloud,
  Ffmpeg,
  GoogleAssistant,
  Hassio,
  Lovelace,
  HomeAssistantError,
  PythonScript,
  RestCommand,
  ShellCommand,
  HassioBackupFullData,
  HassioBackupPartialData,
  HassioRestorePartialData,
  Frontend,
  FrontendSetThemeData,
  LogLevel,
  Logbook,
  LoggerActions,
  Recorder,
  RecorderGetStatisticsData,
  RecorderPurgeData,
  StatisticType,
  StatisticsPeriod,
  SystemLog,
  SystemLogLevel,
  UtilityMeter,
  WakeOnLan,
  WakeOnLanData,
  YamlReloadDomain,
  reloadYaml,
  Remote,
  RemoteLearnCommandData,
  RemoteSendCommandData,
  Siren,
  SirenTurnOnData,
  Valve,
  LightTurnOffData,
  LightTurnOnData,
  Switch,
  isEntityIdIn,
  type Action,
  type CoverMoveOptions,
  type CalendarEventWhen,
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
  entityField,
  entityFieldValues,
  searchLine,
  stateTextBar,
} from "./cli/output.js";
import { targetConfig, targetFlags, toTarget } from "./cli/target.js";
import { BridgeConfig } from "./config/Config.js";
import {
  invalidInputNumberMessage,
  parseInputNumberValue,
} from "./homeassistant/inputNumber.js";
import { lightData } from "./homeassistant/light.js";
import { exactlyOne, isEmptyTarget } from "./homeassistant/target.js";
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

const failWith = (message: string) =>
  Effect.fail(new CommandError({ message }));

const noTarget = () =>
  failWith("give at least one entity, device, area, floor or label");

const callAction = Effect.fn("callAction")(function* (action: Action) {
  if (action.target !== undefined && isEmptyTarget(action.target)) {
    return yield* noTarget();
  }

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

const getEntities = Effect.fn("getEntities")(function* (
  target: Target,
  domain?: string,
) {
  if (isEmptyTarget(target)) {
    return yield* noTarget();
  }

  const client = yield* BridgeClient;

  return yield* client
    .GetEntities({ target, domain })
    .pipe(
      Effect.catchTag("HomeAssistantError", (error) =>
        failWith(`could not read entities: ${error.message}`),
      ),
    );
});

// The ID of the one entity in the domain that the target matches.
const resolveOne = Effect.fn("resolveOne")(function* <
  const Domain extends string,
>(domain: Domain, target: Target) {
  const updates = yield* getEntities(target, domain);

  return yield* exactlyOne(
    updates.map(({ state }) => state.entity_id).filter(isEntityIdIn(domain)),
    (entityId) => entityId,
    `${domain} entity`,
  );
});

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

const entityActionCommand = (
  domain: string,
  name: string,
  toAction: (target: Target) => Action,
  description: string,
) =>
  Command.make(name, { target: targetConfig(domain) }, (input) =>
    callAction(toAction(toTarget(domain, input.target))).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const toggleCommands = (
  domain: string,
  actions: Record<"turnOn" | "turnOff" | "toggle", (target: Target) => Action>,
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
  ).pipe(Command.withDescription(`Reload the ${domain} YAML configuration`));

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

// For output that only fits one entity: fails once a second entity appears.
const singleEntity = <E, R>(updates: Stream.Stream<EntityUpdate, E, R>) =>
  Stream.unwrap(
    Effect.map(Ref.make<string | undefined>(undefined), (first) =>
      updates.pipe(
        Stream.mapEffect((update) =>
          Effect.flatMap(
            Ref.getAndUpdate(first, (seen) => seen ?? update.state.entity_id),
            (seen) =>
              seen === undefined || seen === update.state.entity_id
                ? Effect.succeed(update)
                : failWith(
                    `the target matches more than one entity (${seen}, ${update.state.entity_id}); this output shows one`,
                  ),
          ),
        ),
      ),
    ),
  );

const watchUpdates = (target: Target, domain?: string) =>
  Stream.unwrap(
    Effect.gen(function* () {
      if (isEmptyTarget(target)) {
        return yield* noTarget();
      }

      const client = yield* BridgeClient;

      return client.WatchEntities({ target, domain });
    }),
  );

const stateWatchCommand = (
  domain: string,
  toText: (state: EntityUpdate["state"]) => string,
) =>
  Command.make("watch", { target: targetConfig(domain) }, (input) =>
    watchUpdates(toTarget(domain, input.target), domain).pipe(
      singleEntity,
      Stream.runForEach(({ state, name }) =>
        Console.log(stateTextBar(state, name, toText)),
      ),
      withBridge,
    ),
  ).pipe(
    Command.withAlias("w"),
    Command.withDescription("Print bar JSON now and on every change"),
  );

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
        message: Argument.String("message").pipe(
          Argument.withDescription("Message to announce"),
        ),
        media_id: optionalFlag(
          Flag.String("media-id"),
          "Media ID to play instead of speaking the message",
        ),
        ...preannounceFlags,
        target: targetConfig("assist_satellite"),
      },
      ({ target, message, ...flags }) =>
        Effect.gen(function* () {
          const options = yield* decodeData(
            "announce options",
            decodeAnnounceOptions(setFields(flags)),
          );

          yield* callAction(
            AssistSatellite.announce(
              toTarget("assist_satellite", target),
              message,
              options,
            ),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withAlias("a"),
      Command.withDescription("Announce a message on satellites"),
    ),
    Command.make(
      "start-conversation",
      {
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
        target: targetConfig("assist_satellite"),
      },
      ({ target, message, ...flags }) =>
        Effect.gen(function* () {
          const data = yield* decodeData(
            "conversation options",
            decodeStartConversation({
              start_message: message,
              ...setFields(flags),
            }),
          );

          yield* callAction(
            AssistSatellite.startConversation(
              toTarget("assist_satellite", target),
              data,
            ),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withAlias("c"),
      Command.withDescription(
        "Speak a message on satellites, then listen for a reply",
      ),
    ),
    Command.make(
      "ask-question",
      {
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
        target: targetConfig("assist_satellite"),
      },
      ({ target, question, answers, ...flags }) =>
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
            AssistSatellite.askQuestion(
              yield* resolveOne(
                "assist_satellite",
                toTarget("assist_satellite", target),
              ),
              data,
            ),
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
        value: Argument.String("value").pipe(
          Argument.withDescription("New value"),
        ),
        target: targetConfig("input_number"),
      },
      (input) =>
        Effect.gen(function* () {
          const value = parseInputNumberValue(input.value);

          if (value === undefined) {
            return yield* failWith(invalidInputNumberMessage);
          }

          yield* callAction(
            InputNumber.setValue(toTarget("input_number", input.target), value),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Set the value")),
    reloadCommand("input_number", InputNumber.reload),
  ],
);

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
  toAction: (target: Target, data: LightTurnOnData) => Action,
  description: string,
) =>
  Command.make(
    name,
    { ...lightOnFlags, target: targetConfig("light") },
    ({ target, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "light options",
          decodeLightTurnOn(lightData(flags)),
        );

        yield* callAction(toAction(toTarget("light", target), data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const light = domainCommand("light", "l", "Light actions", [
  lightOnCommand("turn-on", Light.turnOn, "Turn on").pipe(
    Command.withAlias("on"),
  ),
  Command.make(
    "turn-off",
    { ...lightOffFlags, target: targetConfig("light") },
    ({ target, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "light options",
          decodeLightTurnOff(lightData(flags)),
        );

        yield* callAction(Light.turnOff(toTarget("light", target), data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("off"), Command.withDescription("Turn off")),
  lightOnCommand("toggle", Light.toggle, "Toggle").pipe(Command.withAlias("t")),
]);

const speedFlag = Flag.String("speed").pipe(
  Flag.withDescription("Speed, one of the cover's supported_speeds"),
  Flag.optional,
);

const coverMoveCommand = (
  name: string,
  toAction: (target: Target, options: CoverMoveOptions) => Action,
  description: string,
) =>
  Command.make(
    name,
    { speed: speedFlag, target: targetConfig("cover") },
    (input) =>
      callAction(
        toAction(toTarget("cover", input.target), {
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
    {
      position: percentArgument,
      speed: speedFlag,
      target: targetConfig("cover"),
    },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);
        yield* callAction(
          Cover.setPosition(toTarget("cover", input.target), position, {
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
    { position: percentArgument, target: targetConfig("cover") },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);
        yield* callAction(
          Cover.setTiltPosition(toTarget("cover", input.target), position),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the tilt position")),
]);

// Sets a mode the entity lists in an attribute, such as `fan_modes`.
const climateModeCommand = (
  name: string,
  label: string,
  example: string,
  toAction: (target: Target, mode: string) => Action,
) =>
  Command.make(
    name,
    {
      mode: Argument.String("mode").pipe(
        Argument.withDescription(`${label}, for example ${example}`),
      ),
      target: targetConfig("climate"),
    },
    (input) =>
      Effect.gen(function* () {
        if (input.mode === "") {
          return yield* failWith(`climate ${label.toLowerCase()} is required`);
        }

        yield* callAction(
          toAction(toTarget("climate", input.target), input.mode),
        );
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
      mode: Argument.Literals("mode", HvacMode.literals).pipe(
        Argument.withDescription("HVAC mode"),
      ),
      target: targetConfig("climate"),
    },
    (input) =>
      callAction(
        Climate.setHvacMode(toTarget("climate", input.target), input.mode),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Set the HVAC mode")),
  Command.make(
    "temperature",
    {
      temperature: optionalFlag(
        Flag.Finite("temperature"),
        "Target temperature, or set a range instead",
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
      target: targetConfig("climate"),
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
          Climate.setTemperature(toTarget("climate", input.target), data),
        );
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Set the target temperature with --temperature, or a range with --target-temp-low and --target-temp-high",
    ),
  ),
  Command.make(
    "humidity",
    {
      humidity: Argument.Int("humidity").pipe(
        Argument.withDescription("Target humidity in percent"),
      ),
      target: targetConfig("climate"),
    },
    (input) =>
      callAction(
        Climate.setHumidity(toTarget("climate", input.target), input.humidity),
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

const serverFilenameArgument = Argument.String("filename").pipe(
  Argument.withDescription(
    "Path on the Home Assistant host, in allowlist_external_dirs",
  ),
);

// A single media player given by entity ID, object ID or name.
const mediaPlayerFlag = (description: string) =>
  Flag.String("media-player").pipe(
    Flag.withDescription(`${description}: entity ID, object ID or name`),
  );

const resolveMediaPlayer = (value: string) =>
  resolveOne("media_player", { entity_id: value });

const camera = Command.make("camera").pipe(
  Command.withDescription("Camera actions"),
  Command.withSubcommands([
    Command.make(
      "snapshot",
      {
        output: Argument.String("output").pipe(
          Argument.withDescription("File to write the image to"),
        ),
        target: targetConfig("camera"),
      },
      (input) =>
        Effect.gen(function* () {
          const target = toTarget("camera", input.target);

          if (isEmptyTarget(target)) {
            return yield* noTarget();
          }

          const client = yield* BridgeClient;
          const fs = yield* FileSystem.FileSystem;

          const snapshot = yield* client
            .CameraSnapshot({ target })
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
      { filename: serverFilenameArgument, target: targetConfig("camera") },
      (input) =>
        callAction(
          Camera.snapshot(toTarget("camera", input.target), input.filename),
        ).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Save the camera's current image on the Home Assistant host",
      ),
    ),
    Command.make(
      "record",
      {
        filename: serverFilenameArgument,
        duration: optionalFlag(
          Flag.Int("duration"),
          "Seconds to record (default: 30)",
        ),
        lookback: optionalFlag(
          Flag.Int("lookback"),
          "Seconds from before the call to include (default: 0)",
        ),
        target: targetConfig("camera"),
      },
      (input) =>
        callAction(
          Camera.record(toTarget("camera", input.target), input.filename, {
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
        mediaPlayer: mediaPlayerFlag("Media player to play the stream on"),
        target: targetConfig("camera"),
      },
      (input) =>
        Effect.gen(function* () {
          const mediaPlayer = yield* resolveMediaPlayer(input.mediaPlayer);

          yield* callAction(
            Camera.playStream(toTarget("camera", input.target), mediaPlayer),
          );
        }).pipe(withBridge),
    ).pipe(
      Command.withDescription("Play the camera's stream on a media player"),
    ),
  ]),
);

const codeFlag = optionalFlag(Flag.String("code"), "The lock's code");

const lockCommand = (
  name: string,
  toAction: (target: Target, options: LockOptions) => Action,
  description: string,
) =>
  Command.make(
    name,
    { code: codeFlag, target: targetConfig("lock") },
    (input) =>
      callAction(
        toAction(toTarget("lock", input.target), {
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
    { position: percentArgument, target: targetConfig("valve") },
    (input) =>
      Effect.gen(function* () {
        const position = yield* parsePercent(input.position);

        yield* callAction(
          Valve.setPosition(toTarget("valve", input.target), position),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the position")),
]);

const decodeSirenTurnOn = Schema.decodeUnknownEffect(SirenTurnOnData);

const siren = domainCommand("siren", undefined, "Siren actions", [
  Command.make(
    "turn-on",
    {
      tone: optionalFlag(
        Flag.String("tone"),
        "Tone, one of the siren's available_tones",
      ),
      duration: optionalFlag(Flag.Int("duration"), "Seconds to sound for"),
      volume_level: optionalFlag(
        Flag.Finite("volume-level"),
        "Volume from 0 to 1",
      ),
      target: targetConfig("siren"),
    },
    ({ target, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "siren options",
          decodeSirenTurnOn(setFields(flags)),
        );

        yield* callAction(Siren.turnOn(toTarget("siren", target), data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("on"), Command.withDescription("Turn on")),
  entityActionCommand("siren", "turn-off", Siren.turnOff, "Turn off").pipe(
    Command.withAlias("off"),
  ),
  entityActionCommand("siren", "toggle", Siren.toggle, "Toggle").pipe(
    Command.withAlias("t"),
  ),
]);

// Not --device, which picks remotes by their Home Assistant device.
const deviceFlag = optionalFlag(
  Flag.String("remote-device"),
  "Device the command is for, as the remote's integration names it",
);

const commandsFlag = Flag.String("command").pipe(
  Flag.withDescription("Command; repeat for a sequence"),
  Flag.atLeast(1),
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
      activity: optionalFlag(
        Flag.String("activity"),
        "Activity, one of the remote's activity_list",
      ),
      target: targetConfig("remote"),
    },
    (input) =>
      callAction(
        Remote.turnOn(toTarget("remote", input.target), {
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
      command: commandsFlag,
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
      target: targetConfig("remote"),
    },
    ({ target, command, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "remote command",
          decodeRemoteSendCommand({ command, ...setFields(flags) }),
        );

        yield* callAction(Remote.sendCommand(toTarget("remote", target), data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Send commands")),
  Command.make(
    "learn-command",
    {
      command: Flag.String("command").pipe(
        Flag.withDescription("Name for a command to learn; repeat for more"),
        Flag.atLeast(0),
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
      target: targetConfig("remote"),
    },
    ({ target, command, ...flags }) =>
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

        yield* callAction(
          Remote.learnCommand(toTarget("remote", target), data),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Learn commands from a physical remote")),
  Command.make(
    "delete-command",
    {
      command: commandsFlag,
      device: deviceFlag,
      target: targetConfig("remote"),
    },
    (input) =>
      callAction(
        Remote.deleteCommand(toTarget("remote", input.target), input.command, {
          device: Option.getOrUndefined(input.device),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Delete learned commands")),
]);

const cycleFlag = optionalFlag(
  Flag.Boolean("cycle"),
  "Wrap round at the end (the default); --no-cycle stops there",
);

const selectCommands = (
  domain: string,
  actions: {
    readonly selectOption: (target: Target, option: string) => Action;
    readonly selectFirst: (target: Target) => Action;
    readonly selectLast: (target: Target) => Action;
    readonly selectNext: (target: Target, options: SelectStepOptions) => Action;
    readonly selectPrevious: (
      target: Target,
      options: SelectStepOptions,
    ) => Action;
  },
) => {
  const stepCommand = (
    name: string,
    toAction: (target: Target, options: SelectStepOptions) => Action,
    description: string,
  ) =>
    Command.make(
      name,
      { cycle: cycleFlag, target: targetConfig(domain) },
      (input) =>
        callAction(
          toAction(toTarget(domain, input.target), {
            cycle: Option.getOrUndefined(input.cycle),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription(description));

  return [
    Command.make(
      "select-option",
      {
        option: Argument.String("option").pipe(
          Argument.withDescription("Option to select"),
        ),
        target: targetConfig(domain),
      },
      (input) =>
        callAction(
          actions.selectOption(toTarget(domain, input.target), input.option),
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
const setValueCommand = <A>(
  domain: string,
  description: string,
  decode: (value: string) => Effect.Effect<A, CommandError>,
  toAction: (target: Target, value: A) => Action,
) =>
  Command.make(
    "set-value",
    {
      value: Argument.String("value").pipe(
        Argument.withDescription(description),
      ),
      target: targetConfig(domain),
    },
    (input) =>
      Effect.gen(function* () {
        const value = yield* decode(input.value);

        yield* callAction(toAction(toTarget(domain, input.target), value));
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
        options: Flag.String("option").pipe(
          Flag.withDescription("Option; repeat for each option"),
          Flag.atLeast(1),
        ),
        target: targetConfig("input_select"),
      },
      (input) =>
        Effect.gen(function* () {
          const [first, ...rest] = input.options;

          if (first === undefined) {
            return yield* failWith("set at least one option");
          }

          yield* callAction(
            InputSelect.setOptions(toTarget("input_select", input.target), [
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
        target: targetConfig("input_datetime"),
      },
      ({ target, ...flags }) =>
        Effect.gen(function* () {
          const data = yield* decodeData(
            "date and time",
            decodeInputDateTimeSet(setFields(flags)),
          );

          yield* callAction(
            InputDateTime.setDateTime(toTarget("input_datetime", target), data),
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
  Effect.map(
    Effect.transposeOption(Option.map(value, parse)),
    Option.getOrUndefined,
  );

const parseVariables = (value: Option.Option<string>) =>
  parseOptional(value, (json) =>
    decodeData("variables", decodeScriptVariables(json)),
  );

const script = domainCommand("script", undefined, "Script actions", [
  Command.make(
    "turn-on",
    { variables: variablesFlag, target: targetConfig("script") },
    (input) =>
      Effect.gen(function* () {
        const variables = yield* parseVariables(input.variables);

        yield* callAction(
          Script.turnOn(toTarget("script", input.target), variables),
        );
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
  Command.make(
    "run",
    { variables: variablesFlag, target: targetConfig("script") },
    (input) =>
      Effect.gen(function* () {
        const variables = yield* parseVariables(input.variables);

        const script = yield* resolveOne(
          "script",
          toTarget("script", input.target),
        );

        const response = yield* callAction(Script.run(script, variables));

        yield* printJson(response);
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Run the script, wait for it to finish and print its response as JSON",
    ),
  ),
  reloadCommand("script", Script.reload),
]);

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
        stopActions: optionalFlag(
          Flag.Boolean("stop-actions"),
          "Stop running actions (the default); --no-stop-actions lets them finish",
        ),
        target: targetConfig("automation"),
      },
      (input) =>
        callAction(
          Automation.turnOff(toTarget("automation", input.target), {
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
        skipCondition: optionalFlag(
          Flag.Boolean("skip-condition"),
          "Skip the conditions (the default); --no-skip-condition checks them",
        ),
        target: targetConfig("automation"),
      },
      (input) =>
        callAction(
          Automation.trigger(toTarget("automation", input.target), {
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
    { transition: transitionFlag, target: targetConfig("scene") },
    (input) =>
      callAction(
        Scene.turnOn(toTarget("scene", input.target), {
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

const timer = domainCommand("timer", undefined, "Timer actions", [
  Command.make(
    "start",
    {
      duration: optionalFlag(
        Flag.String("duration"),
        "Seconds or HH:MM:SS (default: the timer's own duration)",
      ),
      target: targetConfig("timer"),
    },
    (input) =>
      Effect.gen(function* () {
        const duration = yield* parseOptional(input.duration, parseDuration);

        yield* callAction(
          Timer.start(toTarget("timer", input.target), duration),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Start or restart the timer")),
  entityActionCommand("timer", "pause", Timer.pause, "Pause the timer"),
  entityActionCommand("timer", "cancel", Timer.cancel, "Cancel the timer"),
  entityActionCommand("timer", "finish", Timer.finish, "Finish the timer now"),
  Command.make(
    "change",
    {
      duration: Argument.String("duration").pipe(
        Argument.withDescription(
          "Seconds or HH:MM:SS to add; negative to take away, after --",
        ),
      ),
      target: targetConfig("timer"),
    },
    (input) =>
      Effect.gen(function* () {
        const duration = yield* parseDuration(input.duration);

        yield* callAction(
          Timer.change(toTarget("timer", input.target), duration),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Add time to a running timer")),
  reloadCommand("timer", Timer.reload),
]);

const schedule = domainCommand("schedule", undefined, "Schedule actions", [
  Command.make("get", { target: targetConfig("schedule") }, (input) =>
    Effect.gen(function* () {
      const response = yield* callAction(
        Schedule.getSchedule(toTarget("schedule", input.target)),
      );

      const schedules = yield* Schedule.schedulesFrom(response).pipe(
        Effect.mapError(
          (error) => new CommandError({ message: error.message }),
        ),
      );

      yield* printJson(schedules);
    }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Print each schedule's week as JSON, keyed by entity ID",
    ),
  ),
  reloadCommand("schedule", Schedule.reload),
]);

const entityIdsFlag = (name: string, description: string) =>
  Flag.String(name).pipe(Flag.withDescription(description), Flag.atLeast(0));

const nonEmpty = <A>(items: ReadonlyArray<A>) =>
  Option.some(items).pipe(Option.filter((list) => list.length > 0));

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
  Command.make(name, { target: targetConfig(undefined) }, (input) =>
    callAction(toAction(toTarget(undefined, input.target))).pipe(withBridge),
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
      "Turn on entities in any domain",
    ),
    anyEntityCommand(
      "turn-off",
      "off",
      HomeAssistantCore.turnOff,
      "Turn off entities in any domain",
    ),
    anyEntityCommand(
      "toggle",
      "t",
      HomeAssistantCore.toggle,
      "Toggle entities in any domain",
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
const valueCommand = <A>(
  domain: string,
  name: string,
  argument: { readonly name: string; readonly description: string },
  parse: (value: string) => Effect.Effect<A, CommandError>,
  toAction: (target: Target, value: A) => Action,
  description: string,
) =>
  Command.make(
    name,
    {
      value: Argument.String(argument.name).pipe(
        Argument.withDescription(argument.description),
      ),
      target: targetConfig(domain),
    },
    (input) =>
      Effect.gen(function* () {
        const value = yield* parse(input.value);

        yield* callAction(toAction(toTarget(domain, input.target), value));
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
      percentage: optionalFlag(Flag.Int("percentage"), "Speed from 0 to 100"),
      preset_mode: optionalFlag(
        Flag.String("preset-mode"),
        "Preset mode, one of the fan's preset_modes",
      ),
      target: targetConfig("fan"),
    },
    ({ target, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "fan options",
          decodeFanTurnOn(setFields(flags)),
        );

        yield* callAction(Fan.turnOn(toTarget("fan", target), data));
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
      { step: fanStepFlag, target: targetConfig("fan") },
      (input) =>
        callAction(
          toAction(
            toTarget("fan", input.target),
            Option.getOrUndefined(input.step),
          ),
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
        temperature: Argument.String("temperature").pipe(
          Argument.withDescription("Target temperature in the entity's unit"),
        ),
        operationMode: optionalFlag(
          Flag.String("operation-mode"),
          "Also switch to this operation mode",
        ),
        target: targetConfig("water_heater"),
      },
      (input) =>
        Effect.gen(function* () {
          const temperature = yield* finiteNumber(input.temperature);

          yield* callAction(
            WaterHeater.setTemperature(
              toTarget("water_heater", input.target),
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

const simpleCommands = (
  domain: string,
  commands: ReadonlyArray<
    readonly [string, (target: Target) => Action, string]
  >,
) =>
  commands.map(([name, toAction, description]) =>
    entityActionCommand(domain, name, toAction, description),
  );

const printResponse = (action: Action) =>
  callAction(action).pipe(Effect.flatMap(printJson));

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
        target: targetConfig("media_player"),
      },
      ({ target, media_content_id, media_content_type, ...flags }) =>
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
            MediaPlayer.playMedia(toTarget("media_player", target), data),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Play media")),
    Command.make(
      "join",
      {
        members: Flag.String("member").pipe(
          Flag.withDescription(
            "Player to group with these, as an entity ID, object ID or name; repeat for more",
          ),
          Flag.atLeast(1),
        ),
        target: targetConfig("media_player"),
      },
      (input) =>
        Effect.gen(function* () {
          const members = yield* Effect.forEach(
            input.members,
            resolveMediaPlayer,
          );

          yield* callAction(
            MediaPlayer.join(toTarget("media_player", input.target), members),
          );
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Group other players with these")),
    Command.make(
      "browse",
      { ...mediaLocationFlags, target: targetConfig("media_player") },
      ({ target, ...location }) =>
        printResponse(
          MediaPlayer.browseMedia(toTarget("media_player", target), {
            mediaContentType: Option.getOrUndefined(location.mediaContentType),
            mediaContentId: Option.getOrUndefined(location.mediaContentId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Print the player's media library as JSON")),
    Command.make(
      "search",
      {
        query: Argument.String("query").pipe(
          Argument.withDescription("Text to search for"),
        ),
        ...mediaLocationFlags,
        target: targetConfig("media_player"),
      },
      ({ target, query, ...location }) =>
        printResponse(
          MediaPlayer.search(toTarget("media_player", target), query, {
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
      areas: Flag.String("clean-area").pipe(
        Flag.withDescription("Area ID to clean; repeat for more"),
        Flag.atLeast(1),
      ),
      target: targetConfig("vacuum"),
    },
    (input) =>
      callAction(
        Vacuum.cleanArea(toTarget("vacuum", input.target), input.areas),
      ).pipe(withBridge),
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
      command: Argument.String("command").pipe(
        Argument.withDescription("Command the integration understands"),
      ),
      params: optionalFlag(
        Flag.String("params"),
        'Parameters as JSON, such as {"speed":2}',
      ),
      target: targetConfig("vacuum"),
    },
    (input) =>
      Effect.gen(function* () {
        const params = yield* parseOptional(input.params, (json) =>
          decodeData("params", decodeJsonValue(json)),
        );

        yield* callAction(
          Vacuum.sendCommand(
            toTarget("vacuum", input.target),
            input.command,
            params,
          ),
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

const codeCommands = (
  domain: string,
  commands: ReadonlyArray<
    readonly [string, (target: Target, options: LockOptions) => Action, string]
  >,
) =>
  commands.map(([name, toAction, description]) =>
    Command.make(
      name,
      { code: codeFlag, target: targetConfig(domain) },
      (input) =>
        callAction(
          toAction(toTarget(domain, input.target), {
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
      version: optionalFlag(
        Flag.String("version"),
        "Version to install (default: the latest)",
      ),
      backup: optionalFlag(
        Flag.Boolean("backup"),
        "Back up first, where the integration supports it",
      ),
      target: targetConfig("update"),
    },
    (input) =>
      callAction(
        Update.install(toTarget("update", input.target), {
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
    {
      message: messageArgument,
      title: titleFlag,
      target: targetConfig("notify"),
    },
    (input) =>
      callAction(
        Notify.sendMessage(toTarget("notify", input.target), {
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
      message: messageArgument,
      mediaPlayer: mediaPlayerFlag("Media player to speak on"),
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
      target: targetConfig("tts"),
    },
    (input) =>
      Effect.gen(function* () {
        const options = yield* parseOptional(
          input.options,
          parseJsonObject("options"),
        );

        const mediaPlayer = yield* resolveMediaPlayer(input.mediaPlayer);

        yield* callAction(
          Tts.speak(toTarget("tts", input.target), mediaPlayer, input.message, {
            language: Option.getOrUndefined(input.language),
            cache: Option.getOrUndefined(input.cache),
            options,
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Speak a message on a media player")),
  systemCommand("clear-cache", Tts.clearCache, "Clear the speech cache"),
]);

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
      status: todoStatusFlag.pipe(
        Flag.withDescription("Only items with this status; repeat for both"),
        Flag.atLeast(0),
      ),
      target: targetConfig("todo"),
    },
    (input) =>
      printResponse(
        Todo.getItems(
          toTarget("todo", input.target),
          input.status.length > 0 ? input.status : undefined,
        ),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Print the list's items as JSON")),
  Command.make(
    "add",
    {
      item: Argument.String("item").pipe(Argument.withDescription("Item name")),
      ...todoFieldFlags,
      target: targetConfig("todo"),
    },
    ({ target, item, ...flags }) =>
      Effect.gen(function* () {
        const fields = yield* decodeData(
          "item",
          decodeTodoItemFields(setFields(flags)),
        );

        yield* callAction(Todo.addItem(toTarget("todo", target), item, fields));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Add an item")),
  Command.make(
    "update",
    {
      item: itemArgument,
      rename: optionalFlag(Flag.String("rename"), "New name"),
      status: optionalFlag(todoStatusFlag, "New status"),
      ...todoFieldFlags,
      target: targetConfig("todo"),
    },
    ({ target, item, rename, status, ...flags }) =>
      Effect.gen(function* () {
        const fields = yield* decodeData(
          "item",
          decodeTodoItemFields(setFields(flags)),
        );

        yield* callAction(
          Todo.updateItem(toTarget("todo", target), item, {
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
      items: Flag.String("item").pipe(
        Flag.withDescription("Item name or UID; repeat for more"),
        Flag.atLeast(1),
      ),
      target: targetConfig("todo"),
    },
    (input) =>
      callAction(
        Todo.removeItem(toTarget("todo", input.target), input.items),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Remove items")),
  entityActionCommand(
    "todo",
    "remove-completed",
    Todo.removeCompletedItems,
    "Remove completed items",
  ),
]);

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
      days: Flag.Int("days").pipe(
        Flag.withDescription("Days ahead to read, from now"),
        Flag.withDefault(7),
      ),
      target: targetConfig("calendar"),
    },
    (input) =>
      Effect.gen(function* () {
        if (input.days < 1) {
          return yield* failWith("days must be at least 1");
        }

        const start = new Date();

        const response = yield* callAction(
          Calendar.getEvents(toTarget("calendar", input.target), {
            start,
            end: new Date(start.getTime() + input.days * 86_400_000),
          }),
        );

        const events = yield* Calendar.eventsFrom(response).pipe(
          Effect.mapError(
            (error) => new CommandError({ message: error.message }),
          ),
        );

        yield* printJson(events);
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Print upcoming events as JSON, keyed by calendar entity ID",
    ),
  ),
  Command.make(
    "create-event",
    {
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
      target: targetConfig("calendar"),
    },
    (input) =>
      Effect.gen(function* () {
        const when = yield* calendarWhen(input);

        yield* callAction(
          CalendarActions.createEvent(
            toTarget("calendar", input.target),
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
      type: Flag.Literals("type", ["daily", "hourly", "twice_daily"]).pipe(
        Flag.withDescription("Forecast type"),
        Flag.withDefault("daily"),
      ),
      target: targetConfig("weather"),
    },
    (input) =>
      printResponse(
        Weather.getForecasts(toTarget("weather", input.target), input.type),
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
      structure: optionalFlag(
        Flag.String("structure"),
        "Output structure as a JSON object of selectors",
      ),
      target: targetConfig("ai_task"),
    },
    (input) =>
      Effect.gen(function* () {
        const structure = yield* parseOptional(
          input.structure,
          parseJsonObject("structure"),
        );

        const target = toTarget("ai_task", input.target);

        // Without a target, Home Assistant uses the preferred AI task entity.
        const entityId = isEmptyTarget(target)
          ? undefined
          : yield* resolveOne("ai_task", target);

        yield* printResponse(
          AiTask.generateData(input.taskName, input.instructions, {
            entityId,
            structure,
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Generate data and print it as JSON")),
  Command.make(
    "generate-image",
    { ...taskArguments, target: targetConfig("ai_task") },
    (input) =>
      Effect.gen(function* () {
        const entityId = yield* resolveOne(
          "ai_task",
          toTarget("ai_task", input.target),
        );

        yield* printResponse(
          AiTask.generateImage(entityId, input.taskName, input.instructions),
        );
      }).pipe(withBridge),
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

const alert = domainCommand(
  "alert",
  undefined,
  "Alert actions",
  toggleCommands("alert", Alert),
);

const utilityMeter = domainCommand(
  "utility_meter",
  undefined,
  "Utility meter actions",
  [
    Command.make("reset", { target: targetConfig("select") }, (input) =>
      Effect.gen(function* () {
        const updates = yield* getEntities(
          toTarget("select", input.target),
          "select",
        );

        const entityIds = updates
          .map(({ state }) => state.entity_id)
          .filter(isEntityIdIn("select"));

        if (entityIds.length === 0) {
          return yield* failWith("the target matches no tariff selects");
        }

        yield* callAction(UtilityMeter.reset(entityIds));
      }).pipe(withBridge),
    ).pipe(
      Command.withDescription(
        "Reset the meters behind tariff selects, such as select.energy",
      ),
    ),
    valueCommand(
      "sensor",
      "calibrate",
      { name: "value", description: "New meter reading" },
      finiteNumber,
      UtilityMeter.calibrate,
      "Set a meter sensor's reading",
    ),
  ],
);

const logbook = domainCommand("logbook", undefined, "Logbook actions", [
  Command.make(
    "log",
    {
      name: Argument.String("name").pipe(
        Argument.withDescription(
          "Who or what the entry is about, such as Kitchen",
        ),
      ),
      message: Argument.String("message").pipe(
        Argument.withDescription("What happened, such as is being used"),
      ),
      entityId: optionalFlag(
        Flag.String("entity-id"),
        "Full entity ID to tie the entry to",
      ),
      domain: optionalFlag(
        Flag.String("domain"),
        "Domain whose icon the entry shows",
      ),
    },
    (input) =>
      callAction(
        Logbook.log(input.name, input.message, {
          entityId: Option.getOrUndefined(input.entityId),
          domain: Option.getOrUndefined(input.domain),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Add a logbook entry")),
]);

const systemLog = domainCommand("system_log", undefined, "System log actions", [
  Command.make(
    "write",
    {
      message: messageArgument,
      level: optionalFlag(
        Flag.Literals("level", SystemLogLevel.literals),
        "Log level (default: error)",
      ),
      logger: optionalFlag(
        Flag.String("logger"),
        "Logger name, such as mycomponent.myplatform",
      ),
    },
    (input) =>
      callAction(
        SystemLog.write(input.message, {
          level: Option.getOrUndefined(input.level),
          logger: Option.getOrUndefined(input.logger),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Write to the system log")),
  systemCommand("clear", SystemLog.clear, "Clear the system log"),
]);

// Splits `key=value`, at the first `=`.
const parsePair = (label: string) => (pair: string) => {
  const index = pair.indexOf("=");

  return index > 0 && index < pair.length - 1
    ? Effect.succeed([pair.slice(0, index), pair.slice(index + 1)] as const)
    : failWith(`${label} must look like name=value, not ${pair}`);
};

const decodeLogLevel = Schema.decodeUnknownEffect(LogLevel);

const parseLogLevel = (level: string) =>
  decodeData("log level", decodeLogLevel(level.toLowerCase()));

const logger = domainCommand("logger", undefined, "Logger actions", [
  Command.make(
    "default-level",
    {
      level: Argument.String("level").pipe(
        Argument.withDescription(
          `Level for loggers without their own: ${LogLevel.literals.join(", ")}`,
        ),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const level = yield* parseLogLevel(input.level);

        yield* callAction(LoggerActions.setDefaultLevel(level));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the default log level")),
  Command.make(
    "level",
    {
      levels: Argument.String("logger=level").pipe(
        Argument.withDescription(
          "Logger and level, such as homeassistant.components.mqtt=debug; repeat for more",
        ),
        Argument.atLeast(1),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const levels = yield* Effect.forEach(input.levels, (pair) =>
          Effect.flatMap(parsePair("a logger level")(pair), ([name, level]) =>
            Effect.map(
              parseLogLevel(level),
              (parsed) => [name, parsed] as const,
            ),
          ),
        );

        yield* callAction(LoggerActions.setLevel(Object.fromEntries(levels)));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the level of particular loggers")),
]);

const keepDaysFlag = (description: string) =>
  optionalFlag(Flag.Int("keep-days"), description);

const decodeRecorderPurge = Schema.decodeUnknownEffect(RecorderPurgeData);

const decodeGetStatistics = Schema.decodeUnknownEffect(
  RecorderGetStatisticsData,
);

const recorder = domainCommand("recorder", undefined, "Recorder actions", [
  Command.make(
    "purge",
    {
      keep_days: keepDaysFlag(
        "Days of history to keep, up to 365 (default: the recorder's purge_keep_days)",
      ),
      repack: optionalFlag(
        Flag.Boolean("repack"),
        "Free the disk space afterwards, which can take a while",
      ),
      apply_filter: optionalFlag(
        Flag.Boolean("apply-filter"),
        "Also remove what the recorder's filters now exclude",
      ),
    },
    (flags) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "purge options",
          decodeRecorderPurge(setFields(flags)),
        );

        yield* callAction(Recorder.purge(data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Remove old history")),
  Command.make(
    "purge-entities",
    {
      domains: Flag.String("domain").pipe(
        Flag.withDescription(
          "Purge every entity in this domain; repeat for more",
        ),
        Flag.atLeast(0),
      ),
      globs: Flag.String("glob").pipe(
        Flag.withDescription(
          "Purge entity IDs matching this glob, such as sensor.weather_*; repeat for more",
        ),
        Flag.atLeast(0),
      ),
      keepDays: keepDaysFlag("Days of history to keep (default: none)"),
      target: targetConfig(undefined),
    },
    (input) =>
      Effect.gen(function* () {
        const target = toTarget(undefined, input.target);

        if (
          isEmptyTarget(target) &&
          input.domains.length === 0 &&
          input.globs.length === 0
        ) {
          return yield* failWith(
            "give entities to purge, or --domain or --glob",
          );
        }

        yield* callAction(
          Recorder.purgeEntities({
            target: isEmptyTarget(target) ? undefined : target,
            domains: input.domains,
            entityGlobs: input.globs,
            keepDays: Option.getOrUndefined(input.keepDays),
          }),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Remove history for particular entities")),
  systemCommand("enable", Recorder.enable, "Start recording again"),
  systemCommand(
    "disable",
    Recorder.disable,
    "Stop recording until enabled or Home Assistant restarts",
  ),
  Command.make(
    "statistics",
    {
      startTime: Argument.String("start").pipe(
        Argument.withDescription(
          "Start, such as 2026-10-01 00:00, in Home Assistant's time zone",
        ),
      ),
      statisticIds: Argument.String("statistic_id").pipe(
        Argument.withDescription(
          "Entity ID or external statistic ID; repeat for more",
        ),
        Argument.atLeast(1),
      ),
      endTime: optionalFlag(Flag.String("end"), "End (default: now)"),
      period: Flag.Literals("period", StatisticsPeriod.literals).pipe(
        Flag.withDescription("Length of each row"),
      ),
      types: Flag.Literals("type", StatisticType.literals).pipe(
        Flag.withDescription("Value to include; repeat for more"),
        Flag.atLeast(1),
      ),
      units: Flag.String("unit").pipe(
        Flag.withDescription(
          "Unit to convert a unit class to, such as energy=kWh; repeat for more",
        ),
        Flag.atLeast(0),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const units = yield* Effect.forEach(input.units, parsePair("--unit"));

        const data = yield* decodeData(
          "statistics request",
          decodeGetStatistics({
            start_time: input.startTime,
            statistic_ids: input.statisticIds,
            period: input.period,
            types: input.types,
            ...setFields({
              end_time: input.endTime,
              units: nonEmpty(units).pipe(Option.map(Object.fromEntries)),
            }),
          }),
        );

        const response = yield* callAction(Recorder.getStatistics(data));

        const statistics = yield* Recorder.statisticsFrom(response).pipe(
          Effect.mapError(
            (error) => new CommandError({ message: error.message }),
          ),
        );

        yield* printJson(statistics);
      }).pipe(withBridge),
  ).pipe(
    Command.withDescription(
      "Print long-term statistics as JSON, keyed by statistic ID",
    ),
  ),
]);

const decodeSetTheme = Schema.decodeUnknownEffect(FrontendSetThemeData);

const frontend = domainCommand("frontend", undefined, "Frontend actions", [
  Command.make(
    "set-theme",
    {
      name: optionalFlag(
        Flag.String("name"),
        "Default theme, or with --mode that mode's default; none goes back to Home Assistant's theme",
      ),
      name_dark: optionalFlag(
        Flag.String("name-dark"),
        "Default theme in dark mode",
      ),
      mode: optionalFlag(
        Flag.Literals("mode", ["light", "dark"]),
        "Mode that --name sets the default for",
      ),
    },
    (flags) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "theme",
          decodeSetTheme(setFields(flags)),
        );

        yield* callAction(Frontend.setTheme(data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the default theme")),
  systemCommand(
    "reload-themes",
    Frontend.reloadThemes,
    "Reload themes from YAML",
  ),
]);

const backup = domainCommand("backup", undefined, "Backup actions", [
  systemCommand(
    "create",
    Backup.create,
    "Back up to the default location, without the Supervisor",
  ),
  systemCommand(
    "create-automatic",
    Backup.createAutomatic,
    "Back up with the automatic backup settings",
  ),
]);

const decodeWakeOnLan = Schema.decodeUnknownEffect(WakeOnLanData);

const wakeOnLan = domainCommand("wake_on_lan", "wol", "Wake on LAN actions", [
  Command.make(
    "send-magic-packet",
    {
      mac: Argument.String("mac").pipe(
        Argument.withDescription("MAC address, such as aa:bb:cc:dd:ee:ff"),
      ),
      secureon_password: optionalFlag(
        Flag.String("secureon-password"),
        "SecureOn password",
      ),
      broadcast_address: optionalFlag(
        Flag.String("broadcast-address"),
        "Address to send to (default: the whole network)",
      ),
      broadcast_port: optionalFlag(
        Flag.Int("broadcast-port"),
        "Port to send to (default: 9)",
      ),
    },
    ({ mac, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "magic packet",
          decodeWakeOnLan({ mac, ...setFields(flags) }),
        );

        yield* callAction(WakeOnLan.sendMagicPacket(data));
      }).pipe(withBridge),
  ).pipe(Command.withAlias("wake"), Command.withDescription("Wake a device")),
]);

// The ID of the one device a device ID or name refers to.
const resolveDevice = Effect.fn("resolveDevice")(function* (device: string) {
  const client = yield* BridgeClient;

  const found = yield* client
    .Search({ target: { device_id: [device] }, kinds: ["device"] })
    .pipe(
      Effect.catchTags({
        SearchEmpty: () => failWith("give a device"),
        HomeAssistantError: (error) =>
          failWith(`could not find the device: ${error.message}`),
        TargetError: (error) => failWith(error.message),
      }),
    );

  const [only, ...others] = found.results;

  if (only === undefined || others.length > 0) {
    return yield* failWith(`${device} matches ${found.results.length} devices`);
  }

  return only.id;
});

const appArgument = Argument.String("app").pipe(
  Argument.withDescription("App slug, such as core_ssh"),
);

const slugArgument = Argument.String("slug").pipe(
  Argument.withDescription("Backup slug"),
);

const backupOptionFlags = {
  name: optionalFlag(
    Flag.String("name"),
    "Backup name (default: the date and time)",
  ),
  password: optionalFlag(
    Flag.String("password"),
    "Password to protect it with",
  ),
  compressed: optionalFlag(
    Flag.Boolean("compressed"),
    "Compress the backup (the default); --no-compressed doesn't",
  ),
  location: optionalFlag(
    Flag.String("location"),
    "Backup mount to save to (default: local storage)",
  ),
  homeassistant_exclude_database: optionalFlag(
    Flag.Boolean("exclude-database"),
    "Leave out the Home Assistant database",
  ),
};

const partialFlags = {
  homeassistant: optionalFlag(
    Flag.Boolean("homeassistant"),
    "Include Home Assistant's configuration",
  ),
  folders: Flag.Literals("folder", BackupFolder.literals).pipe(
    Flag.withDescription("Folder to include; repeat for more"),
    Flag.atLeast(0),
  ),
  apps: Flag.String("app").pipe(
    Flag.withDescription("App slug to include; repeat for more"),
    Flag.atLeast(0),
  ),
};

const decodeBackupFull = Schema.decodeUnknownEffect(HassioBackupFullData);

const decodeBackupPartial = Schema.decodeUnknownEffect(HassioBackupPartialData);

const decodeRestorePartial = Schema.decodeUnknownEffect(
  HassioRestorePartialData,
);

const printBackupSlug = (action: Action) =>
  Effect.gen(function* () {
    const response = yield* callAction(action);

    const slug = yield* Hassio.backupFrom(response).pipe(
      Effect.mapError((error) => new CommandError({ message: error.message })),
    );

    yield* Console.log(slug);
  });

const appCommand = (
  name: string,
  toAction: (app: string) => Action,
  description: string,
) =>
  Command.make(name, { app: appArgument }, (input) =>
    callAction(toAction(input.app)).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const hassio = domainCommand("hassio", undefined, "Supervisor actions", [
  appCommand("app-start", Hassio.appStart, "Start an app"),
  appCommand("app-stop", Hassio.appStop, "Stop an app"),
  appCommand("app-restart", Hassio.appRestart, "Restart an app"),
  Command.make(
    "app-stdin",
    {
      app: appArgument,
      input: Argument.String("input").pipe(
        Argument.withDescription("Text to write"),
      ),
      json: Flag.Boolean("json").pipe(
        Flag.withDescription("Send the input as a JSON object"),
        Flag.withDefault(false),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const data = input.json
          ? yield* parseJsonObject("input")(input.input)
          : input.input;

        yield* callAction(Hassio.appStdin(input.app, data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Write to an app's stdin")),
  systemCommand("host-reboot", Hassio.hostReboot, "Reboot the host"),
  systemCommand("host-shutdown", Hassio.hostShutdown, "Shut down the host"),
  Command.make("backup-full", backupOptionFlags, (flags) =>
    Effect.gen(function* () {
      const data = yield* decodeData(
        "backup options",
        decodeBackupFull(setFields(flags)),
      );

      yield* printBackupSlug(Hassio.backupFull(data));
    }).pipe(withBridge),
  ).pipe(Command.withDescription("Back up everything and print the slug")),
  Command.make(
    "backup-partial",
    { ...backupOptionFlags, ...partialFlags },
    ({ folders, apps, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "backup options",
          decodeBackupPartial(
            setFields({
              ...flags,
              folders: nonEmpty(folders),
              apps: nonEmpty(apps),
            }),
          ),
        );

        yield* printBackupSlug(Hassio.backupPartial(data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Back up some parts and print the slug")),
  Command.make(
    "restore-full",
    {
      slug: slugArgument,
      password: optionalFlag(Flag.String("password"), "Backup password"),
    },
    (input) =>
      callAction(
        Hassio.restoreFull(input.slug, {
          password: Option.getOrUndefined(input.password),
        }),
      ).pipe(withBridge),
  ).pipe(Command.withDescription("Restore everything from a backup")),
  Command.make(
    "restore-partial",
    {
      slug: slugArgument,
      password: optionalFlag(Flag.String("password"), "Backup password"),
      ...partialFlags,
    },
    ({ slug, folders, apps, ...flags }) =>
      Effect.gen(function* () {
        const data = yield* decodeData(
          "restore options",
          decodeRestorePartial(
            setFields({
              ...flags,
              folders: nonEmpty(folders),
              apps: nonEmpty(apps),
            }),
          ),
        );

        yield* callAction(Hassio.restorePartial(slug, data));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Restore some parts from a backup")),
  Command.make(
    "mount-reload",
    {
      device: Argument.String("device").pipe(
        Argument.withDescription("Mount device ID or name"),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        const deviceId = yield* resolveDevice(input.device);

        yield* callAction(Hassio.mountReload(deviceId));
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Reload a network storage mount")),
]);

const configuredCommandGroup = (
  domain: string,
  description: string,
  commands: {
    readonly run: (
      name: string,
      variables?: Readonly<Record<string, Schema.Json>>,
      options?: { readonly returnResponse?: boolean },
    ) => Action;
    readonly reload: () => Action;
  },
  readResponse: (
    response: Schema.Json | null,
  ) => Effect.Effect<Schema.Json, HomeAssistantError>,
) =>
  domainCommand(domain, undefined, description, [
    Command.make(
      "run",
      {
        name: Argument.String("name").pipe(
          Argument.withDescription(`Name, without ${domain}.`),
        ),
        data: optionalFlag(
          Flag.String("data"),
          'Data to pass, as a JSON object, such as \'{"room":"office"}\'',
        ),
        response: Flag.Boolean("response").pipe(
          Flag.withDescription("Wait for the result and print it as JSON"),
          Flag.withDefault(false),
        ),
      },
      (input) =>
        Effect.gen(function* () {
          const data = yield* parseOptional(
            input.data,
            parseJsonObject("data"),
          );

          const result = yield* callAction(
            commands.run(input.name, data, { returnResponse: input.response }),
          );

          if (input.response) {
            yield* printJson(
              yield* readResponse(result).pipe(
                Effect.mapError(
                  (error) => new CommandError({ message: error.message }),
                ),
              ),
            );
          }
        }).pipe(withBridge),
    ).pipe(Command.withDescription("Run one")),
    reloadCommand(domain, commands.reload),
  ]);

const shellCommand = configuredCommandGroup(
  "shell_command",
  "Shell command actions",
  ShellCommand,
  ShellCommand.responseFrom,
);

const restCommand = configuredCommandGroup(
  "rest_command",
  "REST command actions",
  RestCommand,
  RestCommand.responseFrom,
);

const pythonScript = configuredCommandGroup(
  "python_script",
  "Python script actions",
  PythonScript,
  Effect.succeed,
);

const cloud = domainCommand(
  "cloud",
  undefined,
  "Home Assistant Cloud actions",
  [
    systemCommand(
      "remote-connect",
      Cloud.remoteConnect,
      "Turn on remote access through the cloud",
    ),
    systemCommand(
      "remote-disconnect",
      Cloud.remoteDisconnect,
      "Turn off remote access through the cloud",
    ),
  ],
);

const ffmpegCommand = (
  name: string,
  toAction: (entityIds?: ReadonlyArray<`binary_sensor.${string}`>) => Action,
  description: string,
) =>
  Command.make(name, { target: targetConfig("binary_sensor") }, (input) =>
    Effect.gen(function* () {
      const target = toTarget("binary_sensor", input.target);

      if (isEmptyTarget(target)) {
        return yield* callAction(toAction());
      }

      const updates = yield* getEntities(target, "binary_sensor");

      const entityIds = updates
        .map(({ state }) => state.entity_id)
        .filter(isEntityIdIn("binary_sensor"));

      if (entityIds.length === 0) {
        return yield* failWith("the target matches no binary sensors");
      }

      return yield* callAction(toAction(entityIds));
    }).pipe(withBridge),
  ).pipe(
    Command.withDescription(`${description}; without a target, every one`),
  );

const ffmpeg = domainCommand("ffmpeg", undefined, "FFmpeg sensor actions", [
  ffmpegCommand("start", Ffmpeg.start, "Start FFmpeg sensors"),
  ffmpegCommand("stop", Ffmpeg.stop, "Stop FFmpeg sensors"),
  ffmpegCommand("restart", Ffmpeg.restart, "Restart FFmpeg sensors"),
]);

const googleAssistant = domainCommand(
  "google_assistant",
  undefined,
  "Google Assistant actions",
  [
    Command.make(
      "request-sync",
      {
        agentUserId: optionalFlag(
          Flag.String("agent-user-id"),
          "Google agent user ID (default: the token's user)",
        ),
      },
      (input) =>
        callAction(
          GoogleAssistant.requestSync({
            agentUserId: Option.getOrUndefined(input.agentUserId),
          }),
        ).pipe(withBridge),
    ).pipe(Command.withDescription("Ask Google to sync its devices")),
  ],
);

const lovelace = domainCommand("lovelace", undefined, "Dashboard actions", [
  systemCommand(
    "reload-resources",
    Lovelace.reloadResources,
    "Reload dashboard resources from YAML",
  ),
]);

const yamlReloadDescriptions: Record<YamlReloadDomain, string> = {
  bayesian: "Bayesian sensor actions",
  command_line: "Command line actions",
  derivative: "Derivative sensor actions",
  filter: "Filter sensor actions",
  generic_thermostat: "Generic thermostat actions",
  history_stats: "History stats actions",
  intent_script: "Intent script actions",
  min_max: "Min/max sensor actions",
  person: "Person actions",
  rest: "RESTful actions",
  statistics: "Statistics sensor actions",
  template: "Template actions",
  trend: "Trend sensor actions",
  universal: "Universal media player actions",
  zone: "Zone actions",
};

const yamlReloadCommands = YamlReloadDomain.literals.map((domain) =>
  domainCommand(domain, undefined, yamlReloadDescriptions[domain], [
    reloadCommand(domain, () => reloadYaml(domain)),
  ]),
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

// Plain text, bar JSON and one --field without --json describe one entity;
// --json and several fields print objects keyed by entity ID.
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

    const [onlyField] = fields;
    const keyed = json || fields.length > 1;

    return {
      keyed,
      line: (update: EntityUpdate) => {
        if (barJson) {
          return entityBar(update.state, update.name, options);
        }

        return onlyField === undefined
          ? update.state.state
          : entityField(update.state, update.name, onlyField);
      },
      value: (update: EntityUpdate): Schema.Json =>
        fields.length > 0
          ? entityFieldValues(update.state, update.name, fields)
          : update,
    };
  });

const keyedByEntity = (
  updates: ReadonlyArray<EntityUpdate>,
  value: (update: EntityUpdate) => Schema.Json,
) =>
  JSON.stringify(
    Object.fromEntries(
      updates.map((update) => [update.state.entity_id, value(update)]),
    ),
  );

// Drops lines that repeat the entity's previous line.
const changedPerEntity = <E, R>(
  lines: Stream.Stream<readonly [entityId: string, line: string], E, R>,
) =>
  Stream.unwrap(
    Effect.sync(() => {
      const previous = new Map<string, string>();

      return lines.pipe(
        Stream.filter(([entityId, line]) => {
          if (previous.get(entityId) === line) {
            return false;
          }

          previous.set(entityId, line);

          return true;
        }),
        Stream.map(([, line]) => line),
      );
    }),
  );

const entityReadConfig = {
  domain: optionalFlag(
    Flag.String("domain"),
    "Only entities in this domain, such as light",
  ),
  ...entityOutputFlags,
  target: targetConfig(undefined),
};

const watch = Command.make(
  "watch",
  entityReadConfig,
  ({ domain, target, ...output }) =>
    Effect.gen(function* () {
      const format = yield* entityFormatter(output);

      if (!output.barJson && !output.json && output.fields.length === 0) {
        yield* Effect.logWarning(
          "Watch output is plain text. Use --json, --field or --bar-json for output in scripts and bars.",
        );
      }

      const updates = watchUpdates(
        toTarget(undefined, target),
        Option.getOrUndefined(domain),
      );

      yield* (
        format.keyed
          ? updates.pipe(
              Stream.map(
                (update) =>
                  [
                    update.state.entity_id,
                    keyedByEntity([update], format.value),
                  ] as const,
              ),
            )
          : updates.pipe(
              singleEntity,
              Stream.map(
                (update) =>
                  [update.state.entity_id, format.line(update)] as const,
              ),
            )
      ).pipe(
        changedPerEntity,
        Stream.runForEach((line) => Console.log(line)),
      );
    }).pipe(withBridge),
).pipe(
  Command.withAlias("w"),
  Command.withDescription(
    "Print the state of every entity a target matches now and on every change",
  ),
);

const get = Command.make(
  "get",
  entityReadConfig,
  ({ domain, target, ...output }) =>
    Effect.gen(function* () {
      const format = yield* entityFormatter(output);

      const updates = yield* getEntities(
        toTarget(undefined, target),
        Option.getOrUndefined(domain),
      );

      if (format.keyed) {
        yield* Console.log(keyedByEntity(updates, format.value));

        return;
      }

      const update = yield* exactlyOne(
        updates,
        ({ state }) => state.entity_id,
      ).pipe(
        Effect.mapError(
          (error) =>
            new CommandError({
              message: `${error.message}; use --json or several --field flags for more than one`,
            }),
        ),
      );

      yield* Console.log(format.line(update));
    }).pipe(withBridge),
).pipe(
  Command.withAlias("g"),
  Command.withDescription(
    "Print the state of every entity a target matches once",
  ),
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
  alert,
  utilityMeter,
  logbook,
  systemLog,
  logger,
  recorder,
  frontend,
  backup,
  wakeOnLan,
  hassio,
  shellCommand,
  restCommand,
  pythonScript,
  cloud,
  ffmpeg,
  googleAssistant,
  lovelace,
  ...yamlReloadCommands,
] as const;

const searchKinds = ["entity", "device", "area", "command"] as const;

const emptySearch =
  "enter something to search for, or a target, --domain or --device-class to list";

const search = Command.make(
  "search",
  {
    query: Argument.String("query").pipe(
      Argument.withDescription(
        "Words to search for, such as kitchen lamp; leave out to list everything the target and filters match",
      ),
      Argument.atLeast(0),
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
    target: targetFlags,
  },
  (input) =>
    Effect.gen(function* () {
      const query = input.query.join(" ").trim();
      const target = toTarget(undefined, input.target);
      const hasTarget = !isEmptyTarget(target);
      const domain = Option.getOrUndefined(input.domain);
      const deviceClass = Option.getOrUndefined(input.deviceClass);

      if (
        query === "" &&
        !hasTarget &&
        domain === undefined &&
        deviceClass === undefined
      ) {
        return yield* failWith(emptySearch);
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

      // Commands are only searched by text, and have no target or device
      // class.
      const includeCommands =
        kinds.includes("command") &&
        query !== "" &&
        !hasTarget &&
        deviceClass === undefined;

      const searchBridge = (limit: number, offset: number) =>
        Effect.gen(function* () {
          const client = yield* BridgeClient;

          return yield* client
            .Search({
              query: query === "" ? undefined : query,
              target: hasTarget ? target : undefined,
              kinds: haKinds,
              domain,
              deviceClass,
              limit,
              offset,
            })
            .pipe(Effect.catchTag("SearchEmpty", () => failWith(emptySearch)));
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

        const fromCommands = yield* (yield* Search).fuzzy({
          items: commandItems(commands).filter(
            (item) =>
              domain === undefined || item.path.split(" ")[0] === domain,
          ),
          query,
          keys: commandKeys,
          primary: (item) => item.path,
          overrides: { limit: Number.POSITIVE_INFINITY },
        });

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
