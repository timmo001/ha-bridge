---
title: ha-bridge command_line
description: Arguments and flags for every ha-bridge command_line command.
sidebar:
  label: command_line
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge command_line` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge command_line`

```text
DESCRIPTION
  Command line actions

USAGE
  ha-bridge command_line <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge command_line reload`

```text
DESCRIPTION
  Reload the command_line YAML configuration

USAGE
  ha-bridge command_line reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
