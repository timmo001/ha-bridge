---
title: ha-bridge valve
description: Arguments and flags for every ha-bridge valve command.
sidebar:
  label: valve
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge valve` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge valve`

```text
DESCRIPTION
  Valve actions

USAGE
  ha-bridge valve <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve open`

```text
DESCRIPTION
  Open the valve

USAGE
  ha-bridge valve open [flags] <name>

ARGUMENTS
  name string    Entity name without the valve. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve close`

```text
DESCRIPTION
  Close the valve

USAGE
  ha-bridge valve close [flags] <name>

ARGUMENTS
  name string    Entity name without the valve. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve toggle`

```text
DESCRIPTION
  Open or close the valve

USAGE
  ha-bridge valve toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the valve. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve stop`

```text
DESCRIPTION
  Stop the valve

USAGE
  ha-bridge valve stop [flags] <name>

ARGUMENTS
  name string    Entity name without the valve. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge valve position`

```text
DESCRIPTION
  Set the position

USAGE
  ha-bridge valve position [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the valve. prefix
  position string    Position from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
