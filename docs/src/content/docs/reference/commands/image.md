---
title: ha-bridge image
description: Arguments and flags for every ha-bridge image command.
sidebar:
  label: image
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge image` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge image`

```text
DESCRIPTION
  Image actions

USAGE
  ha-bridge image <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge image snapshot`

```text
DESCRIPTION
  Save the image on the Home Assistant host

USAGE
  ha-bridge image snapshot [flags] <name> <filename>

ARGUMENTS
  name string        Entity name without the image. prefix
  filename string    Path on the Home Assistant host to save to

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
