---
title: ha-bridge derivative
description: Arguments and flags for every ha-bridge derivative command.
sidebar:
  label: derivative
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge derivative` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge derivative`

```text
DESCRIPTION
  Derivative sensor actions

USAGE
  ha-bridge derivative <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge derivative reload`

```text
DESCRIPTION
  Reload the derivative YAML configuration

USAGE
  ha-bridge derivative reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
