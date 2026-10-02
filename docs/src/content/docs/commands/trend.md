---
title: ha-bridge trend
description: Arguments and flags for every ha-bridge trend command.
sidebar:
  label: trend
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge trend` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge trend`

```text
DESCRIPTION
  Trend sensor actions

USAGE
  ha-bridge trend <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge trend reload`

```text
DESCRIPTION
  Reload the trend YAML configuration

USAGE
  ha-bridge trend reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
