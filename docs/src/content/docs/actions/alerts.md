---
title: Alerts and utility meters
description: Turn alerts on and off, and reset or calibrate utility meters.
---

## Alerts

`alert turn-off` (`off`) acknowledges an alert, so it stops notifying until it clears. `turn-on` (`on`) lets it notify again, and `toggle` (`t`) switches between them:

```bash
ha-bridge alert off garage_door
ha-bridge alert on --label Security
```

## Utility meters

`utility_meter reset` resets every tariff of the meters behind tariff selects. Without the `select.` prefix, positionals are select IDs:

```bash
ha-bridge utility_meter reset energy
ha-bridge utility_meter reset --area Utility
```

The bridge asks Home Assistant which selects the target matches, since the action only takes entity IDs.

`utility_meter calibrate` sets meter sensors to a reading. The reading comes before the sensor IDs:

```bash
ha-bridge utility_meter calibrate 1532.4 energy_peak
```

| Command | Home Assistant action |
| --- | --- |
| `alert turn-on`, `turn-off`, `toggle` | `alert.turn_on`, `turn_off`, `toggle` |
| `utility_meter reset` | `utility_meter.reset` |
| `utility_meter calibrate` | `utility_meter.calibrate` |
