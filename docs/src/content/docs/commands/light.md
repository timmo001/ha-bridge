---
title: ha-bridge light
description: Arguments and flags for every ha-bridge light command.
sidebar:
  label: light
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge light` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

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
