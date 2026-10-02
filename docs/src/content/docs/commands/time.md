---
title: ha-bridge time
description: Arguments and flags for every ha-bridge time command.
sidebar:
  label: time
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge time` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge time`

```text
DESCRIPTION
  Time actions

USAGE
  ha-bridge time <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge time set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge time set-value [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           Time as HH:MM or HH:MM:SS
  entity_id... string    Entity ID, with or without the time. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
