---
title: Input numbers
description: Set input number helpers, step them up or down, and reload them from YAML.
---

`input_number` (`in`) raises or lowers a helper by its step, or sets a value:

```bash
ha-bridge input_number increment target_temperature
ha-bridge input_number decrement target_temperature
ha-bridge input_number set-value target_temperature 23.5
```

`reload` reloads input numbers from YAML. It acts on the whole domain, so it takes no name:

```bash
ha-bridge input_number reload
```

| Command | Home Assistant action |
| --- | --- |
| `input_number increment` | `input_number.increment` |
| `input_number decrement` | `input_number.decrement` |
| `input_number set-value` | `input_number.set_value` |
| `input_number reload` | `input_number.reload` |
