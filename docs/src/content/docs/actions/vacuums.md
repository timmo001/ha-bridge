---
title: Vacuums and lawn mowers
description: Start, pause and dock vacuums and lawn mowers, and clean areas.
---

## Vacuums

```bash
ha-bridge vacuum start robo
ha-bridge vacuum pause robo
ha-bridge vacuum start-pause robo
ha-bridge vacuum stop robo
ha-bridge vacuum return-to-base robo
ha-bridge vacuum locate robo
ha-bridge vacuum clean-spot robo
ha-bridge vacuum fan-speed robo max
```

`clean-area` cleans Home Assistant areas, by area ID, that are mapped to the vacuum's segments:

```bash
ha-bridge vacuum clean-area robo kitchen hallway
```

`send-command` sends a raw command the integration understands, with optional JSON `--params`:

```bash
ha-bridge vacuum send-command robo app_goto_target --params '[25500,25500]'
```

## Lawn mowers

```bash
ha-bridge lawn_mower start front
ha-bridge lawn_mower pause front
ha-bridge lawn_mower stop front
ha-bridge lawn_mower dock front
```

| Command | Home Assistant action |
| --- | --- |
| `vacuum start`, `pause`, `start-pause`, `stop` | `vacuum.start`, `pause`, `start_pause`, `stop` |
| `vacuum return-to-base`, `locate`, `clean-spot` | `vacuum.return_to_base`, `locate`, `clean_spot` |
| `vacuum clean-area` | `vacuum.clean_area` |
| `vacuum fan-speed` | `vacuum.set_fan_speed` |
| `vacuum send-command` | `vacuum.send_command` |
| `lawn_mower start` | `lawn_mower.start_mowing` |
| `lawn_mower pause`, `stop`, `dock` | `lawn_mower.pause`, `stop`, `dock` |

See [`ha-bridge vacuum`](/commands/vacuum) and [`ha-bridge lawn_mower`](/commands/lawn-mower) for every argument and flag.
