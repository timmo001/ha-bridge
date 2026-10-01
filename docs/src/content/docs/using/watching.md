---
title: Watching entities
description: Stream Home Assistant entity state into scripts and status bars through the bridge.
---

Watch commands print an entity's state straight away, then again on every change. Each watcher is a small client of the bridge, so any number of them share the bridge's one Home Assistant connection.

## Any entity

`watch entity` (`w e`) takes the **full** entity ID:

```bash
ha-bridge watch entity input_boolean.guest_mode
```

Without `--bar-json` it prints the raw state on each line and warns on stderr that scripts should use JSON. With `--bar-json` it prints one JSON object per line for status bars and scripts:

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

A watcher prints nothing until the bridge has a state for the entity, then keeps running across Home Assistant reconnects. It exits with status 1 when it can't reach the bridge, or when the bridge stops. Run watchers under something that restarts them, such as Waybar's `restart-interval` or a systemd unit with `Restart=on-failure`.
