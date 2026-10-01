---
title: ha-bridge calendar
description: Arguments and flags for every ha-bridge calendar command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge calendar` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  Print upcoming events as JSON

USAGE
  ha-bridge calendar events [flags] <name>

ARGUMENTS
  name string    Entity name without the calendar. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --days integer     Days ahead to read, from now
```

## `ha-bridge calendar create-event`

```text
DESCRIPTION
  Add an event

USAGE
  ha-bridge calendar create-event [flags] <name> <summary>

ARGUMENTS
  name string       Entity name without the calendar. prefix
  summary string    Event title

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --start string          Start date (all day) or date and time
  --end string            End date (exclusive, all day) or date and time
  --in-days integer       All day, this many days from today
  --in-weeks integer      All day, this many weeks from today
  --description string    Description
  --location string       Location
```
