---
title: ha-bridge wake_on_lan
description: Arguments and flags for every ha-bridge wake_on_lan command.
sidebar:
  label: wake_on_lan
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge wake_on_lan` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge wake_on_lan`

Alias: `ha-bridge wol`

```text
DESCRIPTION
  Wake on LAN actions

USAGE
  ha-bridge wake_on_lan <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge wake_on_lan send-magic-packet`

Alias: `ha-bridge wake_on_lan wake`

```text
DESCRIPTION
  Wake a device

USAGE
  ha-bridge wake_on_lan send-magic-packet [flags] <mac>

ARGUMENTS
  mac string    MAC address, such as aa:bb:cc:dd:ee:ff

FLAGS
  --socket string               Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --secureon-password string    SecureOn password
  --broadcast-address string    Address to send to (default: the whole network)
  --broadcast-port integer      Port to send to (default: 9)
```
