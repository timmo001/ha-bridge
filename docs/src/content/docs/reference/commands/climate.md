---
title: ha-bridge climate
description: Arguments and flags for every ha-bridge climate command.
sidebar:
  label: climate
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge climate` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge climate`

Alias: `ha-bridge cl`

```text
DESCRIPTION
  Climate actions

USAGE
  ha-bridge climate <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate watch`

Alias: `ha-bridge climate w`

```text
DESCRIPTION
  Print bar JSON now and on every change

USAGE
  ha-bridge climate watch [flags] <name>

ARGUMENTS
  name string    Entity name without the climate. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate turn-on`

Alias: `ha-bridge climate on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge climate turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the climate. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate turn-off`

Alias: `ha-bridge climate off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge climate turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the climate. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate toggle`

Alias: `ha-bridge climate t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge climate toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the climate. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate hvac-mode`

```text
DESCRIPTION
  Set the HVAC mode

USAGE
  ha-bridge climate hvac-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode choice    HVAC mode

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate temperature`

```text
DESCRIPTION
  Set the target temperature, or a range with --target-temp-low and --target-temp-high

USAGE
  ha-bridge climate temperature [flags] <name> [<temperature>]

ARGUMENTS
  name string           Entity name without the climate. prefix
  temperature number    Target temperature (optional)

FLAGS
  --socket string              Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --target-temp-low number     Lower target temperature, set with --target-temp-high
  --target-temp-high number    Upper target temperature, set with --target-temp-low
  --hvac-mode choice           HVAC mode to switch to (choices: off, heat, cool, heat_cool, auto, dry, fan_only)
```

## `ha-bridge climate humidity`

```text
DESCRIPTION
  Set the target humidity

USAGE
  ha-bridge climate humidity [flags] <name> <humidity>

ARGUMENTS
  name string         Entity name without the climate. prefix
  humidity integer    Target humidity in percent

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate preset-mode`

```text
DESCRIPTION
  Set the preset mode

USAGE
  ha-bridge climate preset-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode string    Preset mode, for example away

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate fan-mode`

```text
DESCRIPTION
  Set the fan mode

USAGE
  ha-bridge climate fan-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode string    Fan mode, for example 1 or auto

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate swing-mode`

```text
DESCRIPTION
  Set the swing mode

USAGE
  ha-bridge climate swing-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode string    Swing mode, for example on

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate swing-horizontal-mode`

```text
DESCRIPTION
  Set the horizontal swing mode

USAGE
  ha-bridge climate swing-horizontal-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode string    Horizontal swing mode, for example on

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
