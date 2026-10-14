---
name: home-assistant
description: Look up how Home Assistant behaves in its official docs and source, and write automations, scripts, triggers and conditions the current way. Use when explaining why an automation ran when it did, how an integration, trigger, condition, action or entity state works, or when writing or changing an automation or script, preferring Home Assistant's purpose-specific triggers, conditions and actions such as light.turned_on and light.is_on over templates. Pairs with the ha-bridge-cli skill, which reads, tests and saves them through the bridge.
license: Apache-2.0
compatibility: Needs search or fetch tools for the docs. Reading and changing a live Home Assistant needs the ha-bridge-cli skill and a running bridge.
---

# Home Assistant

This skill is the reference half: how Home Assistant works and how to write for it. The `ha-bridge-cli` skill is the hands: it reads configs, state, history and logs, tests triggers and conditions, and saves automations and scripts. Load both when you diagnose or change a real home.

## Rules

- Check behaviour in the docs or Core's source, not memory. Home Assistant renames things and adds features every month: services became actions, `platform:` became `trigger:`, and triggers and conditions gained purpose-specific forms.
- Use current names and syntax: actions, not services, and `triggers`, `conditions` and `actions` keys with `trigger:` and `action:` in each item.
- Use what Home Assistant provides before a template. Prefer purpose-specific triggers, conditions and actions, then the general ones, and write a template only when none of them can express it (see below).
- Say which source you used, and say when the docs and the installed version may differ.

## Where to look

Use the search and fetch tools you have against the sites below, for example a web search limited to `site:home-assistant.io`, then fetch the page. Use the best way in that you find for each site.

| What | Where |
| --- | --- |
| An integration: its entities, actions, triggers, options and known limits | `https://www.home-assistant.io/integrations/<domain>/` |
| Triggers, conditions, actions, modes and templating in automations | `https://www.home-assistant.io/docs/automation/` (`trigger/`, `condition/`, `action/`, `modes/`, `templating/`) |
| Scripts and their actions | `https://www.home-assistant.io/docs/scripts/` |
| Templates | `https://www.home-assistant.io/docs/configuration/templating/` |
| Release notes, for when something changed | `https://www.home-assistant.io/blog/categories/release-notes/` |
| APIs and integration internals | `https://developers.home-assistant.io/` |

The docs' sources are in the `home-assistant/home-assistant.io` repository on GitHub (`source/_integrations/<domain>.markdown`, `source/_docs/...`), which are easier to read than the HTML when you have a GitHub tool.

The docs can lag behind Core. For what the installed version accepts, Core's source in `home-assistant/core` is the authority:

- `homeassistant/components/<domain>/triggers.yaml` and `conditions.yaml`: the purpose-specific triggers and conditions and their options.
- `homeassistant/components/<domain>/services.yaml`: each action's fields.
- `homeassistant/components/<domain>/strings.json`: the names the UI shows for all of them.

Read the tag for the installed version, such as `2026.10.0`, rather than `dev`. On installs with a Supervisor, `ha-bridge get update.home_assistant_core_update --field attributes.installed_version` gives it.

## Purpose-specific triggers and conditions

Home Assistant has triggers and conditions named for what they mean, such as `light.turned_on`, `door.opened`, `sun.sunrise` and `light.is_on`, alongside the general `state`, `numeric_state`, `sun` and `template` ones. They read better, take targets (entities, devices, areas, floors and labels) and cover cases that need several general triggers. Prefer them, and fall back to the general ones only when no purpose-specific one fits or the installed Home Assistant doesn't have it.

They take a `target` and their settings under `options`:

```yaml
triggers:
  - trigger: light.turned_on
    target:
      area_id: office
    options:
      behavior: each # each, first or all lights in the target
      for: "00:01:00"
  - trigger: sun.sunrise
    options:
      offset:
        minutes: 30
      offset_type: after
conditions:
  - condition: light.is_on
    target:
      area_id: office
    options:
      behavior: any # any or all lights in the target
  - condition: sun.is_up
```

- Find what exists for a domain in its `triggers.yaml` and `conditions.yaml`, such as `light`: `turned_on`, `turned_off`, `brightness_changed`, `brightness_crossed_threshold`, and the conditions `is_on`, `is_off` and `is_brightness`. Many are named for device classes rather than domains: `door`, `window`, `garage_door`, `motion`, `occupancy`, `temperature`, `humidity`, `illuminance`, `power` and `battery`.
- They often handle edge cases a template would otherwise patch. Entity triggers such as `power.crossed_threshold` ignore changes from `unavailable` or `unknown`, so a device coming back online doesn't fire them; a `numeric_state` trigger needs a template condition on `trigger.from_state` for the same result. Check the trigger's code in `homeassistant/helpers/trigger/` when it matters.
- Before reaching for a template trigger, condition, value or action, look for a built-in that does the job: a purpose-specific trigger or condition, `numeric_state` or `state` with `attribute`, `for`, `not_from` or `not_to`, a domain's own action rather than a generic one, or a helper entity (such as a threshold, derivative or group). Keep templates for what genuinely needs one, such as message text built from several states.
- A trigger's `behavior` is `each` (fire for every target entity), `first` (when the first one changes) or `all` (when the last one does). A condition's is `any` or `all`.
- Before saving, try them on the live home: `ha-bridge condition test '<condition>'` checks a condition now, and `ha-bridge trigger watch '<trigger>'` prints each time a trigger fires. Then check the whole config with `ha-bridge automation config validate -f <file>` (or `script config validate`), which also catches entities and actions that don't exist, and save with `ha-bridge automation config create` or `update`.

## Explaining what happened

- Start from the automation's own config (`ha-bridge automation config get <automation>`), which has the exact triggers, offsets and conditions. Don't infer an offset from timings.
- Then the logbook and history, through `ha-bridge logbook get` and `history get`, for when it ran and what changed.
- `sun.sun`'s state follows the sun's elevation, which Core only recalculates every few minutes (every 2 near the horizon), so its `last_changed` can be minutes after the real sunrise or sunset. For an event's exact time, read the history of `sensor.sun_next_rising`, `sensor.sun_next_setting`, `sensor.sun_next_dawn` or `sensor.sun_next_dusk`: the value before it moved on to the next day is when the event happened. Sun triggers fire at the calculated time plus any offset, not when `sun.sun` changes.
- Odd entity states, such as a cover reporting `closing` while its position rises or positions arriving late, come from the integration or the device, not from ha-bridge or the automation. Check the integration's docs page for known limits, and its issues on GitHub.

## Writing for a real home

- Ask before saving, changing or deleting an automation or script the user didn't ask for, and before running one with real-world effects.
- `automation config update` and `script config update` replace the whole config. Start from `config get`, change what's needed, and keep the `id` and `alias`.
- Only automations in `automations.yaml` and scripts in `scripts.yaml` can be changed this way. Ones in `configuration.yaml` or packages have to be edited in their files.
- When an automation picks between two sets of actions, use `if`, `then` and `else` rather than `choose`, as it's easier to read. Keep `choose` for three or more.
