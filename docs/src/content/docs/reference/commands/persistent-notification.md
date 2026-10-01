---
title: ha-bridge persistent_notification
description: Arguments and flags for every ha-bridge persistent_notification command.
sidebar:
  label: persistent_notification
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge persistent_notification` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge persistent_notification`

Alias: `ha-bridge pn`

```text
DESCRIPTION
  Persistent notification actions

USAGE
  ha-bridge persistent_notification <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge persistent_notification create`

```text
DESCRIPTION
  Show a notification in Home Assistant

USAGE
  ha-bridge persistent_notification create [flags] <message>

ARGUMENTS
  message string    Message text

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --title string     Title
  --id string        Notification ID; reusing one replaces that notification
```

## `ha-bridge persistent_notification dismiss`

```text
DESCRIPTION
  Dismiss a notification

USAGE
  ha-bridge persistent_notification dismiss [flags] <id>

ARGUMENTS
  id string    Notification ID

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge persistent_notification dismiss-all`

```text
DESCRIPTION
  Dismiss every notification

USAGE
  ha-bridge persistent_notification dismiss-all [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
