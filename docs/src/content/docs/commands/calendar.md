---
title: ha-bridge calendar
description: Arguments and flags for every ha-bridge calendar command.
sidebar:
  label: calendar
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge calendar` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge calendar`

```text
DESCRIPTION
  Calendar actions

USAGE
  ha-bridge calendar <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge calendar events`

```text
DESCRIPTION
  Print upcoming events as JSON, keyed by calendar entity ID

USAGE
  ha-bridge calendar events [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the calendar. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --days integer     Days ahead to read, from now
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge calendar create-event`

```text
DESCRIPTION
  Add an event

USAGE
  ha-bridge calendar create-event [flags] <summary> [<entity_id...>]

ARGUMENTS
  summary string         Event title
  entity_id... string    Entity ID, with or without the calendar. prefix; repeat for more (optional)

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --start string          Start date (all day) or date and time
  --end string            End date (exclusive, all day) or date and time
  --in-days integer       All day, this many days from today
  --in-weeks integer      All day, this many weeks from today
  --description string    Description
  --location string       Location
  --entity string         Entity ID or name; repeat for more
  --device string         Device ID or name; repeat for more
  --area string           Area ID or name; repeat for more
  --floor string          Floor ID or name; repeat for more
  --label string          Label ID or name; repeat for more
```
