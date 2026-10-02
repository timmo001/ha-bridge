---
title: ha-bridge scene
description: Arguments and flags for every ha-bridge scene command.
sidebar:
  label: scene
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge scene` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge scene`

```text
DESCRIPTION
  Scene actions

USAGE
  ha-bridge scene <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge scene turn-on`

Alias: `ha-bridge scene on`

```text
DESCRIPTION
  Activate the scene

USAGE
  ha-bridge scene turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the scene. prefix; repeat for more (optional)

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --transition number    Transition time in seconds
  --entity string        Entity ID or name; repeat for more
  --device string        Device ID or name; repeat for more
  --area string          Area ID or name; repeat for more
  --floor string         Floor ID or name; repeat for more
  --label string         Label ID or name; repeat for more
```

## `ha-bridge scene apply`

```text
DESCRIPTION
  Set entity states without making a scene

USAGE
  ha-bridge scene apply [flags] <entities>

ARGUMENTS
  entities string    Entity states as a JSON object, such as '{"light.desk":{"state":"on","brightness":80}}'

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --transition number    Transition time in seconds
```

## `ha-bridge scene create`

```text
DESCRIPTION
  Make a scene that lasts until Home Assistant restarts

USAGE
  ha-bridge scene create [flags] <scene_id>

ARGUMENTS
  scene_id string    ID for the new scene, such as before_movie

FLAGS
  --socket string             Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entities string           Entity states as a JSON object, such as '{"light.desk":{"state":"on","brightness":80}}'
  --snapshot-entity string    Entity ID whose current state to capture; repeat for more
```

## `ha-bridge scene delete`

```text
DESCRIPTION
  Delete a scene made with create

USAGE
  ha-bridge scene delete [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the scene. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge scene reload`

```text
DESCRIPTION
  Reload the scene YAML configuration

USAGE
  ha-bridge scene reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
