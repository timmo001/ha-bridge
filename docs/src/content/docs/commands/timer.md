---
title: ha-bridge timer
description: Arguments and flags for every ha-bridge timer command.
sidebar:
  label: timer
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge timer` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge timer`

```text
DESCRIPTION
  Timer actions

USAGE
  ha-bridge timer <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer start`

```text
DESCRIPTION
  Start or restart the timer

USAGE
  ha-bridge timer start [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the timer. prefix; repeat for more (optional)

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --duration string    Seconds or HH:MM:SS (default: the timer's own duration)
  --entity string      Entity ID or name; repeat for more
  --device string      Device ID or name; repeat for more
  --area string        Area ID or name; repeat for more
  --floor string       Floor ID or name; repeat for more
  --label string       Label ID or name; repeat for more
```

## `ha-bridge timer pause`

```text
DESCRIPTION
  Pause the timer

USAGE
  ha-bridge timer pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the timer. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge timer cancel`

```text
DESCRIPTION
  Cancel the timer

USAGE
  ha-bridge timer cancel [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the timer. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge timer finish`

```text
DESCRIPTION
  Finish the timer now

USAGE
  ha-bridge timer finish [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the timer. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge timer change`

```text
DESCRIPTION
  Add time to a running timer

USAGE
  ha-bridge timer change [flags] <duration> [<entity_id...>]

ARGUMENTS
  duration string        Seconds or HH:MM:SS to add; negative to take away, after --
  entity_id... string    Entity ID, with or without the timer. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge timer reload`

```text
DESCRIPTION
  Reload timer helpers from YAML

USAGE
  ha-bridge timer reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
