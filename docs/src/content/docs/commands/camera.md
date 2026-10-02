---
title: ha-bridge camera
description: Arguments and flags for every ha-bridge camera command.
sidebar:
  label: camera
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge camera` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge camera`

```text
DESCRIPTION
  Camera actions

USAGE
  ha-bridge camera <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera snapshot`

```text
DESCRIPTION
  Save the camera's current image

USAGE
  ha-bridge camera snapshot [flags] <output> [<entity_id...>]

ARGUMENTS
  output string          File to write the image to
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera turn-on`

Alias: `ha-bridge camera on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge camera turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera turn-off`

Alias: `ha-bridge camera off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge camera turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera enable-motion-detection`

```text
DESCRIPTION
  Enable motion detection

USAGE
  ha-bridge camera enable-motion-detection [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera disable-motion-detection`

```text
DESCRIPTION
  Disable motion detection

USAGE
  ha-bridge camera disable-motion-detection [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera server-snapshot`

```text
DESCRIPTION
  Save the camera's current image on the Home Assistant host

USAGE
  ha-bridge camera server-snapshot [flags] <filename> [<entity_id...>]

ARGUMENTS
  filename string        Path on the Home Assistant host, in allowlist_external_dirs
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge camera record`

```text
DESCRIPTION
  Record the camera's stream on the Home Assistant host

USAGE
  ha-bridge camera record [flags] <filename> [<entity_id...>]

ARGUMENTS
  filename string        Path on the Home Assistant host, in allowlist_external_dirs
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --duration integer    Seconds to record (default: 30)
  --lookback integer    Seconds from before the call to include (default: 0)
  --entity string       Entity ID or name; repeat for more
  --device string       Device ID or name; repeat for more
  --area string         Area ID or name; repeat for more
  --floor string        Floor ID or name; repeat for more
  --label string        Label ID or name; repeat for more
```

## `ha-bridge camera play-stream`

```text
DESCRIPTION
  Play the camera's stream on a media player

USAGE
  ha-bridge camera play-stream [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the camera. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --media-player string    Media player to play the stream on: entity ID, object ID or name
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```
