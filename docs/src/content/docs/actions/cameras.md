---
title: Cameras
description: Save camera snapshots, record clips, play streams and switch motion detection.
---

## Snapshots on your machine

`camera snapshot` saves a camera's current image on your machine:

```bash
ha-bridge camera snapshot front_door /tmp/front-door.jpg
```

The image is written to a temporary file first and then renamed, so anything reading the file never sees a partial image. It's readable only by you (`0600`).

## Saving on the Home Assistant host

`server-snapshot` and `record` save on the Home Assistant host instead. The path must be in Home Assistant's `allowlist_external_dirs`, and can be a template such as `/media/{{ entity_id.name }}.mp4`. `record` takes `--duration` (30 seconds by default) and `--lookback`:

```bash
ha-bridge camera server-snapshot front_door /media/front-door.jpg
ha-bridge camera record front_door /media/front-door.mp4 --duration 20
```

## Streams, power and motion detection

```bash
ha-bridge camera play-stream front_door living_room_tv
ha-bridge camera turn-on front_door
ha-bridge camera turn-off front_door
ha-bridge camera enable-motion-detection front_door
ha-bridge camera disable-motion-detection front_door
```

`play-stream` takes the media player's name without `media_player.`.

## Actions

| Command | Home Assistant action |
| --- | --- |
| `camera snapshot` | Camera proxy image |
| `camera server-snapshot` | `camera.snapshot` |
| `camera record` | `camera.record` |
| `camera play-stream` | `camera.play_stream` |
| `camera turn-on` | `camera.turn_on` |
| `camera turn-off` | `camera.turn_off` |
| `camera enable-motion-detection` | `camera.enable_motion_detection` |
| `camera disable-motion-detection` | `camera.disable_motion_detection` |

See [`ha-bridge camera`](/commands/camera) for every argument and flag.
