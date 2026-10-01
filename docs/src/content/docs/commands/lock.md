---
title: ha-bridge lock
description: Arguments and flags for every ha-bridge lock command.
sidebar:
  label: lock
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge lock` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge lock`

```text
DESCRIPTION
  Lock actions

USAGE
  ha-bridge lock <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge lock lock`

```text
DESCRIPTION
  Lock

USAGE
  ha-bridge lock lock [flags] <name>

ARGUMENTS
  name string    Entity name without the lock. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge lock unlock`

```text
DESCRIPTION
  Unlock

USAGE
  ha-bridge lock unlock [flags] <name>

ARGUMENTS
  name string    Entity name without the lock. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge lock open`

```text
DESCRIPTION
  Open the latch

USAGE
  ha-bridge lock open [flags] <name>

ARGUMENTS
  name string    Entity name without the lock. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```
