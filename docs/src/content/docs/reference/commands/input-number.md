---
title: ha-bridge input_number
description: Arguments and flags for every ha-bridge input_number command.
sidebar:
  label: input_number
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_number` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge input_number`

Alias: `ha-bridge in`

```text
DESCRIPTION
  Input number actions

USAGE
  ha-bridge input_number <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number increment`

```text
DESCRIPTION
  Raise the value by one step

USAGE
  ha-bridge input_number increment [flags] <name>

ARGUMENTS
  name string    Entity name without the input_number. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number decrement`

```text
DESCRIPTION
  Lower the value by one step

USAGE
  ha-bridge input_number decrement [flags] <name>

ARGUMENTS
  name string    Entity name without the input_number. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge input_number set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the input_number. prefix
  value string    New value

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number reload`

```text
DESCRIPTION
  Reload input_number helpers from YAML

USAGE
  ha-bridge input_number reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
