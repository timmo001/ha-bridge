---
title: ha-bridge zone
description: Arguments and flags for every ha-bridge zone command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge zone` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge zone`

```text
DESCRIPTION
  Zone actions

USAGE
  ha-bridge zone <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge zone reload`

```text
DESCRIPTION
  Reload zone helpers from YAML

USAGE
  ha-bridge zone reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
