---
title: ha-bridge homeassistant
description: Arguments and flags for every ha-bridge homeassistant command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge homeassistant` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge homeassistant`

```text
DESCRIPTION
  Home Assistant actions

USAGE
  ha-bridge homeassistant <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant turn-on`

Alias: `ha-bridge homeassistant on`

```text
DESCRIPTION
  Turn on entities of any domain

USAGE
  ha-bridge homeassistant turn-on [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Full entity ID, such as light.desk; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant turn-off`

Alias: `ha-bridge homeassistant off`

```text
DESCRIPTION
  Turn off entities of any domain

USAGE
  ha-bridge homeassistant turn-off [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Full entity ID, such as light.desk; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant toggle`

Alias: `ha-bridge homeassistant t`

```text
DESCRIPTION
  Toggle entities of any domain

USAGE
  ha-bridge homeassistant toggle [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Full entity ID, such as light.desk; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant update-entity`

```text
DESCRIPTION
  Refresh entities now

USAGE
  ha-bridge homeassistant update-entity [flags] <entity_id...>

ARGUMENTS
  entity_id... string    Full entity ID, such as light.desk; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant restart`

```text
DESCRIPTION
  Restart Home Assistant

USAGE
  ha-bridge homeassistant restart [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --safe-mode        Restart in safe mode, without custom integrations
```

## `ha-bridge homeassistant stop`

```text
DESCRIPTION
  Stop Home Assistant

USAGE
  ha-bridge homeassistant stop [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant check-config`

```text
DESCRIPTION
  Check the configuration files

USAGE
  ha-bridge homeassistant check-config [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant reload-core-config`

```text
DESCRIPTION
  Reload the core configuration, such as location and customisations

USAGE
  ha-bridge homeassistant reload-core-config [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant reload-custom-templates`

```text
DESCRIPTION
  Reload custom Jinja templates

USAGE
  ha-bridge homeassistant reload-custom-templates [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant reload-all`

```text
DESCRIPTION
  Reload all YAML configuration

USAGE
  ha-bridge homeassistant reload-all [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant reload-config-entry`

```text
DESCRIPTION
  Reload an integration's config entry

USAGE
  ha-bridge homeassistant reload-config-entry [flags] <entry_id>

ARGUMENTS
  entry_id string    Config entry ID

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant save-persistent-states`

```text
DESCRIPTION
  Save states that are restored after a restart

USAGE
  ha-bridge homeassistant save-persistent-states [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge homeassistant set-location`

```text
DESCRIPTION
  Set the home location

USAGE
  ha-bridge homeassistant set-location [flags] <latitude> <longitude>

ARGUMENTS
  latitude number     Latitude from -90 to 90
  longitude number    Longitude from -180 to 180

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --elevation integer    Elevation in metres
```
