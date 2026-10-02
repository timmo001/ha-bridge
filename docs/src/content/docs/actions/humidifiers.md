---
title: Humidifiers and water heaters
description: Control humidifiers and water heaters.
---

## Humidifiers

`humidifier` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`), and sets the mode or target humidity:

```bash
ha-bridge humidifier turn-on bedroom
ha-bridge humidifier mode sleep bedroom
ha-bridge humidifier humidity 45 bedroom
```

The mode is one of the humidifier's `available_modes`.

## Water heaters

`water_heater` has `turn-on` (`on`) and `turn-off` (`off`), and sets the temperature, operation mode or away mode:

```bash
ha-bridge water_heater temperature 55 tank
ha-bridge water_heater temperature 60 tank --operation-mode performance
ha-bridge water_heater operation-mode eco tank
ha-bridge water_heater away-mode on tank
```

The temperature is in the entity's unit, and the operation mode is one of its `operation_list`.

| Command | Home Assistant action |
| --- | --- |
| `humidifier turn-on`, `turn-off`, `toggle` | `humidifier.turn_on`, `turn_off`, `toggle` |
| `humidifier mode` | `humidifier.set_mode` |
| `humidifier humidity` | `humidifier.set_humidity` |
| `water_heater turn-on`, `turn-off` | `water_heater.turn_on`, `turn_off` |
| `water_heater temperature` | `water_heater.set_temperature` |
| `water_heater operation-mode` | `water_heater.set_operation_mode` |
| `water_heater away-mode` | `water_heater.set_away_mode` |

See [`ha-bridge humidifier`](/commands/humidifier) and [`ha-bridge water_heater`](/commands/water-heater) for every argument and flag.
