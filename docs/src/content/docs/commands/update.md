---
title: ha-bridge update
description: Arguments and flags for every ha-bridge update command.
sidebar:
  label: update
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge update` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge update`

```text
DESCRIPTION
  Update actions

USAGE
  ha-bridge update <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update install`

```text
DESCRIPTION
  Install the update

USAGE
  ha-bridge update install [flags] <name>

ARGUMENTS
  name string    Entity name without the update. prefix

FLAGS
  --socket string     Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --version string    Version to install (default: the latest)
  --backup            Back up first, where the integration supports it
```

## `ha-bridge update skip`

```text
DESCRIPTION
  Skip this version

USAGE
  ha-bridge update skip [flags] <name>

ARGUMENTS
  name string    Entity name without the update. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge update clear-skipped`

```text
DESCRIPTION
  Stop skipping the version

USAGE
  ha-bridge update clear-skipped [flags] <name>

ARGUMENTS
  name string    Entity name without the update. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
