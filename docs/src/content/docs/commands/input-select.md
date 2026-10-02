---
title: ha-bridge input_select
description: Arguments and flags for every ha-bridge input_select command.
sidebar:
  label: input_select
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_select` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
  ha-bridge input_select select-option [flags] <option> [<entity_id...>]

ARGUMENTS
  option string          Option to select
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select select-first`

```text
DESCRIPTION
  Select the first option

USAGE
  ha-bridge input_select select-first [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select select-last`

```text
DESCRIPTION
  Select the last option

USAGE
  ha-bridge input_select select-last [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select select-next`

```text
DESCRIPTION
  Select the next option

USAGE
  ha-bridge input_select select-next [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select select-previous`

```text
DESCRIPTION
  Select the previous option

USAGE
  ha-bridge input_select select-previous [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select set-options`

```text
DESCRIPTION
  Replace the options until Home Assistant restarts or reloads

USAGE
  ha-bridge input_select set-options [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --option string    Option; repeat for each option
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_select reload`

```text
DESCRIPTION
  Reload the input_select YAML configuration

USAGE
  ha-bridge input_select reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
