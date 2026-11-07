---
title: ha-bridge agent
description: Arguments and flags for every ha-bridge agent command.
sidebar:
  label: agent
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge agent` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge agent`

```text
DESCRIPTION
  The Code Mode tools the OpenCode plugin registers

USAGE
  ha-bridge agent <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge agent tools`

```text
DESCRIPTION
  Print the Code Mode tools as JSON, and whether the bridge's socket exists

USAGE
  ha-bridge agent tools [flags]

FLAGS
  --json    Print as JSON (the only format)

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge agent call`

```text
DESCRIPTION
  Run a Code Mode tool with its input as JSON on stdin and print its result as JSON

USAGE
  ha-bridge agent call [flags] <tool>

ARGUMENTS
  tool choice    The tool to run, from ha-bridge agent tools

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
