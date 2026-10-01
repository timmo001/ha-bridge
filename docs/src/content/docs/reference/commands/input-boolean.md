---
title: ha-bridge input_boolean
description: Arguments and flags for every ha-bridge input_boolean command.
sidebar:
  label: input_boolean
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_boolean` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge input_boolean`

Alias: `ha-bridge ib`

```text
DESCRIPTION
  Input boolean actions

USAGE
  ha-bridge input_boolean <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean turn-on`

Alias: `ha-bridge input_boolean on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge input_boolean turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean turn-off`

Alias: `ha-bridge input_boolean off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge input_boolean turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean toggle`

Alias: `ha-bridge input_boolean t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge input_boolean toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean reload`

```text
DESCRIPTION
  Reload input_boolean helpers from YAML

USAGE
  ha-bridge input_boolean reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
