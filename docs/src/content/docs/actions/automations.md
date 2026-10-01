---
title: Automations
description: Turn automations on and off, trigger them and reload them.
---

`automation` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge automation turn-on hallway_motion
ha-bridge automation turn-off hallway_motion
ha-bridge automation toggle hallway_motion
```

`turn-off` stops any running actions. `--no-stop-actions` lets them finish:

```bash
ha-bridge automation turn-off hallway_motion --no-stop-actions
```

## Triggering

`trigger` runs an automation's actions now. It skips the conditions unless you pass `--no-skip-condition`:

```bash
ha-bridge automation trigger hallway_motion
ha-bridge automation trigger hallway_motion --no-skip-condition
```

`automation reload` reloads automations from YAML.

| Command | Home Assistant action |
| --- | --- |
| `automation turn-on` | `automation.turn_on` |
| `automation turn-off` | `automation.turn_off` |
| `automation toggle` | `automation.toggle` |
| `automation trigger` | `automation.trigger` |
| `automation reload` | `automation.reload` |

See [`ha-bridge automation`](/reference/commands/automation) for every argument and flag.
