---
title: To-do lists
description: Read, add, change and remove to-do list items.
---

`todo get` prints a list's items as JSON. `--status` limits it to `needs_action` or `completed` items:

```bash
ha-bridge todo get shopping
ha-bridge todo get shopping --status needs_action
```

## Changing items

```bash
ha-bridge todo add milk shopping
ha-bridge todo add "Book MOT" chores --due-date 2026-11-01 --description "Before the 14th"
ha-bridge todo update milk shopping --status completed
ha-bridge todo update "Book MOT" chores --rename "Book MOT and service"
ha-bridge todo remove shopping --item milk --item bread
ha-bridge todo remove-completed shopping
```

Items are matched by name or UID. Set at most one of `--due-date` and `--due-datetime`.

| Command | Home Assistant action |
| --- | --- |
| `todo get` | `todo.get_items` |
| `todo add` | `todo.add_item` |
| `todo update` | `todo.update_item` |
| `todo remove` | `todo.remove_item` |
| `todo remove-completed` | `todo.remove_completed_items` |

See [`ha-bridge todo`](/commands/todo) for every argument and flag.
