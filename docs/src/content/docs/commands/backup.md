---
title: ha-bridge backup
description: Arguments and flags for every ha-bridge backup command.
sidebar:
  label: backup
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge backup` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge backup`

```text
DESCRIPTION
  Backup actions

USAGE
  ha-bridge backup <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge backup create`

```text
DESCRIPTION
  Back up to the default location, without the Supervisor

USAGE
  ha-bridge backup create [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge backup create-automatic`

```text
DESCRIPTION
  Back up with the automatic backup settings

USAGE
  ha-bridge backup create-automatic [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
