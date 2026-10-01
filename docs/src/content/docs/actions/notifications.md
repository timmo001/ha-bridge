---
title: Notifications and speech
description: Send notifications, show persistent notifications in Home Assistant and speak messages on media players.
---

## Notify

`notify send-message` sends to a notify entity. `notify legacy` sends through a legacy notify action, such as the mobile app's, and takes integration `--data` as JSON:

```bash
ha-bridge notify send-message family_group "Back in 10" --title Home
ha-bridge notify legacy mobile_app_pixel "Door left open" --data '{"ttl":0,"priority":"high"}'
```

## Persistent notifications

`persistent_notification` (`pn`) shows notifications in Home Assistant's sidebar. Reusing an `--id` replaces that notification:

```bash
ha-bridge pn create "Bins go out tonight" --title Reminder --id bins
ha-bridge pn dismiss bins
ha-bridge pn dismiss-all
```

## Text to speech

`tts speak` speaks a message with a TTS entity on a media player, both named without their prefix:

```bash
ha-bridge tts speak google_translate_en_com kitchen "Dinner's ready"
ha-bridge tts speak piper kitchen "Good morning" --language en-GB --options '{"voice":"en_GB-alba-medium"}'
ha-bridge tts clear-cache
```

`--no-cache` skips caching the audio.

| Command | Home Assistant action |
| --- | --- |
| `notify send-message` | `notify.send_message` |
| `notify legacy` | `notify.<action>` |
| `pn create` | `persistent_notification.create` |
| `pn dismiss` | `persistent_notification.dismiss` |
| `pn dismiss-all` | `persistent_notification.dismiss_all` |
| `tts speak` | `tts.speak` |
| `tts clear-cache` | `tts.clear_cache` |

See [`ha-bridge notify`](/reference/commands/notify), [`ha-bridge persistent_notification`](/reference/commands/persistent-notification) and [`ha-bridge tts`](/reference/commands/tts) for every argument and flag.
