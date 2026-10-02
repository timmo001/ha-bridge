---
title: ha-bridge ffmpeg
description: Arguments and flags for every ha-bridge ffmpeg command.
sidebar:
  label: ffmpeg
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge ffmpeg` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge ffmpeg`

```text
DESCRIPTION
  FFmpeg sensor actions

USAGE
  ha-bridge ffmpeg <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge ffmpeg start`

```text
DESCRIPTION
  Start FFmpeg sensors; without a target, every one

USAGE
  ha-bridge ffmpeg start [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the binary_sensor. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge ffmpeg stop`

```text
DESCRIPTION
  Stop FFmpeg sensors; without a target, every one

USAGE
  ha-bridge ffmpeg stop [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the binary_sensor. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge ffmpeg restart`

```text
DESCRIPTION
  Restart FFmpeg sensors; without a target, every one

USAGE
  ha-bridge ffmpeg restart [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the binary_sensor. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
