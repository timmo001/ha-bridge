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
  Print the schedule's week as JSON

USAGE
  ha-bridge schedule get [flags] <name>

ARGUMENTS
  name string    Entity name without the schedule. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
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
