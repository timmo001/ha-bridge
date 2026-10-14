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

## `ha-bridge script config`

```text
DESCRIPTION
  Read and write script configs. Needs an admin token

USAGE
  ha-bridge script config <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge script config get`

Alias: `ha-bridge script config g`

```text
DESCRIPTION
  Print the config a script was loaded from, as YAML. --json adds its ID and whether it can be changed here

USAGE
  ha-bridge script config get [flags] <script>

ARGUMENTS
  script string    The script's entity ID, with or without script.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
```

## `ha-bridge script config create`

```text
DESCRIPTION
  Add a script to scripts.yaml once Home Assistant validates it, and print its ID

USAGE
  ha-bridge script config create [flags]

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --id string          Key for the new script, such as morning_lights (default: from its alias)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
```

## `ha-bridge script config update`

```text
DESCRIPTION
  Replace all of a script's config in scripts.yaml once Home Assistant validates it

USAGE
  ha-bridge script config update [flags] <script>

ARGUMENTS
  script string    The script's entity ID, with or without script.

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
```

## `ha-bridge script config delete`

```text
DESCRIPTION
  Remove a script from scripts.yaml, and its entity

USAGE
  ha-bridge script config delete [flags] <script>

ARGUMENTS
  script string    The script's entity ID, with or without script.

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge script config validate`

Alias: `ha-bridge script config v`

```text
DESCRIPTION
  Check a script config without saving it: Home Assistant's own checks, then any entity, action, device, area, floor or label it names that doesn't exist. Exits 1 when it finds a problem

USAGE
  ha-bridge script config validate [flags]

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --file, -f string    YAML or JSON file holding the config, or - for stdin
  --json               Print as JSON
```
