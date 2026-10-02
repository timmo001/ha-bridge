---
title: ha-bridge schedule
description: Arguments and flags for every ha-bridge schedule command.
sidebar:
  label: schedule
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge schedule` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge schedule`

```text
DESCRIPTION
  Schedule actions

USAGE
  ha-bridge schedule <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge schedule get`

```text
DESCRIPTION
  Print each schedule's week as JSON, keyed by entity ID

USAGE
  ha-bridge schedule get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the schedule. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge schedule reload`

```text
DESCRIPTION
  Reload schedule helpers from YAML

USAGE
  ha-bridge schedule reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
