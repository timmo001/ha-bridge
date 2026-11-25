---
title: ha-bridge category
description: Arguments and flags for every ha-bridge category command.
sidebar:
  label: category
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge category` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge category`

```text
DESCRIPTION
  Categories of automations, scripts, scenes and helpers: list, create, change and delete them, and put entities in them. Changes need an admin token

USAGE
  ha-bridge category <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category list`

Alias: `ha-bridge category ls`

```text
DESCRIPTION
  List a scope's categories by name, with their IDs

USAGE
  ha-bridge category list [flags] <scope>

ARGUMENTS
  scope string    The category scope: automation, script, scene or helpers in Home Assistant's own pages

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category create`

```text
DESCRIPTION
  Create a category in a scope and print its ID

USAGE
  ha-bridge category create [flags] <scope> <name>

ARGUMENTS
  scope string    The category scope: automation, script, scene or helpers in Home Assistant's own pages
  name string     The new category's name

FLAGS
  --icon string    Icon, such as mdi:lightbulb
  --json           Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category update`

```text
DESCRIPTION
  Rename a category or change its icon

USAGE
  ha-bridge category update [flags] <scope> <category>

ARGUMENTS
  scope string       The category scope: automation, script, scene or helpers in Home Assistant's own pages
  category string    Category ID or name

FLAGS
  --name string    New name
  --icon string    Icon, such as mdi:lightbulb; an empty value clears it
  --json           Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category delete`

```text
DESCRIPTION
  Delete a category, taking every entity out of it

USAGE
  ha-bridge category delete [flags] <scope> <category>

ARGUMENTS
  scope string       The category scope: automation, script, scene or helpers in Home Assistant's own pages
  category string    Category ID or name

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category set`

```text
DESCRIPTION
  Put entities in a category, moving them from any other in the same scope. --json prints each entity afterwards

USAGE
  ha-bridge category set [flags] <category> <entity_id...>

ARGUMENTS
  category string        Category ID or name
  entity_id... string    Entity ID, such as automation.morning; repeat for more

FLAGS
  --scope string    The category scope, such as helpers (default: the entity's domain for automations, scripts and scenes)
  --json            Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge category clear`

```text
DESCRIPTION
  Take entities out of their category in the scope. --json prints each entity afterwards

USAGE
  ha-bridge category clear [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Entity ID, such as automation.morning; repeat for more

FLAGS
  --scope string    The category scope, such as helpers (default: the entity's domain for automations, scripts and scenes)
  --json            Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
