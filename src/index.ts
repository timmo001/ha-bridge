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
  AssistSatelliteStartConversationData,
  Button,
  Camera,
  Climate,
  ClimateSetTemperatureData,
  Cover,
  HvacMode,
  InputBoolean,
  InputButton,
  InputNumber,
  Light,
  Lock,
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
  type EntityId,
  type LockOptions,
} from "@timmo001/effect-ha";
import {
  BridgeClient,
  resolveSocketPath,
  type EntityUpdate,
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
  stateTextBar,
} from "./cli/output.js";
import { BridgeConfig } from "./config/Config.js";
import {
  invalidInputNumberMessage,
  parseInputNumberValue,
} from "./homeassistant/inputNumber.js";
import { lightData } from "./homeassistant/light.js";

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
    : failWith("position must be an integer from 0 to 100");
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

const watchEntity = Command.make(
  "entity",
  {
    entityId: Argument.String("entity_id").pipe(
      Argument.withDescription("Entity to watch, for example light.office"),
    ),
    barJson: Flag.Boolean("bar-json").pipe(
      Flag.withDescription("Print one bar JSON object per state"),
      Flag.withDefault(false),
    ),
    icon: textFlag("icon", "Text to show instead of the state"),
    textOn: textFlag("text-on", "Text appended when the entity is on"),
    textOff: textFlag("text-off", "Text appended when the entity is off"),
    tooltipOn: textFlag("tooltip-on", "Tooltip when the entity is on"),
    tooltipOff: textFlag("tooltip-off", "Tooltip when the entity is off"),
    classOn: textFlag("class-on", "Class when the entity is on"),
    classOff: textFlag("class-off", "Class when the entity is off"),
  },
  ({ entityId, barJson, ...options }) =>
    Effect.gen(function* () {
      if (!barJson) {
        yield* Effect.logWarning(
          "Watch output is plain text without --bar-json. Use --bar-json for stable JSON output in scripts and bars.",
        );
      }

      const client = yield* BridgeClient;
      yield* client
        .WatchEntity({ entityId })
        .pipe(
          Stream.runForEach(({ state, name }: EntityUpdate) =>
            Console.log(
              barJson ? entityBar(state, name, options) : state.state,
            ),
          ),
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

haBridge.pipe(
  Command.withSubcommands([
    serve,
    setup,
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
  ]),
  Command.run({ version: packageJson.version }),
  Effect.catchCause(reportCliCause),
  Effect.provide(
    Layer.mergeAll(BunServices.layer, Layer.succeed(Logger.LogToStderr, true)),
  ),
  BunRuntime.runMain,
);
