---
title: ha-bridge cloud
description: Arguments and flags for every ha-bridge cloud command.
sidebar:
  label: cloud
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge cloud` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge cloud`

```text
DESCRIPTION
  Home Assistant Cloud actions

USAGE
  ha-bridge cloud <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cloud remote-connect`

```text
DESCRIPTION
  Turn on remote access through the cloud

USAGE
  ha-bridge cloud remote-connect [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cloud remote-disconnect`

```text
DESCRIPTION
  Turn off remote access through the cloud

USAGE
  ha-bridge cloud remote-disconnect [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
