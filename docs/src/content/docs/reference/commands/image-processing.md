---
title: ha-bridge image_processing
description: Arguments and flags for every ha-bridge image_processing command.
sidebar:
  label: image_processing
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge image_processing` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

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
  ha-bridge image_processing scan [flags] <name>

ARGUMENTS
  name string    Entity name without the image_processing. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
