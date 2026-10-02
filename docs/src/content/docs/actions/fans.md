---
title: Fans
description: Turn fans on and off and set their speed, preset, oscillation and direction.
---

`fan` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`). `turn-on` takes `--percentage` from 0 to 100 and `--preset-mode`, one of the fan's `preset_modes`:

```bash
ha-bridge fan turn-on desk --percentage 40
ha-bridge fan turn-off desk
```

## Speed and settings

```bash
ha-bridge fan percentage 60 desk
ha-bridge fan increase-speed desk
ha-bridge fan decrease-speed desk --step 10
ha-bridge fan preset-mode sleep desk
ha-bridge fan oscillate on desk
ha-bridge fan direction reverse desk
```

`increase-speed` and `decrease-speed` use the fan's own step unless you pass `--step` in percent. A percentage of 0 turns the fan off.

| Command | Home Assistant action |
| --- | --- |
| `fan turn-on` | `fan.turn_on` |
| `fan turn-off` | `fan.turn_off` |
| `fan toggle` | `fan.toggle` |
| `fan percentage` | `fan.set_percentage` |
| `fan increase-speed` | `fan.increase_speed` |
| `fan decrease-speed` | `fan.decrease_speed` |
| `fan preset-mode` | `fan.set_preset_mode` |
| `fan oscillate` | `fan.oscillate` |
| `fan direction` | `fan.set_direction` |

See [`ha-bridge fan`](/commands/fan) for every argument and flag.
