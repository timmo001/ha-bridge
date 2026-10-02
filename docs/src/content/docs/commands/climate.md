---
title: ha-bridge climate
description: Arguments and flags for every ha-bridge climate command.
sidebar:
  label: climate
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge climate` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
  ha-bridge climate watch [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate turn-on`

Alias: `ha-bridge climate on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge climate turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate turn-off`

Alias: `ha-bridge climate off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge climate turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate toggle`

Alias: `ha-bridge climate t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge climate toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate hvac-mode`

```text
DESCRIPTION
  Set the HVAC mode

USAGE
  ha-bridge climate hvac-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode choice            HVAC mode
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate temperature`

```text
DESCRIPTION
  Set the target temperature with --temperature, or a range with --target-temp-low and --target-temp-high

USAGE
  ha-bridge climate temperature [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string              Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --temperature number         Target temperature, or set a range instead
  --target-temp-low number     Lower target temperature, set with --target-temp-high
  --target-temp-high number    Upper target temperature, set with --target-temp-low
  --hvac-mode choice           HVAC mode to switch to (choices: off, heat, cool, heat_cool, auto, dry, fan_only)
  --entity string              Entity ID or name; repeat for more
  --device string              Device ID or name; repeat for more
  --area string                Area ID or name; repeat for more
  --floor string               Floor ID or name; repeat for more
  --label string               Label ID or name; repeat for more
```

## `ha-bridge climate humidity`

```text
DESCRIPTION
  Set the target humidity

USAGE
  ha-bridge climate humidity [flags] <humidity> [<entity_id...>]

ARGUMENTS
  humidity integer       Target humidity in percent
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate preset-mode`

```text
DESCRIPTION
  Set the preset mode

USAGE
  ha-bridge climate preset-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            Preset mode, for example away
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate fan-mode`

```text
DESCRIPTION
  Set the fan mode

USAGE
  ha-bridge climate fan-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            Fan mode, for example 1 or auto
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate swing-mode`

```text
DESCRIPTION
  Set the swing mode

USAGE
  ha-bridge climate swing-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            Swing mode, for example on
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge climate swing-horizontal-mode`

```text
DESCRIPTION
  Set the horizontal swing mode

USAGE
  ha-bridge climate swing-horizontal-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            Horizontal swing mode, for example on
  entity_id... string    Entity ID, with or without the climate. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
