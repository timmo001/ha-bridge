---
title: ha-bridge group
description: Arguments and flags for every ha-bridge group command.
sidebar:
  label: group
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge group` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge group`

```text
DESCRIPTION
  Group actions

USAGE
  ha-bridge group <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge group set`

```text
DESCRIPTION
  Create or change a group

USAGE
  ha-bridge group set [flags] <object_id>

ARGUMENTS
  object_id string    Group ID, without group.

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --name string             Group name
  --icon string             Icon, such as mdi:lamp
  --all                     On only when every member is on
  --entity string           Member entity ID, replacing the members; repeat for more
  --add-entity string       Entity ID to add
  --remove-entity string    Entity ID to remove
```

## `ha-bridge group remove`

```text
DESCRIPTION
  Remove a group made with set

USAGE
  ha-bridge group remove [flags] <object_id>

ARGUMENTS
  object_id string    Group ID, without group.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge group reload`

```text
DESCRIPTION
  Reload group helpers from YAML

USAGE
  ha-bridge group reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
