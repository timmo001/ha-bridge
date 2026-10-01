---
title: ha-bridge automation
description: Arguments and flags for every ha-bridge automation command.
sidebar:
  label: automation
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge automation` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge automation turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the automation. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation turn-off`

Alias: `ha-bridge automation off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge automation turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the automation. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --stop-actions     Stop running actions (the default); --no-stop-actions lets them finish
```

## `ha-bridge automation toggle`

Alias: `ha-bridge automation t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge automation toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the automation. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge automation trigger`

```text
DESCRIPTION
  Run the automation's actions

USAGE
  ha-bridge automation trigger [flags] <name>

ARGUMENTS
  name string    Entity name without the automation. prefix

FLAGS
  --socket string     Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --skip-condition    Skip the conditions (the default); --no-skip-condition checks them
```

## `ha-bridge automation reload`

```text
DESCRIPTION
  Reload automation helpers from YAML

USAGE
  ha-bridge automation reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
