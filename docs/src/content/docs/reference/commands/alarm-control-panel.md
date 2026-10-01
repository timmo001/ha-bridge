---
title: ha-bridge alarm_control_panel
description: Arguments and flags for every ha-bridge alarm_control_panel command.
sidebar:
  label: alarm_control_panel
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge alarm_control_panel` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge alarm_control_panel`

Alias: `ha-bridge alarm`

```text
DESCRIPTION
  Alarm control panel actions

USAGE
  ha-bridge alarm_control_panel <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge alarm_control_panel disarm`

```text
DESCRIPTION
  Disarm

USAGE
  ha-bridge alarm_control_panel disarm [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel arm-home`

```text
DESCRIPTION
  Arm for when you're home

USAGE
  ha-bridge alarm_control_panel arm-home [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel arm-away`

```text
DESCRIPTION
  Arm for when you're away

USAGE
  ha-bridge alarm_control_panel arm-away [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel arm-night`

```text
DESCRIPTION
  Arm for the night

USAGE
  ha-bridge alarm_control_panel arm-night [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel arm-vacation`

```text
DESCRIPTION
  Arm for a holiday

USAGE
  ha-bridge alarm_control_panel arm-vacation [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel arm-custom-bypass`

```text
DESCRIPTION
  Arm with the panel's bypassed zones

USAGE
  ha-bridge alarm_control_panel arm-custom-bypass [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```

## `ha-bridge alarm_control_panel trigger`

```text
DESCRIPTION
  Set off the alarm

USAGE
  ha-bridge alarm_control_panel trigger [flags] <name>

ARGUMENTS
  name string    Entity name without the alarm_control_panel. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --code string      The lock's code
```
