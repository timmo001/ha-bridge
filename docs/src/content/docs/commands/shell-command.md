---
title: ha-bridge shell_command
description: Arguments and flags for every ha-bridge shell_command command.
sidebar:
  label: shell_command
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge shell_command` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge shell_command`

```text
DESCRIPTION
  Shell command actions

USAGE
  ha-bridge shell_command <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge shell_command run`

```text
DESCRIPTION
  Run one

USAGE
  ha-bridge shell_command run [flags] <name>

ARGUMENTS
  name string    Name, without shell_command.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --data string      Data to pass, as a JSON object, such as '{"room":"office"}'
  --response         Wait for the result and print it as JSON
```

## `ha-bridge shell_command reload`

```text
DESCRIPTION
  Reload the shell_command YAML configuration

USAGE
  ha-bridge shell_command reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
