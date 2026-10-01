---
title: ha-bridge datetime
description: Arguments and flags for every ha-bridge datetime command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge datetime` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge datetime`

```text
DESCRIPTION
  Date and time actions

USAGE
  ha-bridge datetime <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge datetime set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge datetime set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the datetime. prefix
  value string    Date and time, such as "2026-10-01 18:30"

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
