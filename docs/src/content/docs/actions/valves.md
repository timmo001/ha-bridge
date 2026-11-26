---
title: Valves
description: Open, close and stop valves, and set their position.
---

`valve` opens, closes, toggles or stops a valve, and sets its position from 0 to 100:

```bash
ha-bridge valve open garden
ha-bridge valve close garden
ha-bridge valve toggle garden
ha-bridge valve stop garden
ha-bridge valve position 50 garden
```

`increase-position` and `decrease-position` move it by a step, 10 unless `--step` says otherwise. Quick steps add up while the valve is still moving; see [Stepping a value](/actions#stepping-a-value):

```bash
ha-bridge valve increase-position --step 5 garden
```

| Command | Home Assistant action |
| --- | --- |
| `valve open` | `valve.open_valve` |
| `valve close` | `valve.close_valve` |
| `valve toggle` | `valve.toggle` |
| `valve stop` | `valve.stop_valve` |
| `valve position` | `valve.set_valve_position` |
| `valve increase-position`, `valve decrease-position` | `valve.set_valve_position`, from the current position |

See [`ha-bridge valve`](/commands/valve) for every argument and flag.
