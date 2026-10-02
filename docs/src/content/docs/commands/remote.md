---
title: ha-bridge remote
description: Arguments and flags for every ha-bridge remote command.
sidebar:
  label: remote
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge remote` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge remote`

```text
DESCRIPTION
  Remote actions

USAGE
  ha-bridge remote <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge remote turn-on`

Alias: `ha-bridge remote on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge remote turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --activity string    Activity, one of the remote's activity_list
  --entity string      Entity ID or name; repeat for more
  --device string      Device ID or name; repeat for more
  --area string        Area ID or name; repeat for more
  --floor string       Floor ID or name; repeat for more
  --label string       Label ID or name; repeat for more
```

## `ha-bridge remote turn-off`

Alias: `ha-bridge remote off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge remote turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge remote toggle`

Alias: `ha-bridge remote t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge remote toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge remote send-command`

```text
DESCRIPTION
  Send commands

USAGE
  ha-bridge remote send-command [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --command string          Command; repeat for a sequence
  --remote-device string    Device the command is for, as the remote's integration names it
  --num-repeats integer     Times to repeat the commands (default: 1)
  --delay-secs number       Seconds between commands (default: 0.4)
  --hold-secs number        Seconds to hold each command (default: 0)
  --entity string           Entity ID or name; repeat for more
  --device string           Device ID or name; repeat for more
  --area string             Area ID or name; repeat for more
  --floor string            Floor ID or name; repeat for more
  --label string            Label ID or name; repeat for more
```

## `ha-bridge remote learn-command`

```text
DESCRIPTION
  Learn commands from a physical remote

USAGE
  ha-bridge remote learn-command [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --command string          Name for a command to learn; repeat for more
  --remote-device string    Device the command is for, as the remote's integration names it
  --command-type choice     Command type (default: ir) (choices: ir, rf)
  --alternative             Learn an alternative code for the command
  --timeout integer         Seconds to wait for each command
  --entity string           Entity ID or name; repeat for more
  --device string           Device ID or name; repeat for more
  --area string             Area ID or name; repeat for more
  --floor string            Floor ID or name; repeat for more
  --label string            Label ID or name; repeat for more
```

## `ha-bridge remote delete-command`

```text
DESCRIPTION
  Delete learned commands

USAGE
  ha-bridge remote delete-command [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the remote. prefix; repeat for more (optional)

FLAGS
  --socket string           Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --command string          Command; repeat for a sequence
  --remote-device string    Device the command is for, as the remote's integration names it
  --entity string           Entity ID or name; repeat for more
  --device string           Device ID or name; repeat for more
  --area string             Area ID or name; repeat for more
  --floor string            Floor ID or name; repeat for more
  --label string            Label ID or name; repeat for more
```
