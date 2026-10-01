---
title: Covers
description: Open, close and stop covers, set their position and control their tilt.
---

`cover` (`c`) opens, closes, toggles or stops a cover, and sets its position from 0 to 100:

```bash
ha-bridge cover open curtain
ha-bridge cover close curtain
ha-bridge cover toggle curtain
ha-bridge cover stop curtain
ha-bridge cover position curtain 30
```

`open`, `close` and `position` take `--speed` for covers that list `supported_speeds`:

```bash
ha-bridge cover open curtain --speed fast
```

## Tilt

The tilt commands work the same way, for covers with slats:

```bash
ha-bridge cover open-tilt office_blind
ha-bridge cover close-tilt office_blind
ha-bridge cover toggle-tilt office_blind
ha-bridge cover stop-tilt office_blind
ha-bridge cover tilt-position office_blind 40
```

## Watching

`cover watch` prints the cover's state and tilt position as bar JSON, now and on every change. See [Watching entities](/using/watching#covers-and-climate).

## Actions

| Command | Home Assistant action |
| --- | --- |
| `cover open` | `cover.open_cover` |
| `cover close` | `cover.close_cover` |
| `cover toggle` | `cover.toggle` |
| `cover stop` | `cover.stop_cover` |
| `cover position` | `cover.set_cover_position` |
| `cover open-tilt` | `cover.open_cover_tilt` |
| `cover close-tilt` | `cover.close_cover_tilt` |
| `cover toggle-tilt` | `cover.toggle_cover_tilt` |
| `cover stop-tilt` | `cover.stop_cover_tilt` |
| `cover tilt-position` | `cover.set_cover_tilt_position` |

See [`ha-bridge cover`](/reference/commands/cover) for every argument and flag.
