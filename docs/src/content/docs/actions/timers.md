---
title: Timers and schedules
description: Start, pause, change and finish timers, and read schedules.
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
| `schedule get` | `schedule.get_schedule` |
| `schedule reload` | `schedule.reload` |

See [`ha-bridge timer`](/commands/timer) and [`ha-bridge schedule`](/commands/schedule) for every argument and flag.
