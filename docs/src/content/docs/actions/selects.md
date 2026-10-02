---
title: Selects
description: Pick options on select entities and input select helpers.
---

`select` and `input_select` pick an option by name, or step through the list:

```bash
ha-bridge select select-option eco washer_programme
ha-bridge select select-first washer_programme
ha-bridge select select-last washer_programme
ha-bridge select select-next washer_programme
ha-bridge select select-previous washer_programme --no-cycle
```

`select-next` and `select-previous` wrap round from the end of the list; `--no-cycle` stops there instead.

`input_select` has the same commands, plus `set-options`, which replaces the options until Home Assistant restarts or reloads, and `reload`, which reloads input selects from YAML:

```bash
ha-bridge input_select select-option away house_mode
ha-bridge input_select set-options house_mode --option home --option away --option holiday
ha-bridge input_select reload
```

| Command | Home Assistant action |
| --- | --- |
| `select-option` | `select.select_option`, `input_select.select_option` |
| `select-first`, `select-last` | `select.select_first`, `select_last` (and `input_select`) |
| `select-next`, `select-previous` | `select.select_next`, `select_previous` (and `input_select`) |
| `input_select set-options` | `input_select.set_options` |
| `input_select reload` | `input_select.reload` |

See [`ha-bridge select`](/commands/select) and [`ha-bridge input_select`](/commands/input-select) for every argument and flag.
