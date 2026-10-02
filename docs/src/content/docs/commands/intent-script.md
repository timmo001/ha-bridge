---
title: ha-bridge intent_script
description: Arguments and flags for every ha-bridge intent_script command.
sidebar:
  label: intent_script
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge intent_script` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge intent_script`

```text
DESCRIPTION
  Intent script actions

USAGE
  ha-bridge intent_script <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge intent_script reload`

```text
DESCRIPTION
  Reload the intent_script YAML configuration

USAGE
  ha-bridge intent_script reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
