---
title: Reading entities
description: Read or stream Home Assistant entity state into scripts and status bars through the bridge.
---

`get entity` prints an entity's state once. Watch commands print it straight away, then again on every change. Each is a small client of the bridge, so any number of them share the bridge's one Home Assistant connection.

## Any entity

`watch entity` (`w e`) takes the **full** entity ID:

```bash
ha-bridge watch entity input_boolean.guest_mode
```

Without an output flag it prints the raw state on each line and warns on stderr that scripts should use JSON.

`--json` prints the full entity update, the same shape the [bridge protocol](/using/protocol#rpcs) sends, including Home Assistant's timestamps and context:

```bash
ha-bridge watch entity sun.sun --json
# {"state":{"entity_id":"sun.sun","state":"above_horizon","attributes":{...},"last_changed":"...","last_reported":"...","last_updated":"...","context":{...}},"name":"Sun"}
```

`--field` picks values by path, the same paths as [bar templates](/using/bar-json#templates). One field prints its raw value; several, or one with `--json`, print an object keyed by path, with `null` for anything missing:

```bash
ha-bridge watch entity light.office --field state
# on

ha-bridge watch entity light.office --field state --field attributes.brightness
# {"state":"on","attributes.brightness":128}
```

A line identical to the one before it is skipped, so `--field state` only prints when the state changes.

With `--bar-json` it prints one JSON object per line for status bars and scripts:

```bash
ha-bridge watch entity input_boolean.guest_mode \
  --bar-json \
  --text-on "Guest" \
  --tooltip-on "Guest mode is on" \
  --tooltip-off "Guest mode is off" \
  --class-on active \
  --class-off inactive
```

See [Bar JSON](/using/bar-json) for the output and every flag.

## Reading once

`get entity` (`g e`) takes the same entity ID and output flags as `watch entity`, but prints the current state once and exits. It exits with status 1 when the bridge has no state for the entity.

```bash
ha-bridge get entity light.office --field state
# on

ha-bridge get entity input_boolean.guest_mode --bar-json --text-on "Guest"
```

## Covers and climate

`cover watch` and `climate watch` take the entity name without its domain, like the [action commands](/actions), and always print bar JSON with a summary of the entity:

```bash
ha-bridge cover watch office_blind
# {"class":"open","name":"Office Blind","text":"open • 40%","tooltip":"open • 40%"}

ha-bridge climate watch air_conditioner
# {"class":"cool","name":"Air Conditioner","text":"Cool • Low • 21 °C","tooltip":"Cool • Low • 21 °C"}
```

- Covers show the state, then the current tilt position when the cover has one.
- Climate entities show the HVAC mode (`cool` as `Cool`), the fan mode (`1` as `Low`, `2` as `High`) and the target temperature.
- Both show `unavailable` on its own when the entity is unavailable.

## When the bridge goes away

A watcher prints nothing until the bridge has a state for the entity, then keeps running across Home Assistant reconnects. When an entity or its device is renamed in Home Assistant, watchers print again with the new name. It exits with status 1 when it can't reach the bridge, or when the bridge stops. Run watchers under something that restarts them, such as Waybar's `restart-interval` or a systemd unit with `Restart=on-failure`.
