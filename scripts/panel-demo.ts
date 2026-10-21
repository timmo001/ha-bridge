// Runs the dashboard panel against a demo bridge with made-up entities, so
// the panel can be tried, demonstrated and screenshotted without Home
// Assistant. Changes are kept in the data directory between runs; --reset
// starts again from the demo dashboards.
import { BunRuntime, BunServices } from "@effect/platform-bun";
import {
  Config,
  Effect,
  FileSystem,
  Layer,
  Option,
  Path,
  Schema,
} from "effect";
import { Command, Flag } from "effect/cli";
import { PanelState } from "../src/panel/Panel.js";
import { layer as panel } from "../src/panel/Server.js";
import { layer as demoBridge } from "./panel-demo/bridge.js";
import { demoPanel } from "./panel-demo/fixtures.js";

const encodePanel = Schema.encodeEffect(Schema.fromJsonString(PanelState));

const demo = Command.make(
  "panel-demo",
  {
    port: Flag.Int("port").pipe(
      Flag.withDescription("Port the panel listens on"),
      Flag.withDefault(7320),
    ),
    data: Flag.String("data").pipe(
      Flag.withDescription(
        "Directory for the demo's socket and saved dashboards (default: $TMPDIR/ha-bridge-panel-demo)",
      ),
      Flag.optional,
    ),
    reset: Flag.Boolean("reset").pipe(
      Flag.withDescription("Start again from the demo dashboards"),
      Flag.withDefault(false),
    ),
  },
  (input) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const temporary = yield* Config.String("TMPDIR").pipe(
        Config.withDefault("/tmp"),
      );

      const directory = Option.getOrElse(input.data, () =>
        path.join(temporary, "ha-bridge-panel-demo"),
      );

      const dataPath = path.join(directory, "panel.json");
      const socketPath = path.join(directory, "bridge.sock");

      yield* fs.makeDirectory(directory, { recursive: true });

      if (input.reset || !(yield* fs.exists(dataPath))) {
        yield* fs.writeFileString(dataPath, yield* encodePanel(demoPanel));
      }

      yield* Effect.logInfo(
        `Demo panel on http://127.0.0.1:${input.port}, saving to ${dataPath}`,
      );

      return yield* Layer.launch(
        Layer.merge(
          demoBridge(socketPath),
          panel({
            socketPath,
            hostname: "127.0.0.1",
            port: input.port,
            dataPath,
          }),
        ),
      );
    }),
);

demo.pipe(
  Command.run({ version: "0.0.0" }),
  Effect.provide(BunServices.layer),
  BunRuntime.runMain,
);
