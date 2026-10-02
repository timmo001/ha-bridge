---
title: ha-bridge filter
description: Arguments and flags for every ha-bridge filter command.
sidebar:
  label: filter
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge filter` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge filter`

```text
DESCRIPTION
  Filter sensor actions

USAGE
  ha-bridge filter <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge filter reload`

```text
DESCRIPTION
  Reload the filter YAML configuration

USAGE
  ha-bridge filter reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
