---
title: ha-bridge condition
description: Arguments and flags for every ha-bridge condition command.
sidebar:
  label: condition
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge condition` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge condition`

```text
DESCRIPTION
  Check automation conditions

USAGE
  ha-bridge condition <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge condition test`

Alias: `ha-bridge condition t`

```text
DESCRIPTION
  Print whether the conditions pass, as true or false. Needs an admin token

USAGE
  ha-bridge condition test [flags] <condition>

ARGUMENTS
  condition string    Condition config as YAML or JSON, such as '{condition: state, entity_id: sun.sun, state: above_horizon}'

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Variables as a JSON object, such as '{"room":"office"}'
```

## `ha-bridge condition watch`

Alias: `ha-bridge condition w`

```text
DESCRIPTION
  Print whether the conditions pass, then each change, as true or false

USAGE
  ha-bridge condition watch [flags] <condition>

ARGUMENTS
  condition string    Condition config as YAML or JSON, such as '{condition: state, entity_id: sun.sun, state: above_horizon}'

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
