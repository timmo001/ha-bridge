---
title: ha-bridge device_tracker
description: Arguments and flags for every ha-bridge device_tracker command.
sidebar:
  label: device_tracker
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge device_tracker` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge device_tracker`

```text
DESCRIPTION
  Device tracker actions

USAGE
  ha-bridge device_tracker <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge device_tracker see`

```text
DESCRIPTION
  Report a legacy tracker's location

USAGE
  ha-bridge device_tracker see [flags]

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --mac string              Device MAC address
  --dev-id string           Device ID
  --host-name string        Host name
  --location-name string    Zone name, home or not_home
  --latitude number         GPS latitude
  --longitude number        GPS longitude
  --gps-accuracy integer    GPS accuracy in metres
  --battery integer         Battery percentage
```
