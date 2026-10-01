---
title: ha-bridge script
description: Arguments and flags for every ha-bridge script command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge script` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  ha-bridge script turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the script. prefix

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Script variables as a JSON object, such as '{"room":"office"}'
```

## `ha-bridge script turn-off`

Alias: `ha-bridge script off`

```text
DESCRIPTION
  Stop the script

USAGE
  ha-bridge script turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the script. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge script toggle`

Alias: `ha-bridge script t`

```text
DESCRIPTION
  Start or stop the script

USAGE
  ha-bridge script toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the script. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge script run`

```text
DESCRIPTION
  Run the script, wait for it to finish and print its response as JSON

USAGE
  ha-bridge script run [flags] <name>

ARGUMENTS
  name string    Entity name without the script. prefix

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Script variables as a JSON object, such as '{"room":"office"}'
```

## `ha-bridge script reload`

```text
DESCRIPTION
  Reload script helpers from YAML

USAGE
  ha-bridge script reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
