---
title: ha-bridge fan
description: Arguments and flags for every ha-bridge fan command.
sidebar:
  label: fan
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge fan` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge fan`

```text
DESCRIPTION
  Fan actions

USAGE
  ha-bridge fan <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan turn-on`

Alias: `ha-bridge fan on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge fan turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the fan. prefix

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --percentage integer    Speed from 0 to 100
  --preset-mode string    Preset mode, one of the fan's preset_modes
```

## `ha-bridge fan turn-off`

Alias: `ha-bridge fan off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge fan turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the fan. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan toggle`

Alias: `ha-bridge fan t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge fan toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the fan. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan percentage`

```text
DESCRIPTION
  Set the speed

USAGE
  ha-bridge fan percentage [flags] <name> <percentage>

ARGUMENTS
  name string          Entity name without the fan. prefix
  percentage string    Speed from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan increase-speed`

```text
DESCRIPTION
  Speed up by a step

USAGE
  ha-bridge fan increase-speed [flags] <name>

ARGUMENTS
  name string    Entity name without the fan. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --step integer     Percent to change by (default: the fan's own step)
```

## `ha-bridge fan decrease-speed`

```text
DESCRIPTION
  Slow down by a step

USAGE
  ha-bridge fan decrease-speed [flags] <name>

ARGUMENTS
  name string    Entity name without the fan. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --step integer     Percent to change by (default: the fan's own step)
```

## `ha-bridge fan preset-mode`

```text
DESCRIPTION
  Set the preset mode

USAGE
  ha-bridge fan preset-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the fan. prefix
  mode string    One of the fan's preset_modes

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan oscillate`

```text
DESCRIPTION
  Turn oscillation on or off

USAGE
  ha-bridge fan oscillate [flags] <name> <state>

ARGUMENTS
  name string     Entity name without the fan. prefix
  state string    on or off

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge fan direction`

```text
DESCRIPTION
  Set the direction

USAGE
  ha-bridge fan direction [flags] <name> <direction>

ARGUMENTS
  name string         Entity name without the fan. prefix
  direction string    forward or reverse

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
