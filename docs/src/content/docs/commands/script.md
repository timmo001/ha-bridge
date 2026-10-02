---
title: ha-bridge script
description: Arguments and flags for every ha-bridge script command.
sidebar:
  label: script
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge script` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge script`

```text
DESCRIPTION
  Script actions

USAGE
  ha-bridge script <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge script turn-on`

Alias: `ha-bridge script on`

```text
DESCRIPTION
  Start the script without waiting for it

USAGE
  ha-bridge script turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the script. prefix; repeat for more (optional)

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Script variables as a JSON object, such as '{"room":"office"}'
  --entity string       Entity ID or name; repeat for more
  --device string       Device ID or name; repeat for more
  --area string         Area ID or name; repeat for more
  --floor string        Floor ID or name; repeat for more
  --label string        Label ID or name; repeat for more
```

## `ha-bridge script turn-off`

Alias: `ha-bridge script off`

```text
DESCRIPTION
  Stop the script

USAGE
  ha-bridge script turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the script. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge script toggle`

Alias: `ha-bridge script t`

```text
DESCRIPTION
  Start or stop the script

USAGE
  ha-bridge script toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the script. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge script run`

```text
DESCRIPTION
  Run the script, wait for it to finish and print its response as JSON

USAGE
  ha-bridge script run [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the script. prefix; repeat for more (optional)

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Script variables as a JSON object, such as '{"room":"office"}'
  --entity string       Entity ID or name; repeat for more
  --device string       Device ID or name; repeat for more
  --area string         Area ID or name; repeat for more
  --floor string        Floor ID or name; repeat for more
  --label string        Label ID or name; repeat for more
```

## `ha-bridge script reload`

```text
DESCRIPTION
  Reload the script YAML configuration

USAGE
  ha-bridge script reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
