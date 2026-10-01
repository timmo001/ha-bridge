---
title: ha-bridge watch
description: Arguments and flags for every ha-bridge watch command.
sidebar:
  label: watch
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge watch` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge watch`

Alias: `ha-bridge w`

```text
DESCRIPTION
  Watch entities through the bridge

USAGE
  ha-bridge watch <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge watch entity`

Alias: `ha-bridge watch e`

```text
DESCRIPTION
  Print an entity's state now and on every change

USAGE
  ha-bridge watch entity [flags] <entity_id>

ARGUMENTS
  entity_id string    Entity to watch, for example light.office

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --bar-json              Print one bar JSON object per state
  --icon string           Text to show instead of the state
  --text-on string        Text appended when the entity is on
  --text-off string       Text appended when the entity is off
  --tooltip-on string     Tooltip when the entity is on
  --tooltip-off string    Tooltip when the entity is off
  --class-on string       Class when the entity is on
  --class-off string      Class when the entity is off
```
