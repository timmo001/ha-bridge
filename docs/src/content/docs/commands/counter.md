---
title: ha-bridge counter
description: Arguments and flags for every ha-bridge counter command.
sidebar:
  label: counter
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge counter` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge counter`

```text
DESCRIPTION
  Counter actions

USAGE
  ha-bridge counter <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge counter increment`

```text
DESCRIPTION
  Raise the count by one step

USAGE
  ha-bridge counter increment [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the counter. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge counter decrement`

```text
DESCRIPTION
  Lower the count by one step

USAGE
  ha-bridge counter decrement [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the counter. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge counter reset`

```text
DESCRIPTION
  Reset to the initial value

USAGE
  ha-bridge counter reset [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the counter. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge counter set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge counter set-value [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           New count
  entity_id... string    Entity ID, with or without the counter. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
