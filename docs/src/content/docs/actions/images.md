---
title: Images and device trackers
description: Save image entities, run image processing and report legacy device tracker locations.
---

`image snapshot` saves an image entity to a path on the Home Assistant host, which must be in `allowlist_external_dirs`. `image_processing scan` processes an image now:

```bash
ha-bridge image snapshot /config/www/doorbell.jpg doorbell_last_ring
ha-bridge image_processing scan front_door_faces
```

For camera snapshots on this machine, see [Cameras](/actions/cameras).

## Device trackers

`device_tracker see` reports a legacy tracker's location. Identify it with `--mac`, `--dev-id` or both:

```bash
ha-bridge device_tracker see --dev-id laptop --location-name home
ha-bridge device_tracker see --dev-id phone --latitude 51.5072 --longitude -0.1276 --gps-accuracy 20 --battery 80
```

| Command | Home Assistant action |
| --- | --- |
| `image snapshot` | `image.snapshot` |
| `image_processing scan` | `image_processing.scan` |
| `device_tracker see` | `device_tracker.see` |

See [`ha-bridge image`](/commands/image), [`ha-bridge image_processing`](/commands/image-processing) and [`ha-bridge device_tracker`](/commands/device-tracker) for every argument and flag.
