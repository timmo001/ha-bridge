---
title: ha-bridge timer
description: Arguments and flags for every ha-bridge timer command.
sidebar:
  label: timer
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge timer` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

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
  ha-bridge timer start [flags] <name> [<duration>]

ARGUMENTS
  name string        Entity name without the timer. prefix
  duration string    Seconds or HH:MM:SS (default: the timer's own duration) (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer pause`

```text
DESCRIPTION
  Pause the timer

USAGE
  ha-bridge timer pause [flags] <name>

ARGUMENTS
  name string    Entity name without the timer. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer cancel`

```text
DESCRIPTION
  Cancel the timer

USAGE
  ha-bridge timer cancel [flags] <name>

ARGUMENTS
  name string    Entity name without the timer. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer finish`

```text
DESCRIPTION
  Finish the timer now

USAGE
  ha-bridge timer finish [flags] <name>

ARGUMENTS
  name string    Entity name without the timer. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer change`

```text
DESCRIPTION
  Add time to a running timer

USAGE
  ha-bridge timer change [flags] <name> <duration>

ARGUMENTS
  name string        Entity name without the timer. prefix
  duration string    Seconds or HH:MM:SS to add; negative to take away, after --

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
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
