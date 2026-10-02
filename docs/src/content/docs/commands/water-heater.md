---
title: ha-bridge water_heater
description: Arguments and flags for every ha-bridge water_heater command.
sidebar:
  label: water_heater
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge water_heater` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge water_heater`

```text
DESCRIPTION
  Water heater actions

USAGE
  ha-bridge water_heater <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge water_heater turn-on`

Alias: `ha-bridge water_heater on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge water_heater turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the water_heater. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge water_heater turn-off`

Alias: `ha-bridge water_heater off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge water_heater turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the water_heater. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge water_heater temperature`

```text
DESCRIPTION
  Set the target temperature

USAGE
  ha-bridge water_heater temperature [flags] <temperature> [<entity_id...>]

ARGUMENTS
  temperature string     Target temperature in the entity's unit
  entity_id... string    Entity ID, with or without the water_heater. prefix; repeat for more (optional)

FLAGS
  --socket string            Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --operation-mode string    Also switch to this operation mode
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
```

## `ha-bridge water_heater operation-mode`

```text
DESCRIPTION
  Set the operation mode

USAGE
  ha-bridge water_heater operation-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            One of the entity's operation_list
  entity_id... string    Entity ID, with or without the water_heater. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge water_heater away-mode`

```text
DESCRIPTION
  Turn away mode on or off

USAGE
  ha-bridge water_heater away-mode [flags] <state> [<entity_id...>]

ARGUMENTS
  state string           on or off
  entity_id... string    Entity ID, with or without the water_heater. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
