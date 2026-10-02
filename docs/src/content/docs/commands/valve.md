---
title: ha-bridge valve
description: Arguments and flags for every ha-bridge valve command.
sidebar:
  label: valve
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge valve` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge valve`

```text
DESCRIPTION
  Valve actions

USAGE
  ha-bridge valve <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve open`

```text
DESCRIPTION
  Open the valve

USAGE
  ha-bridge valve open [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the valve. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge valve close`

```text
DESCRIPTION
  Close the valve

USAGE
  ha-bridge valve close [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the valve. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge valve toggle`

```text
DESCRIPTION
  Open or close the valve

USAGE
  ha-bridge valve toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the valve. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge valve stop`

```text
DESCRIPTION
  Stop the valve

USAGE
  ha-bridge valve stop [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the valve. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge valve position`

```text
DESCRIPTION
  Set the position

USAGE
  ha-bridge valve position [flags] <position> [<entity_id...>]

ARGUMENTS
  position string        Position from 0 to 100
  entity_id... string    Entity ID, with or without the valve. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
