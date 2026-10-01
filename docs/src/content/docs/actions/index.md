---
title: Actions
description: Control Home Assistant entities from the command line, one action per command.
---

Action commands send one Home Assistant action through the bridge and exit. They exit with status 1 and print the error when the bridge isn't running, the options are invalid, or Home Assistant rejects the action.

## Entity names

Action commands take the entity name **without** its domain, because the command already says which domain it acts on:

```bash
# Acts on light.bedroom_lamp
ha-bridge light turn-on bedroom_lamp
```

[Watch commands](/using/watching/) are different: `watch entity` takes the full entity ID.

## Domains

| Domain | Command | Alias | What it does |
| --- | --- | --- | --- |
| [Lights](/actions/lights/) | `light` | `l` | On, off and toggle, with brightness, colour and effects |
| [Switches](/actions/switches/) | `switch` | `s` | On, off and toggle |
| [Input booleans](/actions/input-booleans/) | `input_boolean` | `ib` | On, off, toggle and reload |
| [Input numbers](/actions/input-numbers/) | `input_number` | `in` | Set, step up or down, and reload |
| [Covers](/actions/covers/) | `cover` | `c` | Open, close, stop, position and tilt |
| [Climate](/actions/climate/) | `climate` | `cl` | HVAC mode, temperature, humidity and other modes |
| [Assist satellites](/actions/assist-satellites/) | `assist_satellite` | `as` | Announce, start a conversation or ask a question |
| [Cameras](/actions/cameras/) | `camera` | None | Snapshots, recording, streams and motion detection |
| [Buttons](/actions/buttons/) | `button`, `input_button` | None | Press, and reload input buttons |
| [Locks](/actions/locks/) | `lock` | None | Lock, unlock and open |
| [Valves](/actions/valves/) | `valve` | None | Open, close, stop and position |
| [Sirens](/actions/sirens/) | `siren` | None | On, off and toggle, with tone and volume |
| [Remotes](/actions/remotes/) | `remote` | None | On, off, and send, learn or delete commands |
| [Selects](/actions/selects/) | `select`, `input_select` | None | Pick or step through options |
| [Numbers, text, dates and times](/actions/values/) | `number`, `text`, `date`, `time`, `datetime`, `input_text`, `input_datetime` | None | Set a value |
| [Counters](/actions/counters/) | `counter` | None | Step, reset or set the count |
| [Scripts](/actions/scripts/) | `script` | None | Start, stop or run and wait for a response |
| [Automations](/actions/automations/) | `automation` | None | On, off, trigger and reload |
| [Scenes](/actions/scenes/) | `scene` | None | Activate, apply states, create and delete |
| [Timers and schedules](/actions/timers/) | `timer`, `schedule` | None | Start, pause and change timers, read schedules |
| [Groups](/actions/groups/) | `group` | None | Create, change and remove groups |
| [Fans](/actions/fans/) | `fan` | None | On, off, speed, preset, oscillation and direction |
| [Humidifiers and water heaters](/actions/humidifiers/) | `humidifier`, `water_heater` | None | On, off, modes, humidity and temperature |
| [Media players](/actions/media-players/) | `media_player` | `mp` | Playback, volume, sources, grouping and browsing |
| [Vacuums and lawn mowers](/actions/vacuums/) | `vacuum`, `lawn_mower` | None | Start, pause, dock and clean areas |
| [Alarm panels](/actions/alarms/) | `alarm_control_panel` | `alarm` | Arm, disarm and trigger |
| [Updates](/actions/updates/) | `update` | None | Install, skip and clear skipped |
| [Notifications and speech](/actions/notifications/) | `notify`, `persistent_notification`, `tts` | `pn` | Send notifications and speak messages |
| [To-do lists](/actions/todo-lists/) | `todo` | None | Read, add, change and remove items |
| [Calendars and weather](/actions/calendars/) | `calendar`, `weather` | None | Read and add events, read forecasts |
| [Conversation and AI tasks](/actions/conversation/) | `conversation`, `ai_task` | None | Talk to agents, generate data and images |
| [Images and device trackers](/actions/images/) | `image`, `image_processing`, `device_tracker` | None | Save images, scan and report locations |
| [Home Assistant](/actions/home-assistant/) | `homeassistant`, `zone`, `person` | None | Any entity, restart, reload and location |

[Commands](/reference/commands/) lists every argument and flag. Any other action can be called from your own app with [`CallAction`](/libraries/).
