---
title: Commands
description: Every Home Assistant Bridge command, alias, argument and flag, generated from the CLI's help.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Each command has its own page with its help, as `ha-bridge <command> --help` prints it.

| Command | Alias |
| --- | --- |
| [`serve`](/reference/commands/serve/) | None |
| [`setup`](/reference/commands/setup/) | None |
| [`watch`](/reference/commands/watch/) | `w` |
| [`assist_satellite`](/reference/commands/assist-satellite/) | `as` |
| [`input_boolean`](/reference/commands/input-boolean/) | `ib` |
| [`input_number`](/reference/commands/input-number/) | `in` |
| [`light`](/reference/commands/light/) | `l` |
| [`switch`](/reference/commands/switch/) | `s` |
| [`cover`](/reference/commands/cover/) | `c` |
| [`climate`](/reference/commands/climate/) | `cl` |
| [`camera`](/reference/commands/camera/) | None |

## Global flags

```text
DESCRIPTION
  One shared Home Assistant connection for your machine, served to local apps over a single socket

USAGE
  ha-bridge <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)

GLOBAL FLAGS
  --help, -h                                                          Show help information
  --version, -v                                                       Show version information
  --wizard                                                            Start wizard mode for a command
  --completions <bash|zsh|fish|sh>                                    Print shell completion script (choices: bash, zsh, fish, sh)
  --log-level <all|trace|debug|info|warn|warning|error|fatal|none>    Sets the minimum log level (choices: all, trace, debug, info, warn, warning, error, fatal, none)

SUBCOMMANDS
  serve               Hold the shared Home Assistant connection and serve it on the bridge socket
  setup               Set the Home Assistant URL and access token
  watch, w            Watch entities through the bridge
  assist_satellite, as Assist satellite actions
  input_boolean, ib   Input boolean actions
  input_number, in    Input number actions
  light, l            Light actions
  switch, s           Switch actions
  cover, c            Cover actions
  climate, cl         Climate actions
  camera              Camera actions
```
