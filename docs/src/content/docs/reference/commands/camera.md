---
title: ha-bridge camera
description: Arguments and flags for every ha-bridge camera command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge camera` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge camera snapshot [flags] <name> <output>

ARGUMENTS
  name string      Entity name without the camera. prefix
  output string    File to write the image to

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera turn-on`

Alias: `ha-bridge camera on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge camera turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the camera. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera turn-off`

Alias: `ha-bridge camera off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge camera turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the camera. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera enable-motion-detection`

```text
DESCRIPTION
  Enable motion detection

USAGE
  ha-bridge camera enable-motion-detection [flags] <name>

ARGUMENTS
  name string    Entity name without the camera. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera disable-motion-detection`

```text
DESCRIPTION
  Disable motion detection

USAGE
  ha-bridge camera disable-motion-detection [flags] <name>

ARGUMENTS
  name string    Entity name without the camera. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera server-snapshot`

```text
DESCRIPTION
  Save the camera's current image on the Home Assistant host

USAGE
  ha-bridge camera server-snapshot [flags] <name> <filename>

ARGUMENTS
  name string        Entity name without the camera. prefix
  filename string    Path on the Home Assistant host, in allowlist_external_dirs

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera record`

```text
DESCRIPTION
  Record the camera's stream on the Home Assistant host

USAGE
  ha-bridge camera record [flags] <name> <filename>

ARGUMENTS
  name string        Entity name without the camera. prefix
  filename string    Path on the Home Assistant host, in allowlist_external_dirs

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --duration integer    Seconds to record (default: 30)
  --lookback integer    Seconds from before the call to include (default: 0)
```

## `ha-bridge camera play-stream`

```text
DESCRIPTION
  Play the camera's stream on a media player

USAGE
  ha-bridge camera play-stream [flags] <name> <media_player>

ARGUMENTS
  name string            Entity name without the camera. prefix
  media_player string    Media player name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
