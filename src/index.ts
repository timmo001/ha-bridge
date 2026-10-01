import { BunRuntime, BunServices, BunSocket } from "@effect/platform-bun";
import {
  Cause,
  Console,
  Data,
  Effect,
  FileSystem,
  Layer,
  Logger,
  Predicate,
  Stream,
} from "effect";
import { Argument, CliError, Command, Flag } from "effect/cli";
import { RpcClientError } from "effect/rpc/RpcClientError";
import packageJson from "../package.json" with { type: "json" };
import {
  AssistSatellite,
  Climate,
  Cover,
  InputBoolean,
  InputNumber,
  Light,
  Switch,
  type Action,
  type EntityId,
} from "@timmo001/effect-ha";
import {
  BridgeClient,
  resolveSocketPath,
  type EntityUpdate,
} from "@timmo001/effect-ha-bridge";
import { serve as serveBridge } from "./bridge/Server.js";
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

  yield* client.CallAction(action).pipe(
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
  alias: string,
  description: string,
  subcommands: Subcommands,
) =>
  Command.make(name).pipe(
    Command.withAlias(alias),
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

const parsePercent = (value: string) => {
  const position = /^[+-]?\d+$/.test(value) ? Number(value) : Number.NaN;

  return position >= 0 && position <= 100
    ? Effect.succeed(position)
    : failWith("cover position must be an integer from 0 to 100");
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

const assistSatellite = domainCommand(
  "assist_satellite",
  "as",
  "Assist satellite actions",
  [
    Command.make(
      "announce",
      {
        area: Argument.String("area_id").pipe(
          Argument.withDescription("Area to announce in"),
        ),
        message: Argument.String("message").pipe(
          Argument.withDescription("Message to announce"),
        ),
      },
      ({ area, message }) =>
        callAction(AssistSatellite.announce({ area_id: area }, message)).pipe(
          withBridge,
        ),
    ).pipe(
      Command.withAlias("a"),
      Command.withDescription("Announce a message on an area's satellites"),
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
  ],
);

const coverName = nameArgument("Entity name without the cover. prefix");

const coverPositionCommand = (
  name: string,
  toAction: (entityId: EntityId<"cover">, position: number) => Action,
  description: string,
) =>
  Command.make(name, { name: coverName, position: percentArgument }, (input) =>
    Effect.gen(function* () {
      const position = yield* parsePercent(input.position);
      yield* callAction(toAction(`cover.${input.name}`, position));
    }).pipe(withBridge),
  ).pipe(Command.withDescription(description));

const cover = domainCommand("cover", "c", "Cover actions", [
  stateWatchCommand("cover", coverStateText),
  coverPositionCommand("position", Cover.setPosition, "Set the position"),
  coverPositionCommand(
    "tilt-position",
    Cover.setTiltPosition,
    "Set the tilt position",
  ),
  entityActionCommand("cover", "close", Cover.close, "Close the cover"),
]);

const climate = domainCommand("climate", "cl", "Climate actions", [
  stateWatchCommand("climate", climateStateText),
  Command.make(
    "fan-mode",
    {
      name: nameArgument("Entity name without the climate. prefix"),
      mode: Argument.String("mode").pipe(
        Argument.withDescription("Fan mode, for example 1 or auto"),
      ),
    },
    (input) =>
      Effect.gen(function* () {
        if (input.mode === "") {
          return yield* failWith("climate fan mode is required");
        }

        yield* callAction(
          Climate.setFanMode(`climate.${input.name}`, input.mode),
        );
      }).pipe(withBridge),
  ).pipe(Command.withDescription("Set the fan mode")),
]);

const camera = Command.make("camera").pipe(
  Command.withDescription("Camera actions"),
  Command.withSubcommands([
    Command.make(
      "snapshot",
      {
        name: nameArgument("Entity name without the camera. prefix"),
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
    domainCommand(
      "input_boolean",
      "ib",
      "Input boolean actions",
      toggleCommands("input_boolean", InputBoolean),
    ),
    inputNumber,
    domainCommand(
      "light",
      "l",
      "Light actions",
      toggleCommands("light", Light),
    ),
    domainCommand(
      "switch",
      "s",
      "Switch actions",
      toggleCommands("switch", Switch),
    ),
    cover,
    climate,
    camera,
  ]),
  Command.run({ version: packageJson.version }),
  Effect.catchCause(reportCliCause),
  Effect.provide(
    Layer.mergeAll(BunServices.layer, Layer.succeed(Logger.LogToStderr, true)),
  ),
  BunRuntime.runMain,
);
