---
title: ha-bridge search
description: Arguments and flags for every ha-bridge search command.
sidebar:
  label: search
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge search` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge search`

```text
DESCRIPTION
  Search Home Assistant entities, devices and areas, and ha-bridge commands

USAGE
  ha-bridge search [flags] <query...>

ARGUMENTS
  query... string    Words to search for, such as kitchen lamp

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --kind choice            Only return this kind; repeat for more (default: all) (choices: entity, device, area, command)
  --domain string          Only entities in this domain, such as light, and the devices, areas and commands for it
  --area string            Only entities, devices and areas in this area, by ID or name
  --device-class string    Only entities with this device class, such as temperature, and their devices and areas
  --limit integer          Most results to show
  --page integer           Show this page of --limit results, starting at 1
  --json                   Print the results as JSON
```
