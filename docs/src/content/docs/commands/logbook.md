---
title: ha-bridge logbook
description: Arguments and flags for every ha-bridge logbook command.
sidebar:
  label: logbook
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge logbook` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge logbook`

```text
DESCRIPTION
  Logbook actions

USAGE
  ha-bridge logbook <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logbook get`

```text
DESCRIPTION
  Print logbook entries for the target, or every entry without one

USAGE
  ha-bridge logbook get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, such as light.desk; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --start string     Start, as an ISO time or a duration before now, such as "2 hours"
  --end string       End, as an ISO time or a duration before now; now when left out
  --json             Print JSON
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge logbook watch`

Alias: `ha-bridge logbook w`

```text
DESCRIPTION
  Print new logbook entries for the target, or every entry without one

USAGE
  ha-bridge logbook watch [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, such as light.desk; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print each entry as JSON
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge logbook log`

```text
DESCRIPTION
  Add a logbook entry

USAGE
  ha-bridge logbook log [flags] <name> <message>

ARGUMENTS
  name string       Who or what the entry is about, such as Kitchen
  message string    What happened, such as is being used

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity-id string    Full entity ID to tie the entry to
  --domain string       Domain whose icon the entry shows
```
