---
title: ha-bridge lawn_mower
description: Arguments and flags for every ha-bridge lawn_mower command.
sidebar:
  label: lawn_mower
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge lawn_mower` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge lawn_mower`

```text
DESCRIPTION
  Lawn mower actions

USAGE
  ha-bridge lawn_mower <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lawn_mower start`

```text
DESCRIPTION
  Start mowing

USAGE
  ha-bridge lawn_mower start [flags] <name>

ARGUMENTS
  name string    Entity name without the lawn_mower. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lawn_mower pause`

```text
DESCRIPTION
  Pause mowing

USAGE
  ha-bridge lawn_mower pause [flags] <name>

ARGUMENTS
  name string    Entity name without the lawn_mower. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lawn_mower stop`

```text
DESCRIPTION
  Stop mowing

USAGE
  ha-bridge lawn_mower stop [flags] <name>

ARGUMENTS
  name string    Entity name without the lawn_mower. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lawn_mower dock`

```text
DESCRIPTION
  Go back to the dock

USAGE
  ha-bridge lawn_mower dock [flags] <name>

ARGUMENTS
  name string    Entity name without the lawn_mower. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
