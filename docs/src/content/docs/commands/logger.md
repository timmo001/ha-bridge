---
title: ha-bridge logger
description: Arguments and flags for every ha-bridge logger command.
sidebar:
  label: logger
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge logger` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge logger`

```text
DESCRIPTION
  Logger actions

USAGE
  ha-bridge logger <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logger default-level`

```text
DESCRIPTION
  Set the default log level

USAGE
  ha-bridge logger default-level [flags] <level>

ARGUMENTS
  level string    Level for loggers without their own: debug, info, warning, error, fatal, critical

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logger level`

```text
DESCRIPTION
  Set the level of particular loggers

USAGE
  ha-bridge logger level [flags] <logger=level...>

ARGUMENTS
  logger=level... string   Logger and level, such as homeassistant.components.mqtt=debug; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
