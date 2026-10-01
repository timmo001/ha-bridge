---
title: Media players
description: Control playback, volume, sources and grouping on media players, and browse or search their media.
---

`media_player` (`mp`) has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`), and playback controls:

```bash
ha-bridge mp play lounge
ha-bridge mp pause lounge
ha-bridge mp play-pause lounge
ha-bridge mp stop lounge
ha-bridge mp next lounge
ha-bridge mp previous lounge
ha-bridge mp seek lounge 90
```

## Volume and sound

```bash
ha-bridge mp volume lounge 0.3
ha-bridge mp volume-up lounge
ha-bridge mp volume-down lounge
ha-bridge mp mute lounge on
ha-bridge mp source lounge HDMI1
ha-bridge mp sound-mode lounge Movie
```

`volume` is from 0 to 1. The source and sound mode are from the player's `source_list` and `sound_mode_list`.

## Playing media

`play-media` plays a content ID, such as a URL. `--content-type` defaults to `music`:

```bash
ha-bridge mp play-media kitchen https://example.com/radio.mp3
ha-bridge mp play-media kitchen https://example.com/news.mp3 --announce
ha-bridge mp play-media kitchen spotify:track:abc --content-type music --enqueue next
```

`--enqueue` is `play` (the default), `next`, `add` or `replace`. `--announce` pauses what's playing, plays the media and resumes.

`shuffle` takes `on` or `off`, `repeat` takes `off`, `all` or `one`, and `clear-playlist` empties the queue.

## Grouping

`join` groups other players with this one for synchronised playback, and `unjoin` takes a player out of its group:

```bash
ha-bridge mp join kitchen lounge office
ha-bridge mp unjoin office
```

## Browsing and searching

`browse` and `search` print the player's response as JSON. Pass `--content-type` and `--content-id` from a previous response to go deeper:

```bash
ha-bridge mp browse kitchen
ha-bridge mp browse kitchen --content-type library --content-id albums
ha-bridge mp search kitchen "Abbey Road"
```

| Command | Home Assistant action |
| --- | --- |
| `turn-on`, `turn-off`, `toggle` | `media_player.turn_on`, `turn_off`, `toggle` |
| `play`, `pause`, `play-pause`, `stop` | `media_player.media_play`, `media_pause`, `media_play_pause`, `media_stop` |
| `next`, `previous` | `media_player.media_next_track`, `media_previous_track` |
| `seek` | `media_player.media_seek` |
| `volume`, `volume-up`, `volume-down`, `mute` | `media_player.volume_set`, `volume_up`, `volume_down`, `volume_mute` |
| `source`, `sound-mode` | `media_player.select_source`, `select_sound_mode` |
| `play-media` | `media_player.play_media` |
| `shuffle`, `repeat`, `clear-playlist` | `media_player.shuffle_set`, `repeat_set`, `clear_playlist` |
| `join`, `unjoin` | `media_player.join`, `unjoin` |
| `browse`, `search` | `media_player.browse_media`, `search_media` |

See [`ha-bridge media_player`](/reference/commands/media-player) for every argument and flag.
