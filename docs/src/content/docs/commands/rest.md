---
title: ha-bridge rest
description: Arguments and flags for every ha-bridge rest command.
sidebar:
  label: rest
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge rest` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge rest`

```text
DESCRIPTION
  RESTful actions

USAGE
  ha-bridge rest <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge rest reload`

```text
DESCRIPTION
  Reload the rest YAML configuration

USAGE
  ha-bridge rest reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
