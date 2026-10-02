---
title: ha-bridge template
description: Arguments and flags for every ha-bridge template command.
sidebar:
  label: template
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge template` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge template`

```text
DESCRIPTION
  Template actions

USAGE
  ha-bridge template <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge template reload`

```text
DESCRIPTION
  Reload the template YAML configuration

USAGE
  ha-bridge template reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
