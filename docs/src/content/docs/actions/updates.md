---
title: Updates
description: Install or skip updates.
---

`update install` installs the latest version, or the one you give with `--version`. `--backup` backs up first, where the integration supports it:

```bash
ha-bridge update install home_assistant_core_update --backup
ha-bridge update install esphome_kitchen --version 2026.9.1
ha-bridge update skip esphome_kitchen
ha-bridge update clear-skipped esphome_kitchen
```

| Command | Home Assistant action |
| --- | --- |
| `update install` | `update.install` |
| `update skip` | `update.skip` |
| `update clear-skipped` | `update.clear_skipped` |

See [`ha-bridge update`](/commands/update) for every argument and flag.
