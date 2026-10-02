---
title: Bar JSON
description: The JSON lines that watchers print for status bars, shells and scripts.
---

`watch entity --bar-json`, `cover watch` and `climate watch` print one JSON object per line: once straight away, then on every change. Any status bar or script that reads JSON lines can use them, including [Quickshell](https://quickshell.org) and [Waybar](https://github.com/Alexays/Waybar).

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

`name` is built the way the Home Assistant frontend names entities: the device name and the entity's own name together, such as `Living Room Thermostat Temperature`. The bridge reads the entity and device registries when it connects and again shortly after either registry changes, so a rename shows in running watchers without a restart and costs no extra request per watcher. When the registries don't give a name, the entity's `friendly_name` is used.

`watch entity` skips a line identical to the one before it, so an attribute change that doesn't change the output prints nothing.

## How `watch entity` fills the fields

A state is "on" when it is `on`, or one of the `--on-state` values when you give any. Everything else, including `off`, `unavailable` and sensor readings, is "off".

| Field | On | Off |
| --- | --- | --- |
| `text` | `--text` (or `--icon`), or the state with its unit, then `--text-on` | `--text` (or `--icon`), or the state with its unit, then `--text-off` |
| `tooltip` | `--tooltip-on`, `--tooltip`, or the state with its unit | `--tooltip-off`, `--tooltip`, or the state with its unit |
| `class` | `--class-on`, `--class`, or the raw state | `--class-off`, `--class`, or the raw state |

The text and the appended text are joined with a space. The unit comes from the entity's `unit_of_measurement` attribute.

## Templates

Every text, tooltip and class flag is a template. `{path}` is replaced with a value from the entity:

| Placeholder | Value |
| --- | --- |
| `{state}` | The raw state. |
| `{state_with_unit}` | The state with its unit. |
| `{unit}` | The `unit_of_measurement` attribute. |
| `{name}` | The display name. |
| `{entity_id}` | The entity ID. |
| `{attributes.<name>}` | An attribute. Number parts index lists, such as `{attributes.hs_color.0}`. |
| `{last_changed}`, `{last_updated}`, `{last_reported}` | Home Assistant's timestamps. |
| `{context.<key>}` | The state's context, such as `{context.user_id}`. |

Strings are inserted as they are, other values as JSON. A missing value is empty. A flag you set is always used, even when it renders empty, so `--text "{attributes.media_title}"` shows nothing when nothing is playing rather than the state.

## Flags

| Flag | Effect |
| --- | --- |
| `--bar-json` | Print bar JSON instead of the raw state. |
| `--text` | Text template shown instead of the state. |
| `--icon` | Same as `--text`. Use one or the other. |
| `--text-on` | Text appended when the entity is on. |
| `--text-off` | Text appended when the entity is off. |
| `--tooltip` | Tooltip when no on or off tooltip applies. |
| `--tooltip-on` | Tooltip when the entity is on. |
| `--tooltip-off` | Tooltip when the entity is off. |
| `--class` | Class when no on or off class applies. |
| `--class-on` | Class when the entity is on. |
| `--class-off` | Class when the entity is off. |
| `--on-state` | A state that counts as on. Repeat for more. Defaults to `on`. |

`--bar-json` can't be combined with `--json` or `--field`.

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

A light's brightness, with a cover-style on state shown for comparison:

```bash
ha-bridge watch entity light.office --bar-json \
  --text "{attributes.brightness}" --tooltip "{name}" --class-on lit

ha-bridge watch entity cover.office_blind --bar-json \
  --on-state open --on-state opening --class-on open --class-off closed
```

With the light on at brightness 128:

```json
{"class":"lit","name":"Office","text":"128","tooltip":"Office"}
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

## Example setup

[timmo001/dotfiles](https://github.com/timmo001/dotfiles) uses bar JSON in an Omarchy (Quickshell) status bar. The [stream command widget](https://github.com/timmo001/dotfiles/tree/HEAD/omarchy/.config/omarchy/plugins/timmo.stream-command) renders each line, and [`ha-module-bar`](https://github.com/timmo001/dotfiles/blob/HEAD/scripts/.local/bin/ha-module-bar) and [`ha-watch-singleton`](https://github.com/timmo001/dotfiles/blob/HEAD/scripts/.local/bin/ha-watch-singleton) wrap the watcher.
