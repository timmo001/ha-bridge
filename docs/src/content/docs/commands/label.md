---
title: ha-bridge label
description: Arguments and flags for every ha-bridge label command.
sidebar:
  label: label
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge label` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge label`

```text
DESCRIPTION
  Labels: list, create, change and delete them, and add them to or remove them from entities, devices and areas. Changes need an admin token

USAGE
  ha-bridge label <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label list`

Alias: `ha-bridge label ls`

```text
DESCRIPTION
  List every label by name, with its ID

USAGE
  ha-bridge label list [flags]

FLAGS
  --json    Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label create`

```text
DESCRIPTION
  Create a label and print its ID, which Home Assistant makes from its name

USAGE
  ha-bridge label create [flags] <name>

ARGUMENTS
  name string    The new label's name

FLAGS
  --icon string           Icon, such as mdi:lightbulb; an empty value clears it
  --color string          Colour: a theme colour, such as indigo or light-blue, or a hex colour, such as #ff0000; an empty value clears it
  --description string    Description; an empty value clears it
  --json                  Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label update`

```text
DESCRIPTION
  Change a label's name, icon, colour or description, leaving the rest. Its ID stays the same

USAGE
  ha-bridge label update [flags] <label>

ARGUMENTS
  label string    Label ID or name

FLAGS
  --name string           New name
  --icon string           Icon, such as mdi:lightbulb; an empty value clears it
  --color string          Colour: a theme colour, such as indigo or light-blue, or a hex colour, such as #ff0000; an empty value clears it
  --description string    Description; an empty value clears it
  --json                  Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label delete`

```text
DESCRIPTION
  Delete a label, taking it off everything that has it

USAGE
  ha-bridge label delete [flags] <label>

ARGUMENTS
  label string    Label ID or name

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label add`

```text
DESCRIPTION
  Add labels to entities, devices and areas, keeping the labels they have. --json prints each item afterwards

USAGE
  ha-bridge label add [flags] <label...>

ARGUMENTS
  label... string    Label ID or name; repeat for more

FLAGS
  --entity string    Entity ID, such as automation.morning; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --json             Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge label remove`

```text
DESCRIPTION
  Remove labels from entities, devices and areas, keeping their other labels. --json prints each item afterwards

USAGE
  ha-bridge label remove [flags] <label...>

ARGUMENTS
  label... string    Label ID or name; repeat for more

FLAGS
  --entity string    Entity ID, such as automation.morning; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --json             Print as JSON

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
