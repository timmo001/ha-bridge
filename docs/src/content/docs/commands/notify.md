---
title: ha-bridge notify
description: Arguments and flags for every ha-bridge notify command.
sidebar:
  label: notify
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge notify` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge notify`

```text
DESCRIPTION
  Notification actions

USAGE
  ha-bridge notify <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge notify send-message`

```text
DESCRIPTION
  Send a message to a notify entity

USAGE
  ha-bridge notify send-message [flags] <message> [<entity_id...>]

ARGUMENTS
  message string         Message text
  entity_id... string    Entity ID, with or without the notify. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --title string     Title
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge notify legacy`

```text
DESCRIPTION
  Send through a legacy notify action

USAGE
  ha-bridge notify legacy [flags] <action> <message>

ARGUMENTS
  action string     Notify action without notify., such as mobile_app_pixel
  message string    Message text

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --title string     Title
  --data string      Extra data for the integration, as a JSON object
```
