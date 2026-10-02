---
title: ha-bridge history
description: Arguments and flags for every ha-bridge history command.
sidebar:
  label: history
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge history` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge history`

```text
DESCRIPTION
  Read recorded entity history

USAGE
  ha-bridge history <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge history get`

```text
DESCRIPTION
  Print the target's states, one line per change: time, entity ID and state

USAGE
  ha-bridge history get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, such as light.desk; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --start string     Start, as an ISO time or a duration before now, such as "2 hours"
  --end string       End, as an ISO time or a duration before now; now when left out
  --json             Print JSON
  --no-attributes    Leave out attributes
  --all-changes      Include changes to attributes only, for entities that leave them out by default
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
