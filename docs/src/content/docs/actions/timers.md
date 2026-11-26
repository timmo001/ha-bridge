---
title: Timers and schedules
description: Start, pause, change and finish timers and the timers in timer lists, and read schedules.
---

## Timers

`timer start` starts or restarts a timer, for its own duration or one you give as seconds or `HH:MM:SS`:

```bash
ha-bridge timer start tea
ha-bridge timer start tea --duration 00:04:00
ha-bridge timer pause tea
ha-bridge timer cancel tea
ha-bridge timer finish tea
```

`change` adds time to a running timer. To take time away, put the negative value after `--`:

```bash
ha-bridge timer change 60 tea
ha-bridge timer change -- -00:01:00 tea
```

## Timer lists

A timer list holds many timers at once, each with its own ID, such as the timers a voice assistant sets (Home Assistant 2026.12 or newer). `create` starts one and prints its `timer_id`, keyed by entity ID, and `get` prints the list's timers. The other commands take a timer ID first:

```bash
ha-bridge timer_list create 00:08:00 --name Pasta kitchen_timers
ha-bridge timer_list get --status active kitchen_timers
ha-bridge timer_list add-time 01J8ABCDEF0123456789ABCDE 60 kitchen_timers
ha-bridge timer_list pause 01J8ABCDEF0123456789ABCDE kitchen_timers
ha-bridge timer_list remove 01J8ABCDEF0123456789ABCDE kitchen_timers
```

`--status` takes `active`, `paused`, `finished` or `cancelled`; repeat it for more. `subtract-time` takes time off a timer, and `unpause`, `cancel` and `finish` do what they say.

## Schedules

`schedule get` prints a schedule helper's week as JSON:

```bash
ha-bridge schedule get heating
```

```json
{"monday":[{"from":"07:00:00","to":"09:00:00"}],"tuesday":[],"wednesday":[],"thursday":[],"friday":[],"saturday":[],"sunday":[]}
```

`timer reload` and `schedule reload` reload those helpers from YAML.

| Command | Home Assistant action |
| --- | --- |
| `timer start` | `timer.start` |
| `timer pause` | `timer.pause` |
| `timer cancel` | `timer.cancel` |
| `timer finish` | `timer.finish` |
| `timer change` | `timer.change` |
| `timer reload` | `timer.reload` |
| `timer_list create`, `get` | `timer_list.create_timer`, `get_timers` |
| `timer_list pause`, `unpause`, `cancel`, `finish`, `remove` | `timer_list.pause_timer`, `unpause_timer`, `cancel_timer`, `finish_timer`, `remove_timer` |
| `timer_list add-time`, `subtract-time` | `timer_list.add_time`, `subtract_time` |
| `schedule get` | `schedule.get_schedule` |
| `schedule reload` | `schedule.reload` |

See [`ha-bridge timer`](/commands/timer), [`ha-bridge timer_list`](/commands/timer-list) and [`ha-bridge schedule`](/commands/schedule) for every argument and flag.
