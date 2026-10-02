---
title: ha-bridge date
description: Arguments and flags for every ha-bridge date command.
sidebar:
  label: date
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge date` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge date`

```text
DESCRIPTION
  Date actions

USAGE
  ha-bridge date <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge date set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge date set-value [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           Date as YYYY-MM-DD
  entity_id... string    Entity ID, with or without the date. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
