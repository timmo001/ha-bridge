---
title: Reading entities
description: Read or stream Home Assistant entity state into scripts and status bars through the bridge.
---

`get` prints the state of the entities a target matches once. `watch` prints it straight away, then again on every change. Each is a small client of the bridge, so any number of them share the bridge's one Home Assistant connection.

## Targets

Both take a target, like an action's target in Home Assistant. Give entity IDs as arguments, or pick entities by what they belong to with flags. Every flag takes an ID or a name, and can be repeated:

| Flag | Matches |
| --- | --- |
| `--entity` | An entity, by entity ID or display name |
| `--device` | Every entity on a device |
| `--area` | Every entity in an area, including those on devices in it |
| `--floor` | Every entity in the floor's areas |
| `--label` | Every entity, device and area with the label |

```bash
ha-bridge get light.office sensor.office_temperature --json
ha-bridge watch --area Office --domain light --json
ha-bridge get --label "Evening lights" --field state --field name
```

Home Assistant decides what a target contains, the same way it does for actions. `--domain` keeps only entities in that domain. A name has to match exactly one item, ignoring case, or the command fails and lists the matches.

## Output

Without an output flag, `get` and `watch` print the raw state, and `watch` warns on stderr that scripts should use JSON.

`--json` prints an object keyed by entity ID. Each value is the full entity update, the same shape the [bridge protocol](/using/protocol#rpcs) sends, including Home Assistant's timestamps and context:

```bash
ha-bridge get sun.sun --json
# {"sun.sun":{"state":{"entity_id":"sun.sun","state":"above_horizon","attributes":{...},"last_changed":"...","last_reported":"...","last_updated":"...","context":{...}},"name":"Sun"}}
```

`--field` picks values by path, the same paths as [bar templates](/using/bar-json#templates). One field prints its raw value. Several, or one with `--json`, print an object keyed by entity ID, then by path, with `null` for anything missing:

```bash
ha-bridge get light.office --field state
# on

ha-bridge get --area Office --domain light --field state --field attributes.brightness
# {"light.office":{"state":"on","attributes.brightness":128},"light.ceiling":{"state":"off","attributes.brightness":null}}
```

`--bar-json` prints one JSON object per line for status bars and scripts:

```bash
ha-bridge watch input_boolean.guest_mode \
  --bar-json \
  --text-on "Guest" \
  --tooltip-on "Guest mode is on" \
  --tooltip-off "Guest mode is off" \
  --class-on active \
  --class-off inactive
```

See [Bar JSON](/using/bar-json) for the output and every flag.

Plain output and one `--field` print one line per entity. When the target is a single entity ID, the line is just the value; otherwise it starts with the entity ID and a tab, such as `light.bar`, a tab, then `off`.

`--bar-json` describes a single entity. With it, `get` fails when the target matches more than one entity, and `watch` fails as soon as a second entity appears.

`watch` skips a line identical to the entity's previous line, so `--field state` only prints when the state changes.

## Covers and climate

`cover watch` and `climate watch` take the same target as the [action commands](/actions), with entity IDs with or without the domain, and always print bar JSON with a summary of the entity. The target has to match one entity:

```bash
ha-bridge cover watch office_blind
# {"class":"open","name":"Office Blind","text":"open • 40%","tooltip":"open • 40%"}

ha-bridge climate watch --entity "Air Conditioner"
# {"class":"cool","name":"Air Conditioner","text":"Cool • Low • 21 °C","tooltip":"Cool • Low • 21 °C"}
```

- Covers show the state, then the current tilt position when the cover has one.
- Climate entities show the HVAC mode (`cool` as `Cool`), the fan mode (`1` as `Low`, `2` as `High`) and the target temperature.
- Both show `unavailable` on its own when the entity is unavailable.

## When the bridge goes away

A watcher prints nothing until the bridge is connected to Home Assistant, then keeps running across reconnects. After a reconnect, or when a registry changes, the bridge expands the target again: a watcher prints entities that now match, and stops printing ones that no longer do. When an entity or its device is renamed, watchers print again with the new name.

A watcher exits with status 1 when it can't reach the bridge, when the bridge stops, or when its target stops resolving, such as an area name that no longer exists. Run watchers under something that restarts them, such as Waybar's `restart-interval` or a systemd unit with `Restart=on-failure`.
