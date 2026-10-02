---
title: ha-bridge trigger
description: Arguments and flags for every ha-bridge trigger command.
sidebar:
  label: trigger
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge trigger` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge trigger`

```text
DESCRIPTION
  Listen for automation triggers

USAGE
  ha-bridge trigger <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge trigger watch`

Alias: `ha-bridge trigger w`

```text
DESCRIPTION
  Print each firing as a line of JSON, with its variables and context. Needs an admin token

USAGE
  ha-bridge trigger watch [flags] <trigger>

ARGUMENTS
  trigger string    Trigger config as YAML or JSON, such as '{trigger: state, entity_id: sun.sun}'

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Variables as a JSON object, such as '{"room":"office"}'
```
