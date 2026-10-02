---
title: ha-bridge fan
description: Arguments and flags for every ha-bridge fan command.
sidebar:
  label: fan
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge fan` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
  ha-bridge fan turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --percentage integer    Speed from 0 to 100
  --preset-mode string    Preset mode, one of the fan's preset_modes
  --entity string         Entity ID or name; repeat for more
  --device string         Device ID or name; repeat for more
  --area string           Area ID or name; repeat for more
  --floor string          Floor ID or name; repeat for more
  --label string          Label ID or name; repeat for more
```

## `ha-bridge fan turn-off`

Alias: `ha-bridge fan off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge fan turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan toggle`

Alias: `ha-bridge fan t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge fan toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan percentage`

```text
DESCRIPTION
  Set the speed

USAGE
  ha-bridge fan percentage [flags] <percentage> [<entity_id...>]

ARGUMENTS
  percentage string      Speed from 0 to 100
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan increase-speed`

```text
DESCRIPTION
  Speed up by a step

USAGE
  ha-bridge fan increase-speed [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --step integer     Percent to change by (default: the fan's own step)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan decrease-speed`

```text
DESCRIPTION
  Slow down by a step

USAGE
  ha-bridge fan decrease-speed [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --step integer     Percent to change by (default: the fan's own step)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan preset-mode`

```text
DESCRIPTION
  Set the preset mode

USAGE
  ha-bridge fan preset-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            One of the fan's preset_modes
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan oscillate`

```text
DESCRIPTION
  Turn oscillation on or off

USAGE
  ha-bridge fan oscillate [flags] <state> [<entity_id...>]

ARGUMENTS
  state string           on or off
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge fan direction`

```text
DESCRIPTION
  Set the direction

USAGE
  ha-bridge fan direction [flags] <direction> [<entity_id...>]

ARGUMENTS
  direction string       forward or reverse
  entity_id... string    Entity ID, with or without the fan. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
