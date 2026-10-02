---
title: ha-bridge ai_task
description: Arguments and flags for every ha-bridge ai_task command.
sidebar:
  label: ai_task
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge ai_task` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
  ha-bridge ai_task generate-data [flags] <task_name> <instructions> [<entity_id...>]

ARGUMENTS
  task_name string       Short name for the task
  instructions string    What to generate
  entity_id... string    Entity ID, with or without the ai_task. prefix; repeat for more (optional)

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --structure string    Output structure as a JSON object of selectors
  --entity string       Entity ID or name; repeat for more
  --device string       Device ID or name; repeat for more
  --area string         Area ID or name; repeat for more
  --floor string        Floor ID or name; repeat for more
  --label string        Label ID or name; repeat for more
```

## `ha-bridge ai_task generate-image`

```text
DESCRIPTION
  Generate an image and print its details

USAGE
  ha-bridge ai_task generate-image [flags] <task_name> <instructions> [<entity_id...>]

ARGUMENTS
  task_name string       Short name for the task
  instructions string    What to generate
  entity_id... string    Entity ID, with or without the ai_task. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
