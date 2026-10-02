---
title: ha-bridge statistics
description: Arguments and flags for every ha-bridge statistics command.
sidebar:
  label: statistics
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge statistics` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge statistics`

```text
DESCRIPTION
  Statistics sensor actions

USAGE
  ha-bridge statistics <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge statistics reload`

```text
DESCRIPTION
  Reload the statistics YAML configuration

USAGE
  ha-bridge statistics reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
