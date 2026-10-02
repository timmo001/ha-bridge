---
title: ha-bridge history_stats
description: Arguments and flags for every ha-bridge history_stats command.
sidebar:
  label: history_stats
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge history_stats` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge history_stats`

```text
DESCRIPTION
  History stats actions

USAGE
  ha-bridge history_stats <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge history_stats reload`

```text
DESCRIPTION
  Reload the history_stats YAML configuration

USAGE
  ha-bridge history_stats reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
