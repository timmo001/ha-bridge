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

## Input numbers

`input_number` (`in`) raises or lowers a helper by its step, or sets a value:

```bash
ha-bridge input_number increment target_temperature
ha-bridge input_number decrement target_temperature
ha-bridge input_number set-value target_temperature 23.5
```

## Covers

`cover` (`c`) sets a position or tilt position from 0 to 100, or closes the cover:

```bash
ha-bridge cover position curtain 30
ha-bridge cover tilt-position office_blind 40
ha-bridge cover close curtain
```

## Climate

`climate` (`cl`) sets a fan mode. Use one of the modes the entity lists in its `fan_modes` attribute:

```bash
ha-bridge climate fan-mode air_conditioner auto
```

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
| `input_number increment`, `decrement`, `set-value` | `input_number.increment`, `decrement`, `set_value` | `input_number.<name>` |
| `cover position`, `tilt-position`, `close` | `cover.set_cover_position`, `set_cover_tilt_position`, `close_cover` | `cover.<name>` |
| `climate fan-mode` | `climate.set_fan_mode` | `climate.<name>` |
| `assist_satellite announce` | `assist_satellite.announce` | `area_id` |
| `camera snapshot` | Camera proxy image | `camera.<name>` |

Any other action can be called from your own app with [`CallAction`](/libraries/).
