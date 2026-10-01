---
title: ha-bridge conversation
description: Arguments and flags for every ha-bridge conversation command.
sidebar:
  label: conversation
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge conversation` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands#global-flags).

## `ha-bridge conversation`

```text
DESCRIPTION
  Conversation actions

USAGE
  ha-bridge conversation <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge conversation process`

```text
DESCRIPTION
  Send text to an agent and print the reply

USAGE
  ha-bridge conversation process [flags] <text>

ARGUMENTS
  text string    What to say, such as "turn on the desk light"

FLAGS
  --socket string             Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --language string           Language, such as en
  --agent-id string           Conversation agent (default: Home Assistant)
  --conversation-id string    Continue this conversation
```

## `ha-bridge conversation reload`

```text
DESCRIPTION
  Reload the agent's intents

USAGE
  ha-bridge conversation reload [flags]

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --language string    Language, such as en
  --agent-id string    Conversation agent (default: Home Assistant)
```
