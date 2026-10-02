---
title: ha-bridge system_log
description: Arguments and flags for every ha-bridge system_log command.
sidebar:
  label: system_log
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge system_log` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge system_log`

```text
DESCRIPTION
  System log actions

USAGE
  ha-bridge system_log <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge system_log write`

```text
DESCRIPTION
  Write to the system log

USAGE
  ha-bridge system_log write [flags] <message>

ARGUMENTS
  message string    Message text

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --level choice     Log level (default: error) (choices: debug, info, warning, error, critical)
  --logger string    Logger name, such as mycomponent.myplatform
```

## `ha-bridge system_log clear`

```text
DESCRIPTION
  Clear the system log

USAGE
  ha-bridge system_log clear [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
