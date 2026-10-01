---
title: Sirens
description: Turn sirens on and off, with a tone, duration and volume.
---

`siren` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`). `turn-on` takes `--tone`, one of the siren's `available_tones`, `--duration` in seconds and `--volume-level` from 0 to 1:

```bash
ha-bridge siren turn-on alarm
ha-bridge siren turn-on alarm --tone fire --duration 10 --volume-level 0.5
ha-bridge siren turn-off alarm
ha-bridge siren toggle alarm
```

| Command | Home Assistant action |
| --- | --- |
| `siren turn-on` | `siren.turn_on` |
| `siren turn-off` | `siren.turn_off` |
| `siren toggle` | `siren.toggle` |
