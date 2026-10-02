---
title: ha-bridge event
description: Arguments and flags for every ha-bridge event command.
sidebar:
  label: event
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge event` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge event`

```text
DESCRIPTION
  Watch and fire events on Home Assistant's event bus

USAGE
  ha-bridge event <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge event watch`

Alias: `ha-bridge event w`

```text
DESCRIPTION
  Print each event as a line of JSON

USAGE
  ha-bridge event watch [flags] [<event-type>]

ARGUMENTS
  event-type string    Event type, such as call_service; every type when left out. Most need an admin token (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge event fire`

```text
DESCRIPTION
  Fire an event. Needs an admin token

USAGE
  ha-bridge event fire [flags] <event-type>

ARGUMENTS
  event-type string    Event type, such as my_event

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --data string      Event data as a JSON object, such as '{"room":"office"}'
```
