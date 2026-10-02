---
title: ha-bridge image_processing
description: Arguments and flags for every ha-bridge image_processing command.
sidebar:
  label: image_processing
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge image_processing` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge image_processing`

```text
DESCRIPTION
  Image processing actions

USAGE
  ha-bridge image_processing <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge image_processing scan`

```text
DESCRIPTION
  Process the image now

USAGE
  ha-bridge image_processing scan [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the image_processing. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
