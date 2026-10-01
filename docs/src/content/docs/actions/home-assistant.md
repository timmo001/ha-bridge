---
title: Home Assistant
description: Control entities of any domain, restart Home Assistant and reload its configuration.
---

## Any entity

`homeassistant turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`) work on entities of any domain that can be turned on and off. Unlike the other action commands, they take **full entity IDs**, one or more:

```bash
ha-bridge homeassistant turn-off light.desk switch.monitor fan.office
```

`update-entity` asks integrations to refresh entities now, rather than at their next update:

```bash
ha-bridge homeassistant update-entity sensor.outdoor_temperature
```

## Restarting and reloading

```bash
ha-bridge homeassistant check-config
ha-bridge homeassistant restart
ha-bridge homeassistant restart --safe-mode
ha-bridge homeassistant stop
ha-bridge homeassistant reload-all
ha-bridge homeassistant reload-core-config
ha-bridge homeassistant reload-custom-templates
ha-bridge homeassistant reload-config-entry 01JABCDEF
ha-bridge homeassistant save-persistent-states
ha-bridge zone reload
ha-bridge person reload
```

`restart --safe-mode` starts without custom integrations. `stop` shuts Home Assistant down, and the bridge can't start it again.

## Location

`set-location` sets the home location, with an optional elevation in metres:

```bash
ha-bridge homeassistant set-location 51.5072 -0.1276 --elevation 11
```

| Command | Home Assistant action |
| --- | --- |
| `homeassistant turn-on`, `turn-off`, `toggle` | `homeassistant.turn_on`, `turn_off`, `toggle` |
| `homeassistant update-entity` | `homeassistant.update_entity` |
| `homeassistant check-config` | `homeassistant.check_config` |
| `homeassistant restart` | `homeassistant.restart` |
| `homeassistant stop` | `homeassistant.stop` |
| `homeassistant reload-all` | `homeassistant.reload_all` |
| `homeassistant reload-core-config` | `homeassistant.reload_core_config` |
| `homeassistant reload-custom-templates` | `homeassistant.reload_custom_templates` |
| `homeassistant reload-config-entry` | `homeassistant.reload_config_entry` |
| `homeassistant save-persistent-states` | `homeassistant.save_persistent_states` |
| `homeassistant set-location` | `homeassistant.set_location` |
| `zone reload` | `zone.reload` |
| `person reload` | `person.reload` |

See [`ha-bridge homeassistant`](/reference/commands/homeassistant), [`ha-bridge zone`](/reference/commands/zone) and [`ha-bridge person`](/reference/commands/person) for every argument and flag.
