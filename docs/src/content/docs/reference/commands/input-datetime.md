---
title: ha-bridge input_datetime
description: Arguments and flags for every ha-bridge input_datetime command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_datetime` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge input_datetime`

```text
DESCRIPTION
  Input date and time actions

USAGE
  ha-bridge input_datetime <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_datetime set-datetime`

```text
DESCRIPTION
  Set the date, time or both, or a date and time or timestamp

USAGE
  ha-bridge input_datetime set-datetime [flags] <name>

ARGUMENTS
  name string    Entity name without the input_datetime. prefix

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --date string         Date as YYYY-MM-DD
  --time string         Time as HH:MM or HH:MM:SS
  --datetime string     Date and time, such as "2026-10-01 18:30"
  --timestamp number    Seconds since the Unix epoch
```

## `ha-bridge input_datetime reload`

```text
DESCRIPTION
  Reload input_datetime helpers from YAML

USAGE
  ha-bridge input_datetime reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
