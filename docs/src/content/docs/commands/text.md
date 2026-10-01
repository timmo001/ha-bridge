---
title: ha-bridge text
description: Arguments and flags for every ha-bridge text command.
sidebar:
  label: text
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge text` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge text`

```text
DESCRIPTION
  Text actions

USAGE
  ha-bridge text <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge text set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge text set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the text. prefix
  value string    New text

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
