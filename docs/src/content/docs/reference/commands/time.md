---
title: ha-bridge time
description: Arguments and flags for every ha-bridge time command.
sidebar:
  label: time
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge time` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge time set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the time. prefix
  value string    Time as HH:MM or HH:MM:SS

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
