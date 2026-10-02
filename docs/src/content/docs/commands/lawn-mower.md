---
title: ha-bridge lawn_mower
description: Arguments and flags for every ha-bridge lawn_mower command.
sidebar:
  label: lawn_mower
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge lawn_mower` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge lawn_mower`

```text
DESCRIPTION
  Lawn mower actions

USAGE
  ha-bridge lawn_mower <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lawn_mower start`

```text
DESCRIPTION
  Start mowing

USAGE
  ha-bridge lawn_mower start [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the lawn_mower. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge lawn_mower pause`

```text
DESCRIPTION
  Pause mowing

USAGE
  ha-bridge lawn_mower pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the lawn_mower. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge lawn_mower stop`

```text
DESCRIPTION
  Stop mowing

USAGE
  ha-bridge lawn_mower stop [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the lawn_mower. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge lawn_mower dock`

```text
DESCRIPTION
  Go back to the dock

USAGE
  ha-bridge lawn_mower dock [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the lawn_mower. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
