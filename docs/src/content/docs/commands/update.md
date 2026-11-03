---
title: ha-bridge update
description: Arguments and flags for every ha-bridge update command.
sidebar:
  label: update
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge update` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge update`

```text
DESCRIPTION
  Update actions

USAGE
  ha-bridge update <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update list`

Alias: `ha-bridge update ls`

```text
DESCRIPTION
  List every update Home Assistant offers, or the target's: entity ID, name, state and versions

USAGE
  ha-bridge update list [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --available                Only those with a newer version waiting that isn't skipped
  --json                     Print as JSON
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update get`

```text
DESCRIPTION
  Show one update in full, with its integration and release notes

USAGE
  ha-bridge update get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --json                     Print as JSON
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update check`

```text
DESCRIPTION
  Check for updates, as Settings > Updates does: the Supervisor first, with an admin token, then each update entity, or the target's

USAGE
  ha-bridge update check [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --json                     Print as JSON
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update install`

```text
DESCRIPTION
  Install the update

USAGE
  ha-bridge update install [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --version string           Version to install (default: the latest)
  --backup                   Back up first, where the integration supports it
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update skip`

```text
DESCRIPTION
  Skip this version

USAGE
  ha-bridge update skip [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update clear-skipped`

```text
DESCRIPTION
  Stop skipping the version

USAGE
  ha-bridge update clear-skipped [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the update. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
