import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect } from "effect";
import { Command } from "effect/cli";
import packageJson from "../package.json" with { type: "json" };

const haBridge = Command.make("ha-bridge").pipe(
  Command.withDescription(
    "One shared Home Assistant connection for your machine, served to local apps over a single socket",
  ),
);

haBridge.pipe(
  Command.run({ version: packageJson.version }),
  Effect.provide(BunServices.layer),
  BunRuntime.runMain,
);
