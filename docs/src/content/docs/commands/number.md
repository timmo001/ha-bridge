---
title: ha-bridge number
description: Arguments and flags for every ha-bridge number command.
sidebar:
  label: number
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge number` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge number`

```text
DESCRIPTION
  Number actions

USAGE
  ha-bridge number <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge number set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge number set-value [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           New value
  entity_id... string    Entity ID, with or without the number. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
