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
  ha-bridge date set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the date. prefix
  value string    Date as YYYY-MM-DD

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
