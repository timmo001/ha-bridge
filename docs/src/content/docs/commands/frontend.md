---
title: ha-bridge frontend
description: Arguments and flags for every ha-bridge frontend command.
sidebar:
  label: frontend
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge frontend` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge frontend`

```text
DESCRIPTION
  Frontend actions

USAGE
  ha-bridge frontend <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge frontend set-theme`

```text
DESCRIPTION
  Set the default theme

USAGE
  ha-bridge frontend set-theme [flags]

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --name string         Default theme, or with --mode that mode's default; none goes back to Home Assistant's theme
  --name-dark string    Default theme in dark mode
  --mode choice         Mode that --name sets the default for (choices: light, dark)
```

## `ha-bridge frontend reload-themes`

```text
DESCRIPTION
  Reload themes from YAML

USAGE
  ha-bridge frontend reload-themes [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
