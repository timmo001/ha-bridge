---
title: ha-bridge registry
description: Arguments and flags for every ha-bridge registry command.
sidebar:
  label: registry
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge registry` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge registry`

```text
DESCRIPTION
  Read what Home Assistant's registries hold about entities, devices and areas

USAGE
  ha-bridge registry <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge registry get`

Alias: `ha-bridge registry g`

```text
DESCRIPTION
  Print the labels and area of entities, devices and areas, and each entity's device and categories

USAGE
  ha-bridge registry get [flags]

FLAGS
  --entity string    Entity ID, such as automation.morning; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --json             Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
