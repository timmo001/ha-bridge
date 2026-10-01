---
title: Groups
description: Create, change and remove old-style groups.
---

`group set` creates or changes an old-style group made by actions. Pass its ID without `group.`, and set its members with `--entity`, or change them with `--add-entity` or `--remove-entity`. Repeat each for more entities:

```bash
ha-bridge group set office_lights --name "Office lights" --entity light.desk --entity light.ceiling
ha-bridge group set office_lights --add-entity light.lamp
ha-bridge group set office_lights --all
ha-bridge group remove office_lights
```

`--all` makes the group on only when every member is on. Use one of `--entity`, `--add-entity` and `--remove-entity` at a time. `group reload` reloads groups from YAML.

| Command | Home Assistant action |
| --- | --- |
| `group set` | `group.set` |
| `group remove` | `group.remove` |
| `group reload` | `group.reload` |

See [`ha-bridge group`](/reference/commands/group) for every argument and flag.
