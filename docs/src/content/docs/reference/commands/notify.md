---
title: ha-bridge notify
description: Arguments and flags for every ha-bridge notify command.
sidebar:
  label: notify
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge notify` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge notify send-message [flags] <name> <message>

ARGUMENTS
  name string       Entity name without the notify. prefix
  message string    Message text

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --title string     Title
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
