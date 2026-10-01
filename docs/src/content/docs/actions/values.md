---
title: Numbers, text, dates and times
description: Set the value of number, text, date, time and datetime entities and their input helpers.
---

Each of these domains has `set-value`. Home Assistant checks the value against the entity's own limits, such as its minimum, maximum and step:

```bash
ha-bridge number set-value oven_target 180
ha-bridge text set-value display_message "Back at 5"
ha-bridge input_text set-value note "Bins out tonight"
ha-bridge date set-value next_service 2026-12-01
ha-bridge time set-value alarm_time 06:45
ha-bridge datetime set-value away_until "2026-10-03 18:00"
```

| Domain | Value |
| --- | --- |
| `number` | A number |
| `text`, `input_text` | Any text |
| `date` | `YYYY-MM-DD` |
| `time` | `HH:MM` or `HH:MM:SS` |
| `datetime` | A date and time, such as `2026-10-03 18:00`, in Home Assistant's time zone unless it has an offset |

For input numbers, see [Input numbers](/actions/input-numbers).

## Input date and time helpers

`input_datetime set-datetime` sets `--date`, `--time` or both, or one of `--datetime` and `--timestamp` (seconds since the Unix epoch):

```bash
ha-bridge input_datetime set-datetime wake_up --time 06:30
ha-bridge input_datetime set-datetime holiday_start --date 2026-12-20 --time 09:00
ha-bridge input_datetime set-datetime last_backup --timestamp 1790000000
```

`input_text reload` and `input_datetime reload` reload those helpers from YAML.

| Command | Home Assistant action |
| --- | --- |
| `number set-value` | `number.set_value` |
| `text set-value` | `text.set_value` |
| `input_text set-value` | `input_text.set_value` |
| `input_text reload` | `input_text.reload` |
| `date set-value` | `date.set_value` |
| `time set-value` | `time.set_value` |
| `datetime set-value` | `datetime.set_value` |
| `input_datetime set-datetime` | `input_datetime.set_datetime` |
| `input_datetime reload` | `input_datetime.reload` |

See [`ha-bridge number`](/reference/commands/number), [`ha-bridge text`](/reference/commands/text), [`ha-bridge date`](/reference/commands/date), [`ha-bridge time`](/reference/commands/time), [`ha-bridge datetime`](/reference/commands/datetime), [`ha-bridge input_text`](/reference/commands/input-text) and [`ha-bridge input_datetime`](/reference/commands/input-datetime) for every argument and flag.
