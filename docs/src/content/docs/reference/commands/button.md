---
title: ha-bridge button
description: Arguments and flags for every ha-bridge button command.
sidebar:
  label: button
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge button` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge button`

```text
DESCRIPTION
  Button actions

USAGE
  ha-bridge button <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge button press`

```text
DESCRIPTION
  Press the button

USAGE
  ha-bridge button press [flags] <name>

ARGUMENTS
  name string    Entity name without the button. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
