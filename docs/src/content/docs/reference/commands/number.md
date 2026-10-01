---
title: ha-bridge number
description: Arguments and flags for every ha-bridge number command.
sidebar:
  label: number
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge number` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge number set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the number. prefix
  value string    New value

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
