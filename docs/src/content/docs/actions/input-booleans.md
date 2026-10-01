---
title: Input booleans
description: Turn input boolean helpers on and off, and reload them from YAML.
---

`input_boolean` (`ib`) has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge input_boolean turn-on guest_mode
ha-bridge input_boolean turn-off guest_mode
ha-bridge input_boolean toggle guest_mode

# The same, with aliases
ha-bridge ib on guest_mode
ha-bridge ib off guest_mode
ha-bridge ib t guest_mode
```

`reload` reloads input booleans from YAML. It acts on the whole domain, so it takes no name:

```bash
ha-bridge input_boolean reload
```

| Command | Home Assistant action |
| --- | --- |
| `input_boolean turn-on` | `input_boolean.turn_on` |
| `input_boolean turn-off` | `input_boolean.turn_off` |
| `input_boolean toggle` | `input_boolean.toggle` |
| `input_boolean reload` | `input_boolean.reload` |

See [`ha-bridge input_boolean`](/commands/input-boolean) for every argument and flag.
