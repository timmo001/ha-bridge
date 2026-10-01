---
title: Commands
description: Every Home Assistant Bridge command, alias, argument and flag, generated from the CLI's help.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Each command has its own page with its help, as `ha-bridge <command> --help` prints it.

| Command | Alias |
| --- | --- |
| [`serve`](/reference/commands/serve/) | None |
| [`setup`](/reference/commands/setup/) | None |
| [`watch`](/reference/commands/watch/) | `w` |
| [`assist_satellite`](/reference/commands/assist-satellite/) | `as` |
| [`input_boolean`](/reference/commands/input-boolean/) | `ib` |
| [`input_number`](/reference/commands/input-number/) | `in` |
| [`light`](/reference/commands/light/) | `l` |
| [`switch`](/reference/commands/switch/) | `s` |
| [`cover`](/reference/commands/cover/) | `c` |
| [`climate`](/reference/commands/climate/) | `cl` |
| [`camera`](/reference/commands/camera/) | None |
| [`button`](/reference/commands/button/) | None |
| [`input_button`](/reference/commands/input-button/) | None |
| [`lock`](/reference/commands/lock/) | None |
| [`valve`](/reference/commands/valve/) | None |
| [`siren`](/reference/commands/siren/) | None |
| [`remote`](/reference/commands/remote/) | None |
| [`select`](/reference/commands/select/) | None |
| [`input_select`](/reference/commands/input-select/) | None |
| [`number`](/reference/commands/number/) | None |
| [`text`](/reference/commands/text/) | None |
| [`input_text`](/reference/commands/input-text/) | None |
| [`date`](/reference/commands/date/) | None |
| [`time`](/reference/commands/time/) | None |
| [`datetime`](/reference/commands/datetime/) | None |
| [`input_datetime`](/reference/commands/input-datetime/) | None |
| [`counter`](/reference/commands/counter/) | None |
| [`script`](/reference/commands/script/) | None |
| [`automation`](/reference/commands/automation/) | None |
| [`scene`](/reference/commands/scene/) | None |
| [`timer`](/reference/commands/timer/) | None |
| [`schedule`](/reference/commands/schedule/) | None |
| [`group`](/reference/commands/group/) | None |
| [`zone`](/reference/commands/zone/) | None |
| [`person`](/reference/commands/person/) | None |
| [`homeassistant`](/reference/commands/homeassistant/) | None |
| [`fan`](/reference/commands/fan/) | None |
| [`humidifier`](/reference/commands/humidifier/) | None |
| [`water_heater`](/reference/commands/water-heater/) | None |
| [`media_player`](/reference/commands/media-player/) | `mp` |
| [`vacuum`](/reference/commands/vacuum/) | None |
| [`lawn_mower`](/reference/commands/lawn-mower/) | None |
| [`alarm_control_panel`](/reference/commands/alarm-control-panel/) | `alarm` |
| [`update`](/reference/commands/update/) | None |

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
  watch, w            Watch entities through the bridge
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
```
