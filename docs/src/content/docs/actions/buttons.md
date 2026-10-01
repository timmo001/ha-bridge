---
title: Buttons
description: Press buttons and input button helpers, and reload input buttons from YAML.
---

`button` and `input_button` each have `press`:

```bash
ha-bridge button press restart_router
ha-bridge input_button press doorbell
```

`input_button reload` reloads input buttons from YAML. It acts on the whole domain, so it takes no name:

```bash
ha-bridge input_button reload
```

| Command | Home Assistant action |
| --- | --- |
| `button press` | `button.press` |
| `input_button press` | `input_button.press` |
| `input_button reload` | `input_button.reload` |
