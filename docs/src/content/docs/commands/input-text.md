---
title: ha-bridge input_text
description: Arguments and flags for every ha-bridge input_text command.
sidebar:
  label: input_text
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_text` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge input_text`

```text
DESCRIPTION
  Input text actions

USAGE
  ha-bridge input_text <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_text set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge input_text set-value [flags] <value> [<entity_id...>]

ARGUMENTS
  value string           New text
  entity_id... string    Entity ID, with or without the input_text. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_text reload`

```text
DESCRIPTION
  Reload input_text helpers from YAML

USAGE
  ha-bridge input_text reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
