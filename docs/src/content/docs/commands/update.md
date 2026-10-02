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

FLAGS
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
  --socket string     Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --version string    Version to install (default: the latest)
  --backup            Back up first, where the integration supports it
  --entity string     Entity ID or name; repeat for more
  --device string     Device ID or name; repeat for more
  --area string       Area ID or name; repeat for more
  --floor string      Floor ID or name; repeat for more
  --label string      Label ID or name; repeat for more
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
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
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
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
