---
title: ha-bridge siren
description: Arguments and flags for every ha-bridge siren command.
sidebar:
  label: siren
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge siren` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge siren`

```text
DESCRIPTION
  Siren actions

USAGE
  ha-bridge siren <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge siren turn-on`

Alias: `ha-bridge siren on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge siren turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the siren. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --tone string            Tone, one of the siren's available_tones
  --duration integer       Seconds to sound for
  --volume-level number    Volume from 0 to 1
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```

## `ha-bridge siren turn-off`

Alias: `ha-bridge siren off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge siren turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the siren. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge siren toggle`

Alias: `ha-bridge siren t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge siren toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the siren. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```
