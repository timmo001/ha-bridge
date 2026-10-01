---
title: ha-bridge weather
description: Arguments and flags for every ha-bridge weather command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge weather` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge weather`

```text
DESCRIPTION
  Weather actions

USAGE
  ha-bridge weather <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge weather forecast`

```text
DESCRIPTION
  Print the forecast as JSON

USAGE
  ha-bridge weather forecast [flags] <name>

ARGUMENTS
  name string    Entity name without the weather. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --type choice      Forecast type (choices: daily, hourly, twice_daily)
```
