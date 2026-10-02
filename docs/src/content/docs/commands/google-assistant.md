---
title: ha-bridge google_assistant
description: Arguments and flags for every ha-bridge google_assistant command.
sidebar:
  label: google_assistant
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge google_assistant` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge google_assistant`

```text
DESCRIPTION
  Google Assistant actions

USAGE
  ha-bridge google_assistant <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge google_assistant request-sync`

```text
DESCRIPTION
  Ask Google to sync its devices

USAGE
  ha-bridge google_assistant request-sync [flags]

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --agent-user-id string    Google agent user ID (default: the token's user)
```
