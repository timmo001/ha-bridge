---
title: Commands
description: Every Home Assistant Bridge command, alias, argument and flag, generated from the CLI's help.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Each command has its own page with its help, as `ha-bridge <command> --help` prints it.

| Command | Alias |
| --- | --- |
| [`serve`](/commands/serve) | None |
| [`setup`](/commands/setup) | None |
| [`get`](/commands/get) | `g` |
| [`watch`](/commands/watch) | `w` |
| [`assist_satellite`](/commands/assist-satellite) | `as` |
| [`input_boolean`](/commands/input-boolean) | `ib` |
| [`input_number`](/commands/input-number) | `in` |
| [`light`](/commands/light) | `l` |
| [`switch`](/commands/switch) | `s` |
| [`cover`](/commands/cover) | `c` |
| [`climate`](/commands/climate) | `cl` |
| [`camera`](/commands/camera) | None |
| [`button`](/commands/button) | None |
| [`input_button`](/commands/input-button) | None |
| [`lock`](/commands/lock) | None |
| [`valve`](/commands/valve) | None |
| [`siren`](/commands/siren) | None |
| [`remote`](/commands/remote) | None |
| [`select`](/commands/select) | None |
| [`input_select`](/commands/input-select) | None |
| [`number`](/commands/number) | None |
| [`text`](/commands/text) | None |
| [`input_text`](/commands/input-text) | None |
| [`date`](/commands/date) | None |
| [`time`](/commands/time) | None |
| [`datetime`](/commands/datetime) | None |
| [`input_datetime`](/commands/input-datetime) | None |
| [`counter`](/commands/counter) | None |
| [`script`](/commands/script) | None |
| [`automation`](/commands/automation) | None |
| [`scene`](/commands/scene) | None |
| [`timer`](/commands/timer) | None |
| [`schedule`](/commands/schedule) | None |
| [`group`](/commands/group) | None |
| [`zone`](/commands/zone) | None |
| [`person`](/commands/person) | None |
| [`homeassistant`](/commands/homeassistant) | None |
| [`fan`](/commands/fan) | None |
| [`humidifier`](/commands/humidifier) | None |
| [`water_heater`](/commands/water-heater) | None |
| [`media_player`](/commands/media-player) | `mp` |
| [`vacuum`](/commands/vacuum) | None |
| [`lawn_mower`](/commands/lawn-mower) | None |
| [`alarm_control_panel`](/commands/alarm-control-panel) | `alarm` |
| [`update`](/commands/update) | None |
| [`notify`](/commands/notify) | None |
| [`persistent_notification`](/commands/persistent-notification) | `pn` |
| [`tts`](/commands/tts) | None |
| [`todo`](/commands/todo) | None |
| [`calendar`](/commands/calendar) | None |
| [`weather`](/commands/weather) | None |
| [`conversation`](/commands/conversation) | None |
| [`ai_task`](/commands/ai-task) | None |
| [`image`](/commands/image) | None |
| [`image_processing`](/commands/image-processing) | None |
| [`device_tracker`](/commands/device-tracker) | None |
| [`search`](/commands/search) | None |

## Global flags

```text
DESCRIPTION
  One shared Home Assistant connection for your machine, served to local apps over a single socket

USAGE
  ha-bridge <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)

GLOBAL FLAGS
  --help, -h                                                          Show help information
  --version, -v                                                       Show version information
  --wizard                                                            Start wizard mode for a command
  --completions <bash|zsh|fish|sh>                                    Print shell completion script (choices: bash, zsh, fish, sh)
  --log-level <all|trace|debug|info|warn|warning|error|fatal|none>    Sets the minimum log level (choices: all, trace, debug, info, warn, warning, error, fatal, none)

SUBCOMMANDS
  serve               Hold the shared Home Assistant connection and serve it on the bridge socket
  setup               Set the Home Assistant URL and access token
  get, g              Print the state of every entity a target matches once
  watch, w            Print the state of every entity a target matches now and on every change
  assist_satellite, as Assist satellite actions
  input_boolean, ib   Input boolean actions
  input_number, in    Input number actions
  light, l            Light actions
  switch, s           Switch actions
  cover, c            Cover actions
  climate, cl         Climate actions
  camera              Camera actions
  button              Button actions
  input_button        Input button actions
  lock                Lock actions
  valve               Valve actions
  siren               Siren actions
  remote              Remote actions
  select              Select actions
  input_select        Input select actions
  number              Number actions
  text                Text actions
  input_text          Input text actions
  date                Date actions
  time                Time actions
  datetime            Date and time actions
  input_datetime      Input date and time actions
  counter             Counter actions
  script              Script actions
  automation          Automation actions
  scene               Scene actions
  timer               Timer actions
  schedule            Schedule actions
  group               Group actions
  zone                Zone actions
  person              Person actions
  homeassistant       Home Assistant actions
  fan                 Fan actions
  humidifier          Humidifier actions
  water_heater        Water heater actions
  media_player, mp    Media player actions
  vacuum              Vacuum actions
  lawn_mower          Lawn mower actions
  alarm_control_panel, alarm Alarm control panel actions
  update              Update actions
  notify              Notification actions
  persistent_notification, pn Persistent notification actions
  tts                 Text-to-speech actions
  todo                To-do list actions
  calendar            Calendar actions
  weather             Weather actions
  conversation        Conversation actions
  ai_task             AI task actions
  image               Image actions
  image_processing    Image processing actions
  device_tracker      Device tracker actions
  search              Search Home Assistant entities, devices and areas, and ha-bridge commands
```
