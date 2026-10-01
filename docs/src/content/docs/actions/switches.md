---
title: Switches
description: Turn switches on and off.
---

`switch` (`s`) has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge switch turn-on desk_fan
ha-bridge switch turn-off desk_fan
ha-bridge switch toggle desk_fan

# The same, with aliases
ha-bridge s on desk_fan
ha-bridge s off desk_fan
ha-bridge s t desk_fan
```

| Command | Home Assistant action |
| --- | --- |
| `switch turn-on` | `switch.turn_on` |
| `switch turn-off` | `switch.turn_off` |
| `switch toggle` | `switch.toggle` |

See [`ha-bridge switch`](/commands/switch) for every argument and flag.
