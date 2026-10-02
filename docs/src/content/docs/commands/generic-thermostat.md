---
title: ha-bridge generic_thermostat
description: Arguments and flags for every ha-bridge generic_thermostat command.
sidebar:
  label: generic_thermostat
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge generic_thermostat` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge generic_thermostat`

```text
DESCRIPTION
  Generic thermostat actions

USAGE
  ha-bridge generic_thermostat <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge generic_thermostat reload`

```text
DESCRIPTION
  Reload the generic_thermostat YAML configuration

USAGE
  ha-bridge generic_thermostat reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
