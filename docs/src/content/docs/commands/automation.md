---
title: ha-bridge automation
description: Arguments and flags for every ha-bridge automation command.
sidebar:
  label: automation
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge automation` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge automation`

```text
DESCRIPTION
  Automation actions

USAGE
  ha-bridge automation <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation turn-on`

Alias: `ha-bridge automation on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge automation turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the automation. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge automation turn-off`

Alias: `ha-bridge automation off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge automation turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the automation. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --stop-actions     Stop running actions (the default); --no-stop-actions lets them finish
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge automation toggle`

Alias: `ha-bridge automation t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge automation toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the automation. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge automation trigger`

```text
DESCRIPTION
  Run the automation's actions

USAGE
  ha-bridge automation trigger [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the automation. prefix; repeat for more (optional)

FLAGS
  --socket string     Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --skip-condition    Skip the conditions (the default); --no-skip-condition checks them
  --entity string     Entity ID or name; repeat for more
  --device string     Device ID or name; repeat for more
  --area string       Area ID or name; repeat for more
  --floor string      Floor ID or name; repeat for more
  --label string      Label ID or name; repeat for more
```

## `ha-bridge automation reload`

```text
DESCRIPTION
  Reload the automation YAML configuration

USAGE
  ha-bridge automation reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation config`

```text
DESCRIPTION
  Read and write automation configs. Needs an admin token

USAGE
  ha-bridge automation config <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation config get`

Alias: `ha-bridge automation config g`

```text
DESCRIPTION
  Print the config an automation was loaded from, as YAML. --json adds its ID and whether it can be changed here

USAGE
  ha-bridge automation config get [flags] <automation>

ARGUMENTS
  automation string    The automation's entity ID, with or without automation.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
```

## `ha-bridge automation config create`

```text
DESCRIPTION
  Add an automation to automations.yaml once Home Assistant validates it, and print its ID

USAGE
  ha-bridge automation config create [flags]

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --id string          ID for the new automation (default: made up)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
```

## `ha-bridge automation config update`

```text
DESCRIPTION
  Replace all of an automation's config in automations.yaml once Home Assistant validates it

USAGE
  ha-bridge automation config update [flags] <automation>

ARGUMENTS
  automation string    The automation's entity ID, with or without automation.

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
```

## `ha-bridge automation config delete`

```text
DESCRIPTION
  Remove an automation from automations.yaml, and its entity

USAGE
  ha-bridge automation config delete [flags] <automation>

ARGUMENTS
  automation string    The automation's entity ID, with or without automation.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation config validate`

Alias: `ha-bridge automation config v`

```text
DESCRIPTION
  Check an automation config without saving it: Home Assistant's own checks, then any entity, action, device, area, floor or label it names that doesn't exist. Exits 1 when it finds a problem

USAGE
  ha-bridge automation config validate [flags]

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
  --json               Print as JSON
```
