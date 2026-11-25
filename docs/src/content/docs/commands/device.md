---
title: ha-bridge device
description: Arguments and flags for every ha-bridge device command.
sidebar:
  label: device
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge device` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge device`

```text
DESCRIPTION
  Device registry changes. They need an admin token

USAGE
  ha-bridge device <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge device set-area`

```text
DESCRIPTION
  Move devices to an area. Their entities without an area of their own follow. --json prints each device afterwards

USAGE
  ha-bridge device set-area [flags] <area> <device...>

ARGUMENTS
  area string         Area ID or name
  device... string    Device ID or name; repeat for more

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge device clear-area`

```text
DESCRIPTION
  Take devices out of their area. --json prints each device afterwards

USAGE
  ha-bridge device clear-area [flags] <device...>

ARGUMENTS
  device... string    Device ID or name; repeat for more

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
