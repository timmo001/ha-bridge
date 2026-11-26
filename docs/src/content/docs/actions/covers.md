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
ha-bridge cover position 30 curtain
```

`open`, `close` and `position` take `--speed` for covers that list `supported_speeds`:

```bash
ha-bridge cover open curtain --speed fast
```

`increase-position` and `decrease-position` move it by a step, 10 unless `--step` says otherwise, staying within 0 to 100. Quick steps add up while the cover is still moving; see [Stepping a value](/actions#stepping-a-value):

```bash
ha-bridge cover increase-position --step 5 curtain
ha-bridge cover decrease-position --step 5 curtain
```

## Tilt

The tilt commands work the same way, for covers with slats:

```bash
ha-bridge cover open-tilt office_blind
ha-bridge cover close-tilt office_blind
ha-bridge cover toggle-tilt office_blind
ha-bridge cover stop-tilt office_blind
ha-bridge cover tilt-position 40 office_blind
ha-bridge cover increase-tilt office_blind
ha-bridge cover decrease-tilt --step 5 office_blind
```

## Watching

`cover watch` prints the cover's state and tilt position as bar JSON, now and on every change. See [Reading entities](/using/reading#covers-and-climate).

## Actions

| Command | Home Assistant action |
| --- | --- |
| `cover open` | `cover.open_cover` |
| `cover close` | `cover.close_cover` |
| `cover toggle` | `cover.toggle` |
| `cover stop` | `cover.stop_cover` |
| `cover position` | `cover.set_cover_position` |
| `cover increase-position`, `cover decrease-position` | `cover.set_cover_position`, from the current position |
| `cover open-tilt` | `cover.open_cover_tilt` |
| `cover close-tilt` | `cover.close_cover_tilt` |
| `cover toggle-tilt` | `cover.toggle_cover_tilt` |
| `cover stop-tilt` | `cover.stop_cover_tilt` |
| `cover tilt-position` | `cover.set_cover_tilt_position` |
| `cover increase-tilt`, `cover decrease-tilt` | `cover.set_cover_tilt_position`, from the current tilt position |

See [`ha-bridge cover`](/commands/cover) for every argument and flag.
