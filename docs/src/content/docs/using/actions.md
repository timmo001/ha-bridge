---
title: Actions
description: Control lights, switches, covers, climate entities, input helpers and assist satellites from the command line.
---

Action commands send one Home Assistant action through the bridge and exit. They exit with status 1 and print the error when the bridge isn't running or Home Assistant rejects the action.

## Entity names

Action commands take the entity name **without** its domain, because the command already says which domain it acts on:

```bash
# Acts on light.bedroom_lamp
ha-bridge light turn-on bedroom_lamp
```

[Watch commands](/using/watching/) are different: `watch entity` takes the full entity ID.

## Lights, switches and input booleans

`light` (`l`), `switch` (`s`) and `input_boolean` (`ib`) each have `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge light toggle bedroom_lamp
ha-bridge switch turn-on desk_fan
ha-bridge input_boolean turn-off guest_mode

# The same, with aliases for keyboard shortcuts
ha-bridge l t bedroom_lamp
ha-bridge s on desk_fan
ha-bridge ib off guest_mode
```

### Light options

`light turn-on` and `light toggle` take the same options as Home Assistant's `light.turn_on`. Pass colours as comma-separated numbers:

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

Use at most one brightness flag and one colour flag (`--color-temp-kelvin`, the colour flags, `--white` and `--profile`). `light turn-off` takes `--transition` and `--flash`.

## Input numbers

`input_number` (`in`) raises or lowers a helper by its step, or sets a value:

```bash
ha-bridge input_number increment target_temperature
ha-bridge input_number decrement target_temperature
ha-bridge input_number set-value target_temperature 23.5
```

`input_boolean reload` and `input_number reload` reload those helpers from YAML. They act on the whole domain, so they take no name:

```bash
ha-bridge input_boolean reload
ha-bridge input_number reload
```

## Covers

`cover` (`c`) opens, closes, toggles or stops a cover or its tilt, and sets a position or tilt position from 0 to 100:

```bash
ha-bridge cover open curtain
ha-bridge cover close curtain
ha-bridge cover toggle curtain
ha-bridge cover stop curtain
ha-bridge cover position curtain 30
ha-bridge cover open-tilt office_blind
ha-bridge cover close-tilt office_blind
ha-bridge cover toggle-tilt office_blind
ha-bridge cover stop-tilt office_blind
ha-bridge cover tilt-position office_blind 40
```

`open`, `close` and `position` take `--speed` for covers that list `supported_speeds`:

```bash
ha-bridge cover open curtain --speed fast
```

## Climate

`climate` (`cl`) turns a climate entity on or off and sets its HVAC mode, target temperature, humidity and other modes:

```bash
ha-bridge climate turn-on air_conditioner
ha-bridge climate turn-off air_conditioner
ha-bridge climate toggle air_conditioner
ha-bridge climate hvac-mode air_conditioner cool
ha-bridge climate temperature air_conditioner 21.5
ha-bridge climate temperature air_conditioner 21.5 --hvac-mode heat
ha-bridge climate temperature thermostat --target-temp-low 18 --target-temp-high 23
ha-bridge climate humidity dehumidifier 45
ha-bridge climate preset-mode air_conditioner away
ha-bridge climate fan-mode air_conditioner auto
ha-bridge climate swing-mode air_conditioner on
ha-bridge climate swing-horizontal-mode air_conditioner on
```

`hvac-mode` takes `off`, `heat`, `cool`, `heat_cool`, `auto`, `dry` or `fan_only`. Temperatures are in your Home Assistant unit. For a range, set `--target-temp-low` and `--target-temp-high` together. The other modes come from the entity's attributes: `preset_modes`, `fan_modes`, `swing_modes` and `swing_horizontal_modes`.

## Assist satellites

`assist_satellite announce` (`as a`) announces a message on every satellite in an area. Pass the **area ID**, then the message in quotes:

```bash
ha-bridge assist_satellite announce living_room "Dinner is ready"
```

## Camera snapshots

`camera snapshot` saves a camera's current image:

```bash
ha-bridge camera snapshot front_door /tmp/front-door.jpg
```

The image is written to a temporary file first and then renamed, so anything reading the file never sees a partial image. It's readable only by you (`0600`).

## Actions at a glance

| Command | Home Assistant action | Target |
| --- | --- | --- |
| `light turn-on`, `turn-off`, `toggle` | `light.turn_on`, `turn_off`, `toggle` | `light.<name>` |
| `switch turn-on`, `turn-off`, `toggle` | `switch.turn_on`, `turn_off`, `toggle` | `switch.<name>` |
| `input_boolean turn-on`, `turn-off`, `toggle` | `input_boolean.turn_on`, `turn_off`, `toggle` | `input_boolean.<name>` |
| `input_boolean reload` | `input_boolean.reload` | None |
| `input_number increment`, `decrement`, `set-value` | `input_number.increment`, `decrement`, `set_value` | `input_number.<name>` |
| `input_number reload` | `input_number.reload` | None |
| `cover open`, `close`, `toggle`, `stop` | `cover.open_cover`, `close_cover`, `toggle`, `stop_cover` | `cover.<name>` |
| `cover open-tilt`, `close-tilt`, `toggle-tilt`, `stop-tilt` | `cover.open_cover_tilt`, `close_cover_tilt`, `toggle_cover_tilt`, `stop_cover_tilt` | `cover.<name>` |
| `cover position`, `tilt-position` | `cover.set_cover_position`, `set_cover_tilt_position` | `cover.<name>` |
| `climate turn-on`, `turn-off`, `toggle` | `climate.turn_on`, `turn_off`, `toggle` | `climate.<name>` |
| `climate hvac-mode`, `temperature`, `humidity` | `climate.set_hvac_mode`, `set_temperature`, `set_humidity` | `climate.<name>` |
| `climate preset-mode`, `fan-mode`, `swing-mode`, `swing-horizontal-mode` | `climate.set_preset_mode`, `set_fan_mode`, `set_swing_mode`, `set_swing_horizontal_mode` | `climate.<name>` |
| `assist_satellite announce` | `assist_satellite.announce` | `area_id` |
| `camera snapshot` | Camera proxy image | `camera.<name>` |

Any other action can be called from your own app with [`CallAction`](/libraries/).
