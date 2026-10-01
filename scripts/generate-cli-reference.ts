// Writes the docs command reference from the CLI's own help output, so the
// page always matches the command tree in src/index.ts.
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect, FileSystem, Path } from "effect";
import type { PlatformError } from "effect/PlatformError";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

const outFile = "docs/src/content/docs/reference/commands.md";

interface Subcommand {
  readonly name: string;
  readonly alias: string | undefined;
}

const sections = (help: string) => {
  const result = new Map<string, Array<string>>();
  let current: Array<string> | undefined;

  for (const line of help.split("\n")) {
    if (/^[A-Z][A-Z ]+$/.test(line)) {
      current = [];
      result.set(line, current);
    } else if (current !== undefined && line.trim() !== "") {
      current.push(line);
    }
  }

  return result;
};

const subcommandsOf = (help: string): ReadonlyArray<Subcommand> =>
  (sections(help).get("SUBCOMMANDS") ?? []).flatMap((line) => {
    const [, name, alias] = /^\s+([\w-]+)(?:, ([\w-]+))?\s/.exec(line) ?? [];

    return name === undefined ? [] : [{ name, alias }];
  });

const withoutGlobalFlags = (help: string) =>
  (help.split("\nGLOBAL FLAGS\n")[0] ?? help).trimEnd();

const program = Effect.gen(function* () {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const helpFor = (commandPath: ReadonlyArray<string>) =>
    spawner.string(
      ChildProcess.make("bun", ["src/index.ts", ...commandPath, "--help"]),
    );

  const lines: Array<string> = [
    "---",
    "title: Commands",
    "description: Every ha-bridge command, alias, argument and flag, generated from the CLI's help.",
    "---",
    "",
    "<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->",
    "",
    "Every command and its help, as `ha-bridge <command> --help` prints it. Each command also accepts the global flags listed under [`ha-bridge`](#ha-bridge).",
    "",
  ];

  const render = (
    commandPath: ReadonlyArray<string>,
    alias: string | undefined,
  ): Effect.Effect<void, PlatformError> =>
    Effect.gen(function* () {
      const help = yield* helpFor(commandPath);
      const heading = ["ha-bridge", ...commandPath].join(" ");

      lines.push(`## \`${heading}\``, "");

      if (alias !== undefined) {
        const aliasPath = [...commandPath.slice(0, -1), alias];
        lines.push(`Alias: \`${["ha-bridge", ...aliasPath].join(" ")}\``, "");
      }

      lines.push(
        "```text",
        commandPath.length === 0 ? help.trimEnd() : withoutGlobalFlags(help),
        "```",
        "",
      );

      yield* Effect.forEach(
        subcommandsOf(help),
        (subcommand) =>
          render([...commandPath, subcommand.name], subcommand.alias),
        { discard: true },
      );
    });

  yield* render([], undefined);

  yield* fs.makeDirectory(path.dirname(outFile), { recursive: true });
  yield* fs.writeFileString(outFile, `${lines.join("\n").trimEnd()}\n`);
  yield* Effect.log(`Wrote ${outFile}`);
});

program.pipe(Effect.provide(BunServices.layer), BunRuntime.runMain);
