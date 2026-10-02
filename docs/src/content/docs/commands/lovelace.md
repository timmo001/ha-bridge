---
title: ha-bridge lovelace
description: Arguments and flags for every ha-bridge lovelace command.
sidebar:
  label: lovelace
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge lovelace` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge lovelace`

```text
DESCRIPTION
  Dashboard actions

USAGE
  ha-bridge lovelace <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lovelace reload-resources`

```text
DESCRIPTION
  Reload dashboard resources from YAML

USAGE
  ha-bridge lovelace reload-resources [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
