---
title: ha-bridge humidifier
description: Arguments and flags for every ha-bridge humidifier command.
sidebar:
  label: humidifier
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge humidifier` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge humidifier`

```text
DESCRIPTION
  Humidifier actions

USAGE
  ha-bridge humidifier <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge humidifier turn-on`

Alias: `ha-bridge humidifier on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge humidifier turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the humidifier. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge humidifier turn-off`

Alias: `ha-bridge humidifier off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge humidifier turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the humidifier. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge humidifier toggle`

Alias: `ha-bridge humidifier t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge humidifier toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the humidifier. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge humidifier mode`

```text
DESCRIPTION
  Set the mode

USAGE
  ha-bridge humidifier mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the humidifier. prefix
  mode string    One of the humidifier's available_modes

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge humidifier humidity`

```text
DESCRIPTION
  Set the target humidity

USAGE
  ha-bridge humidifier humidity [flags] <name> <humidity>

ARGUMENTS
  name string        Entity name without the humidifier. prefix
  humidity string    Target humidity from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
