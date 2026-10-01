---
title: ha-bridge ai_task
description: Arguments and flags for every ha-bridge ai_task command.
sidebar:
  label: ai_task
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge ai_task` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge ai_task`

```text
DESCRIPTION
  AI task actions

USAGE
  ha-bridge ai_task <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge ai_task generate-data`

```text
DESCRIPTION
  Generate data and print it as JSON

USAGE
  ha-bridge ai_task generate-data [flags] <task_name> <instructions>

ARGUMENTS
  task_name string       Short name for the task
  instructions string    What to generate

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string       AI task entity name without ai_task. (default: the preferred one)
  --structure string    Output structure as a JSON object of selectors
```

## `ha-bridge ai_task generate-image`

```text
DESCRIPTION
  Generate an image and print its details

USAGE
  ha-bridge ai_task generate-image [flags] <name> <task_name> <instructions>

ARGUMENTS
  name string            Entity name without the ai_task. prefix
  task_name string       Short name for the task
  instructions string    What to generate

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
