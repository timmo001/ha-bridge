---
title: ha-bridge input_button
description: Arguments and flags for every ha-bridge input_button command.
sidebar:
  label: input_button
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge input_button` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge input_button`

```text
DESCRIPTION
  Input button actions

USAGE
  ha-bridge input_button <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_button press`

```text
DESCRIPTION
  Press the button

USAGE
  ha-bridge input_button press [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the input_button. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge input_button reload`

```text
DESCRIPTION
  Reload input_button helpers from YAML

USAGE
  ha-bridge input_button reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
