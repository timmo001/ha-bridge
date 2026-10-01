---
title: Climate
description: Turn climate entities on and off, and set their HVAC mode, temperature, humidity and other modes.
---

`climate` (`cl`) has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge climate turn-on air_conditioner
ha-bridge climate turn-off air_conditioner
ha-bridge climate toggle air_conditioner
```

## HVAC mode

`hvac-mode` takes `off`, `heat`, `cool`, `heat_cool`, `auto`, `dry` or `fan_only`:

```bash
ha-bridge climate hvac-mode air_conditioner cool
```

## Temperature and humidity

`temperature` sets the target temperature, in your Home Assistant unit. `--hvac-mode` switches mode at the same time. For a range, set `--target-temp-low` and `--target-temp-high` together:

```bash
ha-bridge climate temperature air_conditioner 21.5
ha-bridge climate temperature air_conditioner 21.5 --hvac-mode heat
ha-bridge climate temperature thermostat --target-temp-low 18 --target-temp-high 23
```

`humidity` sets the target humidity in percent:

```bash
ha-bridge climate humidity dehumidifier 45
```

## Other modes

These take a mode from the entity's attributes: `preset_modes`, `fan_modes`, `swing_modes` and `swing_horizontal_modes`:

```bash
ha-bridge climate preset-mode air_conditioner away
ha-bridge climate fan-mode air_conditioner auto
ha-bridge climate swing-mode air_conditioner on
ha-bridge climate swing-horizontal-mode air_conditioner on
```

## Watching

`climate watch` prints the HVAC mode, fan mode and target temperature as bar JSON, now and on every change. See [Watching entities](/using/watching/#covers-and-climate).

## Actions

| Command | Home Assistant action |
| --- | --- |
| `climate turn-on` | `climate.turn_on` |
| `climate turn-off` | `climate.turn_off` |
| `climate toggle` | `climate.toggle` |
| `climate hvac-mode` | `climate.set_hvac_mode` |
| `climate temperature` | `climate.set_temperature` |
| `climate humidity` | `climate.set_humidity` |
| `climate preset-mode` | `climate.set_preset_mode` |
| `climate fan-mode` | `climate.set_fan_mode` |
| `climate swing-mode` | `climate.set_swing_mode` |
| `climate swing-horizontal-mode` | `climate.set_swing_horizontal_mode` |
