---
title: ha-bridge select
description: Arguments and flags for every ha-bridge select command.
sidebar:
  label: select
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge select` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
  ha-bridge select select-option [flags] <option> [<entity_id...>]

ARGUMENTS
  option string          Option to select
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge select select-first`

```text
DESCRIPTION
  Select the first option

USAGE
  ha-bridge select select-first [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge select select-last`

```text
DESCRIPTION
  Select the last option

USAGE
  ha-bridge select select-last [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge select select-next`

```text
DESCRIPTION
  Select the next option

USAGE
  ha-bridge select select-next [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge select select-previous`

```text
DESCRIPTION
  Select the previous option

USAGE
  ha-bridge select select-previous [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the select. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --cycle            Wrap round at the end (the default); --no-cycle stops there
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
