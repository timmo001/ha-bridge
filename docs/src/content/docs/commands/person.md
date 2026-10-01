---
title: ha-bridge person
description: Arguments and flags for every ha-bridge person command.
sidebar:
  label: person
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge person` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge person`

```text
DESCRIPTION
  Person actions

USAGE
  ha-bridge person <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge person reload`

```text
DESCRIPTION
  Reload person helpers from YAML

USAGE
  ha-bridge person reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
