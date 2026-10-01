---
title: Lights
description: Turn lights on and off, and set brightness, colour, effects and transitions.
---

`light` (`l`) has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge light turn-on desk_lamp
ha-bridge light turn-off desk_lamp
ha-bridge light toggle desk_lamp

# The same, with aliases
ha-bridge l on desk_lamp
ha-bridge l off desk_lamp
ha-bridge l t desk_lamp
```

| Command | Home Assistant action |
| --- | --- |
| `light turn-on` | `light.turn_on` |
| `light turn-off` | `light.turn_off` |
| `light toggle` | `light.toggle` |

## Brightness and colour

`turn-on` and `toggle` take the same options as Home Assistant's `light.turn_on`. Pass colours as comma-separated numbers:

```bash
ha-bridge light turn-on desk_lamp --brightness-pct 60 --color-temp-kelvin 3000
ha-bridge light turn-on desk_lamp --rgb-color 255,100,100 --transition 2
ha-bridge light turn-on desk_lamp --brightness-step-pct -10
ha-bridge light turn-on desk_lamp --effect rainbow
```

| Flag | Value |
| --- | --- |
| `--transition` | Seconds |
| `--brightness`, `--brightness-pct` | 0 to 255, or 0 to 100 percent |
| `--brightness-step`, `--brightness-step-pct` | -255 to 255, or -100 to 100 percent |
| `--color-temp-kelvin` | Kelvin |
| `--hs-color` | Hue 0 to 360 and saturation 0 to 100, such as `300,70` |
| `--rgb-color`, `--rgbw-color`, `--rgbww-color` | 3, 4 or 5 values from 0 to 255 |
| `--xy-color` | Two values from 0 to 1, such as `0.52,0.43` |
| `--color-name` | A colour name, such as `red` |
| `--white` | `true`, or a white brightness from 0 to 255 |
| `--profile` | A light profile, such as `relax` |
| `--effect` | One of the light's `effect_list` |
| `--flash` | `short` or `long` |

Use at most one brightness flag and one colour flag (`--color-temp-kelvin`, the colour flags, `--white` and `--profile`).

## Turning off

`turn-off` takes `--transition` and `--flash`:

```bash
ha-bridge light turn-off desk_lamp --transition 5
```

See [`ha-bridge light`](/commands/light) for every argument and flag.
