---
title: Counters
description: Step counters up and down, reset them or set a count.
---

`counter` raises or lowers a counter by its step, resets it to its initial value, or sets a whole number:

```bash
ha-bridge counter increment coffees
ha-bridge counter decrement coffees
ha-bridge counter reset coffees
ha-bridge counter set-value coffees 3
```

| Command | Home Assistant action |
| --- | --- |
| `counter increment` | `counter.increment` |
| `counter decrement` | `counter.decrement` |
| `counter reset` | `counter.reset` |
| `counter set-value` | `counter.set_value` |
