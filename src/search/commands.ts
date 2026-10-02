import type { Command } from "effect/cli";
import type { SearchKey } from "./Search.js";

export interface CommandItem {
  // Full command, such as "light turn-on".
  readonly path: string;
  // The same command with aliases, such as "l on".
  readonly aliasPath: string | undefined;
  readonly description: string;
  // Description of the command it belongs to, such as "Light actions".
  readonly group: string | undefined;
}

// Lists every runnable leaf command under the given commands.
export const commandItems = (
  commands: ReadonlyArray<Command.Command.Any>,
): Array<CommandItem> => {
  const walk = (
    command: Command.Command.Any,
    path: ReadonlyArray<string>,
    aliasPath: ReadonlyArray<string>,
    group: string | undefined,
  ): Array<CommandItem> => {
    const nextPath = [...path, command.name];
    const nextAliasPath = [...aliasPath, command.alias ?? command.name];

    const children = command.subcommands
      .flatMap((entry) => entry.commands)
      .filter((child) => !child.unlisted);

    if (children.length > 0) {
      return children.flatMap((child) =>
        walk(child, nextPath, nextAliasPath, command.description),
      );
    }

    const fullPath = nextPath.join(" ");
    const fullAliasPath = nextAliasPath.join(" ");

    return [
      {
        path: fullPath,
        aliasPath: fullAliasPath === fullPath ? undefined : fullAliasPath,
        description: command.description ?? "",
        group,
      },
    ];
  };

  return commands
    .filter((command) => !command.unlisted)
    .flatMap((command) => walk(command, [], [], undefined));
};

export const commandKeys: ReadonlyArray<SearchKey<CommandItem>> = [
  { name: "command", weight: 10, getFn: (item) => item.path },
  { name: "alias", weight: 6, getFn: (item) => item.aliasPath },
  { name: "description", weight: 6, getFn: (item) => item.description },
  { name: "group", weight: 4, getFn: (item) => item.group },
];

export interface CommandMatch {
  readonly kind: "command";
  // Full command, such as "light turn-on".
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly matched: ReadonlyArray<string>;
  readonly description: string;
  readonly alias: string | undefined;
}

export const toCommandMatch = (
  item: CommandItem,
  score: number,
  matched: ReadonlyArray<string>,
): CommandMatch => ({
  kind: "command",
  id: item.path,
  name: item.path,
  score,
  matched,
  description: item.description,
  alias: item.aliasPath,
});
