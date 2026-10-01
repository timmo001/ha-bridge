---
title: ha-bridge cover
description: Arguments and flags for every ha-bridge cover command.
sidebar:
  label: cover
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge cover` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge cover`

Alias: `ha-bridge c`

```text
DESCRIPTION
  Cover actions

USAGE
  ha-bridge cover <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover watch`

Alias: `ha-bridge cover w`

```text
DESCRIPTION
  Print bar JSON now and on every change

USAGE
  ha-bridge cover watch [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover open`

```text
DESCRIPTION
  Open the cover

USAGE
  ha-bridge cover open [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover close`

```text
DESCRIPTION
  Close the cover

USAGE
  ha-bridge cover close [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover toggle`

```text
DESCRIPTION
  Open or close the cover

USAGE
  ha-bridge cover toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover stop`

```text
DESCRIPTION
  Stop the cover

USAGE
  ha-bridge cover stop [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover position`

```text
DESCRIPTION
  Set the position

USAGE
  ha-bridge cover position [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the cover. prefix
  position string    Position from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover open-tilt`

```text
DESCRIPTION
  Open the tilt

USAGE
  ha-bridge cover open-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover close-tilt`

```text
DESCRIPTION
  Close the tilt

USAGE
  ha-bridge cover close-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover toggle-tilt`

```text
DESCRIPTION
  Open or close the tilt

USAGE
  ha-bridge cover toggle-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover stop-tilt`

```text
DESCRIPTION
  Stop the tilt

USAGE
  ha-bridge cover stop-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover tilt-position`

```text
DESCRIPTION
  Set the tilt position

USAGE
  ha-bridge cover tilt-position [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the cover. prefix
  position string    Position from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
