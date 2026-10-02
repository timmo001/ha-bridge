---
title: ha-bridge todo
description: Arguments and flags for every ha-bridge todo command.
sidebar:
  label: todo
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge todo` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge todo`

```text
DESCRIPTION
  To-do list actions

USAGE
  ha-bridge todo <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge todo get`

```text
DESCRIPTION
  Print the list's items as JSON

USAGE
  ha-bridge todo get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the todo. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --status choice    Only items with this status; repeat for both (choices: needs_action, completed)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge todo add`

```text
DESCRIPTION
  Add an item

USAGE
  ha-bridge todo add [flags] <item> [<entity_id...>]

ARGUMENTS
  item string            Item name
  entity_id... string    Entity ID, with or without the todo. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --due-date string        Due date as YYYY-MM-DD
  --due-datetime string    Due date and time, such as "2026-10-01 18:30"
  --description string     Description
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```

## `ha-bridge todo update`

```text
DESCRIPTION
  Change an item

USAGE
  ha-bridge todo update [flags] <item> [<entity_id...>]

ARGUMENTS
  item string            Item name or UID
  entity_id... string    Entity ID, with or without the todo. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --rename string          New name
  --status choice          New status (choices: needs_action, completed)
  --due-date string        Due date as YYYY-MM-DD
  --due-datetime string    Due date and time, such as "2026-10-01 18:30"
  --description string     Description
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```

## `ha-bridge todo remove`

```text
DESCRIPTION
  Remove items

USAGE
  ha-bridge todo remove [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the todo. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --item string      Item name or UID; repeat for more
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge todo remove-completed`

```text
DESCRIPTION
  Remove completed items

USAGE
  ha-bridge todo remove-completed [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the todo. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
