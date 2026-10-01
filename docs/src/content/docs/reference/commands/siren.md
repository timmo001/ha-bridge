---
title: ha-bridge siren
description: Arguments and flags for every ha-bridge siren command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge siren` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge siren turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the siren. prefix

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --tone string            Tone, one of the siren's available_tones
  --duration integer       Seconds to sound for
  --volume-level number    Volume from 0 to 1
```

## `ha-bridge siren turn-off`

Alias: `ha-bridge siren off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge siren turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the siren. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge siren toggle`

Alias: `ha-bridge siren t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge siren toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the siren. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
