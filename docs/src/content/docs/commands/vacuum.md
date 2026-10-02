---
title: ha-bridge vacuum
description: Arguments and flags for every ha-bridge vacuum command.
sidebar:
  label: vacuum
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge vacuum` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge vacuum`

```text
DESCRIPTION
  Vacuum actions

USAGE
  ha-bridge vacuum <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum start`

```text
DESCRIPTION
  Start cleaning

USAGE
  ha-bridge vacuum start [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum pause`

```text
DESCRIPTION
  Pause cleaning

USAGE
  ha-bridge vacuum pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum start-pause`

```text
DESCRIPTION
  Start or pause cleaning

USAGE
  ha-bridge vacuum start-pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum stop`

```text
DESCRIPTION
  Stop cleaning

USAGE
  ha-bridge vacuum stop [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum return-to-base`

```text
DESCRIPTION
  Go back to the dock

USAGE
  ha-bridge vacuum return-to-base [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum locate`

```text
DESCRIPTION
  Make the vacuum sound so you can find it

USAGE
  ha-bridge vacuum locate [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum clean-spot`

```text
DESCRIPTION
  Clean the spot it's on

USAGE
  ha-bridge vacuum clean-spot [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum clean-area`

```text
DESCRIPTION
  Clean areas

USAGE
  ha-bridge vacuum clean-area [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --clean-area string    Area ID to clean; repeat for more
  --entity string        Entity ID or name; repeat for more
  --device string        Device ID or name; repeat for more
  --area string          Area ID or name; repeat for more
  --floor string         Floor ID or name; repeat for more
  --label string         Label ID or name; repeat for more
```

## `ha-bridge vacuum fan-speed`

```text
DESCRIPTION
  Set the fan speed

USAGE
  ha-bridge vacuum fan-speed [flags] <speed> [<entity_id...>]

ARGUMENTS
  speed string           One of the vacuum's fan_speed_list
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge vacuum send-command`

```text
DESCRIPTION
  Send a raw command

USAGE
  ha-bridge vacuum send-command [flags] <command> [<entity_id...>]

ARGUMENTS
  command string         Command the integration understands
  entity_id... string    Entity ID, with or without the vacuum. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --params string    Parameters as JSON, such as {"speed":2}
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
