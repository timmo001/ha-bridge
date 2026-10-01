---
title: ha-bridge select
description: Arguments and flags for every ha-bridge select command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge select` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge select`

```text
DESCRIPTION
  Select actions

USAGE
  ha-bridge select <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge select select-option`

```text
DESCRIPTION
  Select an option

USAGE
  ha-bridge select select-option [flags] <name> <option>

ARGUMENTS
  name string      Entity name without the select. prefix
  option string    Option to select

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge select select-first`

```text
DESCRIPTION
  Select the first option

USAGE
  ha-bridge select select-first [flags] <name>

ARGUMENTS
  name string    Entity name without the select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge select select-last`

```text
DESCRIPTION
  Select the last option

USAGE
  ha-bridge select select-last [flags] <name>

ARGUMENTS
  name string    Entity name without the select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge select select-next`

```text
DESCRIPTION
  Select the next option

USAGE
  ha-bridge select select-next [flags] <name>

ARGUMENTS
  name string    Entity name without the select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
```

## `ha-bridge select select-previous`

```text
DESCRIPTION
  Select the previous option

USAGE
  ha-bridge select select-previous [flags] <name>

ARGUMENTS
  name string    Entity name without the select. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
```
