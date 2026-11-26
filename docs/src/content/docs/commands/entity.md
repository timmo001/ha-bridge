---
title: ha-bridge entity
description: Arguments and flags for every ha-bridge entity command.
sidebar:
  label: entity
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge entity` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge entity`

```text
DESCRIPTION
  Entity registry changes, for device entities, automations, scripts and helpers alike. They need an admin token

USAGE
  ha-bridge entity <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge entity set-area`

```text
DESCRIPTION
  Give entities an area of their own, overriding their device's. --json prints each entity afterwards

USAGE
  ha-bridge entity set-area [flags] <area> <entity_id...>

ARGUMENTS
  area string            Area ID or name
  entity_id... string    Entity ID, such as automation.morning; repeat for more

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge entity clear-area`

```text
DESCRIPTION
  Clear entities' own area, so each follows its device's again. --json prints each entity afterwards

USAGE
  ha-bridge entity clear-area [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Entity ID, such as automation.morning; repeat for more

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
