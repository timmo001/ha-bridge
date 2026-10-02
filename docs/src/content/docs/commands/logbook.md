---
title: ha-bridge logbook
description: Arguments and flags for every ha-bridge logbook command.
sidebar:
  label: logbook
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge logbook` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge logbook`

```text
DESCRIPTION
  Logbook actions

USAGE
  ha-bridge logbook <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logbook log`

```text
DESCRIPTION
  Add a logbook entry

USAGE
  ha-bridge logbook log [flags] <name> <message>

ARGUMENTS
  name string       Who or what the entry is about, such as Kitchen
  message string    What happened, such as is being used

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity-id string    Full entity ID to tie the entry to
  --domain string       Domain whose icon the entry shows
```
