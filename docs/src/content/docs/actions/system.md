---
title: System
description: Write logs, set log levels, manage the recorder, set themes, back up, wake devices and manage cloud, FFmpeg and Google Assistant.
---

These commands act on Home Assistant itself rather than on entities. Most need an admin token.

## Logbook and system log

`logbook log` adds a logbook entry. The name and message read as one sentence, such as "Kitchen is being used":

```bash
ha-bridge logbook log Kitchen "is being used"
ha-bridge logbook log Desk "was cleared" --entity-id light.desk --domain light
```

`--entity-id` ties the entry to an entity, and `--domain` picks its icon.

`system_log write` writes to the log and the system log, at `error` unless you set `--level` to `debug`, `info`, `warning` or `critical`. `system_log clear` empties the system log:

```bash
ha-bridge system_log write "Backup drive is nearly full" --level warning --logger backup.monitor
ha-bridge system_log clear
```

## Log levels

`logger default-level` sets the level for loggers without their own, and `logger level` sets particular loggers, as `logger=level`. The levels are `debug`, `info`, `warning`, `error`, `fatal` and `critical`:

```bash
ha-bridge logger default-level warning
ha-bridge logger level homeassistant.components.mqtt=debug homeassistant.components.zha=info
```

## Recorder

`recorder purge` removes history older than `--keep-days`, or the recorder's own `purge_keep_days`. `--repack` frees the disk space afterwards, and `--apply-filter` also removes what the recorder's filters now exclude:

```bash
ha-bridge recorder purge --keep-days 7 --repack
```

`recorder purge-entities` removes history for a target, whole domains or entity ID globs, keeping none unless you set `--keep-days`:

```bash
ha-bridge recorder purge-entities sensor.noisy_power
ha-bridge recorder purge-entities --domain sun --glob "sensor.weather_*" --keep-days 1
```

`recorder disable` stops recording until `recorder enable` or a restart.

`recorder statistics` prints long-term statistics as JSON, keyed by statistic ID. The start comes first, in Home Assistant's time zone, then the statistic IDs. `--period` sets the length of each row, and `--type` the values to include:

```bash
ha-bridge recorder statistics "2026-10-01 00:00" sensor.energy_consumption \
  --period day --type change --unit energy=kWh
```

```json
{"sensor.energy_consumption":[{"start":"2026-09-30T23:00:00+00:00","end":"2026-10-01T23:00:00+00:00","change":8.42}]}
```

The periods are `5minute`, `hour`, `day`, `week`, `month` and `year`, and the types are `change`, `last_reset`, `max`, `mean`, `min`, `state` and `sum`. Rows only have the types that have a value.

## Themes

`frontend set-theme` sets the default theme. `--name-dark` sets the default in dark mode, and `--mode` makes `--name` set the default for that mode only. The theme `none` goes back to Home Assistant's own:

```bash
ha-bridge frontend set-theme --name midnight
ha-bridge frontend set-theme --name daylight --name-dark midnight
ha-bridge frontend set-theme --name none --mode dark
ha-bridge frontend reload-themes
```

`lovelace reload-resources` reloads dashboard resources set in YAML.

## Backups

`backup create` backs up Home Assistant to the default location, and `backup create-automatic` backs up with the automatic backup settings. On an installation with the Supervisor, `backup create` isn't available; use [`hassio backup-full`](/actions/supervisor) instead.

```bash
ha-bridge backup create-automatic
```

## Wake on LAN

`wake_on_lan send-magic-packet` (`wol wake`) wakes a device by its MAC address. It broadcasts on port 9 to the whole network unless you set `--broadcast-address` or `--broadcast-port`:

```bash
ha-bridge wol wake aa:bb:cc:dd:ee:ff
ha-bridge wol wake aa:bb:cc:dd:ee:ff --broadcast-address 192.168.1.255
```

## Cloud, FFmpeg and Google Assistant

`cloud remote-connect` and `cloud remote-disconnect` turn remote access through Home Assistant Cloud on and off.

`ffmpeg start`, `stop` and `restart` control FFmpeg sensors, such as noise and motion sensors. Without a target, they act on every one:

```bash
ha-bridge ffmpeg restart binary_sensor.driveway_motion
ha-bridge ffmpeg stop
```

`google_assistant request-sync` asks Google to sync its devices, for the token's user unless you set `--agent-user-id`.

| Command | Home Assistant action |
| --- | --- |
| `logbook log` | `logbook.log` |
| `system_log write`, `clear` | `system_log.write`, `clear` |
| `logger default-level`, `level` | `logger.set_default_level`, `set_level` |
| `recorder purge`, `purge-entities` | `recorder.purge`, `purge_entities` |
| `recorder enable`, `disable` | `recorder.enable`, `disable` |
| `recorder statistics` | `recorder.get_statistics` |
| `frontend set-theme`, `reload-themes` | `frontend.set_theme`, `reload_themes` |
| `lovelace reload-resources` | `lovelace.reload_resources` |
| `backup create`, `create-automatic` | `backup.create`, `create_automatic` |
| `wake_on_lan send-magic-packet` | `wake_on_lan.send_magic_packet` |
| `cloud remote-connect`, `remote-disconnect` | `cloud.remote_connect`, `remote_disconnect` |
| `ffmpeg start`, `stop`, `restart` | `ffmpeg.start`, `stop`, `restart` |
| `google_assistant request-sync` | `google_assistant.request_sync` |
