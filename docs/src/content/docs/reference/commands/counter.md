---
title: ha-bridge counter
description: Arguments and flags for every ha-bridge counter command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge counter` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge counter`

```text
DESCRIPTION
  Counter actions

USAGE
  ha-bridge counter <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge counter increment`

```text
DESCRIPTION
  Raise the count by one step

USAGE
  ha-bridge counter increment [flags] <name>

ARGUMENTS
  name string    Entity name without the counter. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge counter decrement`

```text
DESCRIPTION
  Lower the count by one step

USAGE
  ha-bridge counter decrement [flags] <name>

ARGUMENTS
  name string    Entity name without the counter. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge counter reset`

```text
DESCRIPTION
  Reset to the initial value

USAGE
  ha-bridge counter reset [flags] <name>

ARGUMENTS
  name string    Entity name without the counter. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge counter set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge counter set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the counter. prefix
  value string    New count

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
