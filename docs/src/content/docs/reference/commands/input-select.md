---
title: ha-bridge input_select
description: Arguments and flags for every ha-bridge input_select command.
sidebar:
  label: input_select
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_select` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge input_select`

```text
DESCRIPTION
  Input select actions

USAGE
  ha-bridge input_select <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_select select-option`

```text
DESCRIPTION
  Select an option

USAGE
  ha-bridge input_select select-option [flags] <name> <option>

ARGUMENTS
  name string      Entity name without the input_select. prefix
  option string    Option to select

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_select select-first`

```text
DESCRIPTION
  Select the first option

USAGE
  ha-bridge input_select select-first [flags] <name>

ARGUMENTS
  name string    Entity name without the input_select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_select select-last`

```text
DESCRIPTION
  Select the last option

USAGE
  ha-bridge input_select select-last [flags] <name>

ARGUMENTS
  name string    Entity name without the input_select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_select select-next`

```text
DESCRIPTION
  Select the next option

USAGE
  ha-bridge input_select select-next [flags] <name>

ARGUMENTS
  name string    Entity name without the input_select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
```

## `ha-bridge input_select select-previous`

```text
DESCRIPTION
  Select the previous option

USAGE
  ha-bridge input_select select-previous [flags] <name>

ARGUMENTS
  name string    Entity name without the input_select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
```

## `ha-bridge input_select set-options`

```text
DESCRIPTION
  Replace the options until Home Assistant restarts or reloads

USAGE
  ha-bridge input_select set-options [flags] <name> <option...>

ARGUMENTS
  name string         Entity name without the input_select. prefix
  option... string    Option; repeat for each option

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_select reload`

```text
DESCRIPTION
  Reload input_select helpers from YAML

USAGE
  ha-bridge input_select reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
