---
title: Commands
description: Every Home Assistant Bridge command, alias, argument and flag, generated from the CLI's help.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every command and its help, as `ha-bridge <command> --help` prints it. Each command also accepts the global flags listed under [`ha-bridge`](#ha-bridge).

## `ha-bridge`

```text
DESCRIPTION
  One shared Home Assistant connection for your machine, served to local apps over a single socket

USAGE
  ha-bridge <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)

GLOBAL FLAGS
  --help, -h                                                          Show help information
  --version, -v                                                       Show version information
  --wizard                                                            Start wizard mode for a command
  --completions <bash|zsh|fish|sh>                                    Print shell completion script (choices: bash, zsh, fish, sh)
  --log-level <all|trace|debug|info|warn|warning|error|fatal|none>    Sets the minimum log level (choices: all, trace, debug, info, warn, warning, error, fatal, none)

SUBCOMMANDS
  serve               Hold the shared Home Assistant connection and serve it on the bridge socket
  setup               Set the Home Assistant URL and access token
  watch, w            Watch entities through the bridge
  assist_satellite, as Assist satellite actions
  input_boolean, ib   Input boolean actions
  input_number, in    Input number actions
  light, l            Light actions
  switch, s           Switch actions
  cover, c            Cover actions
  climate, cl         Climate actions
  camera              Camera actions
```

## `ha-bridge serve`

```text
DESCRIPTION
  Hold the shared Home Assistant connection and serve it on the bridge socket

USAGE
  ha-bridge serve [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge setup`

```text
DESCRIPTION
  Set the Home Assistant URL and access token

USAGE
  ha-bridge setup [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge watch`

Alias: `ha-bridge w`

```text
DESCRIPTION
  Watch entities through the bridge

USAGE
  ha-bridge watch <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge watch entity`

Alias: `ha-bridge watch e`

```text
DESCRIPTION
  Print an entity's state now and on every change

USAGE
  ha-bridge watch entity [flags] <entity_id>

ARGUMENTS
  entity_id string    Entity to watch, for example light.office

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --bar-json              Print one bar JSON object per state
  --icon string           Text to show instead of the state
  --text-on string        Text appended when the entity is on
  --text-off string       Text appended when the entity is off
  --tooltip-on string     Tooltip when the entity is on
  --tooltip-off string    Tooltip when the entity is off
  --class-on string       Class when the entity is on
  --class-off string      Class when the entity is off
```

## `ha-bridge assist_satellite`

Alias: `ha-bridge as`

```text
DESCRIPTION
  Assist satellite actions

USAGE
  ha-bridge assist_satellite <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge assist_satellite announce`

Alias: `ha-bridge assist_satellite a`

```text
DESCRIPTION
  Announce a message on an area's satellites

USAGE
  ha-bridge assist_satellite announce [flags] <area_id> <message>

ARGUMENTS
  area_id string    Area to announce in
  message string    Message to announce

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean`

Alias: `ha-bridge ib`

```text
DESCRIPTION
  Input boolean actions

USAGE
  ha-bridge input_boolean <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean turn-on`

Alias: `ha-bridge input_boolean on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge input_boolean turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean turn-off`

Alias: `ha-bridge input_boolean off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge input_boolean turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean toggle`

Alias: `ha-bridge input_boolean t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge input_boolean toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the input_boolean. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_boolean reload`

```text
DESCRIPTION
  Reload input_boolean helpers from YAML

USAGE
  ha-bridge input_boolean reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number`

Alias: `ha-bridge in`

```text
DESCRIPTION
  Input number actions

USAGE
  ha-bridge input_number <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number increment`

```text
DESCRIPTION
  Raise the value by one step

USAGE
  ha-bridge input_number increment [flags] <name>

ARGUMENTS
  name string    Entity name without the input_number. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number decrement`

```text
DESCRIPTION
  Lower the value by one step

USAGE
  ha-bridge input_number decrement [flags] <name>

ARGUMENTS
  name string    Entity name without the input_number. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number set-value`

```text
DESCRIPTION
  Set the value

USAGE
  ha-bridge input_number set-value [flags] <name> <value>

ARGUMENTS
  name string     Entity name without the input_number. prefix
  value string    New value

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge input_number reload`

```text
DESCRIPTION
  Reload input_number helpers from YAML

USAGE
  ha-bridge input_number reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge light`

Alias: `ha-bridge l`

```text
DESCRIPTION
  Light actions

USAGE
  ha-bridge light <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge light turn-on`

