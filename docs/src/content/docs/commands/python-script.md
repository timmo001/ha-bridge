---
title: ha-bridge python_script
description: Arguments and flags for every ha-bridge python_script command.
sidebar:
  label: python_script
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge python_script` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge python_script`

```text
DESCRIPTION
  Python script actions

USAGE
  ha-bridge python_script <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge python_script run`

```text
DESCRIPTION
  Run one

USAGE
  ha-bridge python_script run [flags] <name>

ARGUMENTS
  name string    Name, without python_script.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --data string      Data to pass, as a JSON object, such as '{"room":"office"}'
  --response         Wait for the result and print it as JSON
```

## `ha-bridge python_script reload`

```text
DESCRIPTION
  Reload the python_script YAML configuration

USAGE
  ha-bridge python_script reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
