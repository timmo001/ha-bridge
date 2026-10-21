---
title: ha-bridge panel
description: Arguments and flags for every ha-bridge panel command.
sidebar:
  label: panel
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge panel` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge panel`

```text
DESCRIPTION
  Serve the dashboard panel in the browser, through the bridge socket

USAGE
  ha-bridge panel [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --host string      Address to listen on; anyone who can reach it can control Home Assistant
  --port integer     Port to listen on
  --data string      File the dashboards and settings are saved to (default: $XDG_CONFIG_HOME/ha-bridge/panel.json)
```
