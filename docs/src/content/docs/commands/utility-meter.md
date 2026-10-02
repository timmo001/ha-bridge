---
title: ha-bridge utility_meter
description: Arguments and flags for every ha-bridge utility_meter command.
sidebar:
  label: utility_meter
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge utility_meter` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge utility_meter`

```text
DESCRIPTION
  Utility meter actions

USAGE
  ha-bridge utility_meter <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge utility_meter reset`

```text
DESCRIPTION
  Reset the meters behind tariff selects, such as select.energy

USAGE
  ha-bridge utility_meter reset [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge utility_meter calibrate`

```text
DESCRIPTION
  Set a meter sensor's reading

USAGE
  ha-bridge utility_meter calibrate [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           New meter reading
  entity_id... string    Entity ID, with or without the sensor. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
