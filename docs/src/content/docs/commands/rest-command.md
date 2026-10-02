---
title: ha-bridge rest_command
description: Arguments and flags for every ha-bridge rest_command command.
sidebar:
  label: rest_command
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge rest_command` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge rest_command`

```text
DESCRIPTION
  REST command actions

USAGE
  ha-bridge rest_command <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge rest_command run`

```text
DESCRIPTION
  Run one

USAGE
  ha-bridge rest_command run [flags] <name>

ARGUMENTS
  name string    Name, without rest_command.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --data string      Data to pass, as a JSON object, such as '{"room":"office"}'
  --response         Wait for the result and print it as JSON
```

## `ha-bridge rest_command reload`

```text
DESCRIPTION
  Reload the rest_command YAML configuration

USAGE
  ha-bridge rest_command reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
