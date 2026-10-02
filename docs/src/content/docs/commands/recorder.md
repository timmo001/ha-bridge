---
title: ha-bridge recorder
description: Arguments and flags for every ha-bridge recorder command.
sidebar:
  label: recorder
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge recorder` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge recorder`

```text
DESCRIPTION
  Recorder actions

USAGE
  ha-bridge recorder <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge recorder purge`

```text
DESCRIPTION
  Remove old history

USAGE
  ha-bridge recorder purge [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --keep-days integer    Days of history to keep, up to 365 (default: the recorder's purge_keep_days)
  --repack               Free the disk space afterwards, which can take a while
  --apply-filter         Also remove what the recorder's filters now exclude
```

## `ha-bridge recorder purge-entities`

```text
DESCRIPTION
  Remove history for particular entities

USAGE
  ha-bridge recorder purge-entities [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, such as light.desk; repeat for more (optional)

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --domain string        Purge every entity in this domain; repeat for more
  --glob string          Purge entity IDs matching this glob, such as sensor.weather_*; repeat for more
  --keep-days integer    Days of history to keep (default: none)
  --entity string        Entity ID or name; repeat for more
  --device string        Device ID or name; repeat for more
  --area string          Area ID or name; repeat for more
  --floor string         Floor ID or name; repeat for more
  --label string         Label ID or name; repeat for more
```

## `ha-bridge recorder enable`

```text
DESCRIPTION
  Start recording again

USAGE
  ha-bridge recorder enable [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge recorder disable`

```text
DESCRIPTION
  Stop recording until enabled or Home Assistant restarts

USAGE
  ha-bridge recorder disable [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge recorder statistics`

```text
DESCRIPTION
  Print long-term statistics as JSON, keyed by statistic ID

USAGE
  ha-bridge recorder statistics [flags] <start> <statistic_id...>

ARGUMENTS
  start string             Start, such as 2026-10-01 00:00, in Home Assistant's time zone
  statistic_id... string   Entity ID or external statistic ID; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --end string       End (default: now)
  --period choice    Length of each row (choices: 5minute, hour, day, week, month, year)
  --type choice      Value to include; repeat for more (choices: change, last_reset, max, mean, min, state, sum)
  --unit string      Unit to convert a unit class to, such as energy=kWh; repeat for more
```
