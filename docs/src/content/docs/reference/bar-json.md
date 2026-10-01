---
title: Bar JSON
description: The JSON lines that watchers print for status bars, shells and scripts.
---

`watch entity --bar-json`, `cover watch` and `climate watch` print one JSON object per line: once straight away, then on every change. Any status bar or script that reads JSON lines can use them, including [Waybar](https://github.com/Alexays/Waybar) and [Quickshell](https://quickshell.org).

## Output

```json
{"class":"23.3","name":"Living Room Thermostat Temperature","text":"23.3 °C","tooltip":"23.3 °C"}
```

| Field | Value |
| --- | --- |
| `text` | The label to show. |
| `tooltip` | The hover text. |
| `class` | A class name for styling. |
| `name` | The entity's display name. Left out when the entity has no name. |

`text`, `tooltip` and `class` match Waybar's custom module JSON, so Waybar reads the line as it is and ignores `name`.

`name` is built the way the Home Assistant frontend names entities: the device name and the entity's own name together, such as `Living Room Thermostat Temperature`. The bridge reads the entity and device registries when it connects, so this costs no extra request per watcher. When the registries don't give a name, the entity's `friendly_name` is used.

## How `watch entity` fills the fields

A state is "on" only when it is exactly `on`. Everything else, including `off`, `unavailable` and sensor readings, is "off".

| Field | On | Off |
| --- | --- | --- |
| `text` | `--icon`, or the state with its unit, then `--text-on` | `--icon`, or the state with its unit, then `--text-off` |
| `tooltip` | `--tooltip-on`, or the state with its unit | `--tooltip-off`, or the state with its unit |
| `class` | `--class-on`, or the raw state | `--class-off`, or the raw state |

`--icon` and the appended text are joined with a space. The unit comes from the entity's `unit_of_measurement` attribute.

## Flags

| Flag | Effect |
| --- | --- |
| `--bar-json` | Print bar JSON instead of the raw state. |
| `--icon` | Text to show instead of the state. |
| `--text-on` | Text appended when the entity is on. |
| `--text-off` | Text appended when the entity is off. |
| `--tooltip-on` | Tooltip when the entity is on. |
| `--tooltip-off` | Tooltip when the entity is off. |
| `--class-on` | Class when the entity is on. |
| `--class-off` | Class when the entity is off. |

## Example

```bash
ha-bridge watch entity input_boolean.guest_mode \
  --bar-json \
  --text-on "Guest" \
  --tooltip-on "Guest mode is on" \
  --tooltip-off "Guest mode is off" \
  --class-on active \
  --class-off inactive
```

With guest mode on:

```json
{"class":"active","name":"Guest mode","text":"on Guest","tooltip":"Guest mode is on"}
```

With it off:

```json
{"class":"inactive","name":"Guest mode","text":"off","tooltip":"Guest mode is off"}
```

## Waybar

```jsonc
"custom/guest_mode": {
  "exec": "ha-bridge watch entity input_boolean.guest_mode --bar-json --text-on Guest --class-on active --class-off inactive",
  "return-type": "json",
  "restart-interval": 5
}
```

`restart-interval` restarts the watcher if it exits, for example while the bridge restarts.

## Scripts

```bash
ha-bridge watch entity input_boolean.guest_mode --bar-json |
  while IFS= read -r line; do
    jq -r '.text' <<< "$line"
  done
```
