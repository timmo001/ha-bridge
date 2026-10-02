---
title: ha-bridge alert
description: Arguments and flags for every ha-bridge alert command.
sidebar:
  label: alert
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge alert` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge alert`

```text
DESCRIPTION
  Alert actions

USAGE
  ha-bridge alert <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge alert turn-on`

Alias: `ha-bridge alert on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge alert turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the alert. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge alert turn-off`

Alias: `ha-bridge alert off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge alert turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the alert. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge alert toggle`

Alias: `ha-bridge alert t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge alert toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the alert. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