Alias: `ha-bridge light on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge light turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the light. prefix

FLAGS
  --socket string                 Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --transition string             Transition time in seconds
  --flash choice                  Flash the light (choices: short, long)
  --brightness string             Brightness from 0 to 255
  --brightness-pct string         Brightness from 0 to 100 percent
  --brightness-step string        Change the brightness by -255 to 255
  --brightness-step-pct string    Change the brightness by -100 to 100 percent
  --profile string                Light profile, for example relax
  --color-name string             Colour name, for example red
  --color-temp-kelvin string      Colour temperature in kelvin
  --hs-color string               Hue and saturation, for example 300,70
  --rgb-color string              Red, green and blue, for example 255,100,100
  --rgbw-color string             Red, green, blue and white, for example 255,100,100,50
  --rgbww-color string            Red, green, blue, cold and warm white, for example 255,100,100,50,70
  --xy-color string               XY colour, for example 0.52,0.43
  --white string                  true for white mode, or a white brightness from 0 to 255
  --effect string                 Effect from the light's effect_list
```

## `ha-bridge light turn-off`

Alias: `ha-bridge light off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge light turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the light. prefix

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --transition string    Transition time in seconds
  --flash choice         Flash the light (choices: short, long)
```

## `ha-bridge light toggle`

Alias: `ha-bridge light t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge light toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the light. prefix

FLAGS
  --socket string                 Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --transition string             Transition time in seconds
  --flash choice                  Flash the light (choices: short, long)
  --brightness string             Brightness from 0 to 255
  --brightness-pct string         Brightness from 0 to 100 percent
  --brightness-step string        Change the brightness by -255 to 255
  --brightness-step-pct string    Change the brightness by -100 to 100 percent
  --profile string                Light profile, for example relax
  --color-name string             Colour name, for example red
  --color-temp-kelvin string      Colour temperature in kelvin
  --hs-color string               Hue and saturation, for example 300,70
  --rgb-color string              Red, green and blue, for example 255,100,100
  --rgbw-color string             Red, green, blue and white, for example 255,100,100,50
  --rgbww-color string            Red, green, blue, cold and warm white, for example 255,100,100,50,70
  --xy-color string               XY colour, for example 0.52,0.43
  --white string                  true for white mode, or a white brightness from 0 to 255
  --effect string                 Effect from the light's effect_list
```

## `ha-bridge switch`

Alias: `ha-bridge s`

```text
DESCRIPTION
  Switch actions

USAGE
  ha-bridge switch <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge switch turn-on`

Alias: `ha-bridge switch on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge switch turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the switch. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge switch turn-off`

Alias: `ha-bridge switch off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge switch turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the switch. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge switch toggle`

Alias: `ha-bridge switch t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge switch toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the switch. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover`

Alias: `ha-bridge c`

```text
DESCRIPTION
  Cover actions

USAGE
  ha-bridge cover <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover watch`

Alias: `ha-bridge cover w`

```text
DESCRIPTION
  Print bar JSON now and on every change

USAGE
  ha-bridge cover watch [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover open`

```text
DESCRIPTION
  Open the cover

USAGE
  ha-bridge cover open [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover close`

```text
DESCRIPTION
  Close the cover

USAGE
  ha-bridge cover close [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover toggle`

```text
DESCRIPTION
  Open or close the cover

USAGE
  ha-bridge cover toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover stop`

```text
DESCRIPTION
  Stop the cover

USAGE
  ha-bridge cover stop [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover position`

```text
DESCRIPTION
  Set the position

USAGE
  ha-bridge cover position [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the cover. prefix
  position string    Position from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --speed string     Speed, one of the cover's supported_speeds
```

## `ha-bridge cover open-tilt`

```text
DESCRIPTION
  Open the tilt

USAGE
  ha-bridge cover open-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover close-tilt`

```text
DESCRIPTION
  Close the tilt

USAGE
  ha-bridge cover close-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover toggle-tilt`

```text
DESCRIPTION
  Open or close the tilt

USAGE
  ha-bridge cover toggle-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover stop-tilt`

```text
DESCRIPTION
  Stop the tilt

USAGE
  ha-bridge cover stop-tilt [flags] <name>

ARGUMENTS
  name string    Entity name without the cover. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge cover tilt-position`

```text
DESCRIPTION
  Set the tilt position

USAGE
  ha-bridge cover tilt-position [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the cover. prefix
  position string    Position from 0 to 100

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate`

Alias: `ha-bridge cl`

```text
DESCRIPTION
  Climate actions

USAGE
  ha-bridge climate <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate watch`

Alias: `ha-bridge climate w`

```text
DESCRIPTION
  Print bar JSON now and on every change

USAGE
  ha-bridge climate watch [flags] <name>

ARGUMENTS
  name string    Entity name without the climate. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge climate fan-mode`

```text
DESCRIPTION
  Set the fan mode

USAGE
  ha-bridge climate fan-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the climate. prefix
  mode string    Fan mode, for example 1 or auto

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera`

```text
DESCRIPTION
  Camera actions

USAGE
  ha-bridge camera <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge camera snapshot`

```text
DESCRIPTION
  Save the camera's current image

USAGE
  ha-bridge camera snapshot [flags] <name> <output>

ARGUMENTS
  name string      Entity name without the camera. prefix
  output string    File to write the image to

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
