---
title: ha-bridge vacuum
description: Arguments and flags for every ha-bridge vacuum command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge vacuum` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge vacuum`

```text
DESCRIPTION
  Vacuum actions

USAGE
  ha-bridge vacuum <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum start`

```text
DESCRIPTION
  Start cleaning

USAGE
  ha-bridge vacuum start [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum pause`

```text
DESCRIPTION
  Pause cleaning

USAGE
  ha-bridge vacuum pause [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum start-pause`

```text
DESCRIPTION
  Start or pause cleaning

USAGE
  ha-bridge vacuum start-pause [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum stop`

```text
DESCRIPTION
  Stop cleaning

USAGE
  ha-bridge vacuum stop [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum return-to-base`

```text
DESCRIPTION
  Go back to the dock

USAGE
  ha-bridge vacuum return-to-base [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum locate`

```text
DESCRIPTION
  Make the vacuum sound so you can find it

USAGE
  ha-bridge vacuum locate [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum clean-spot`

```text
DESCRIPTION
  Clean the spot it's on

USAGE
  ha-bridge vacuum clean-spot [flags] <name>

ARGUMENTS
  name string    Entity name without the vacuum. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum clean-area`

```text
DESCRIPTION
  Clean areas

USAGE
  ha-bridge vacuum clean-area [flags] <name> <area_id...>

ARGUMENTS
  name string          Entity name without the vacuum. prefix
  area_id... string    Area ID to clean; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum fan-speed`

```text
DESCRIPTION
  Set the fan speed

USAGE
  ha-bridge vacuum fan-speed [flags] <name> <speed>

ARGUMENTS
  name string     Entity name without the vacuum. prefix
  speed string    One of the vacuum's fan_speed_list

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge vacuum send-command`

```text
DESCRIPTION
  Send a raw command

USAGE
  ha-bridge vacuum send-command [flags] <name> <command>

ARGUMENTS
  name string       Entity name without the vacuum. prefix
  command string    Command the integration understands

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --params string    Parameters as JSON, such as {"speed":2}
```
