---
title: Labels, categories and areas
description: Read and change the labels, categories and areas of entities, devices and areas, as Home Assistant's settings pages do.
---

`label`, `category`, `device` and `registry` work with Home Assistant's registries as its settings pages do, so you can organise entities, devices and areas from the shell without Spook or the frontend. Changes need a token that belongs to an admin.

## Reading what an item has

`registry get` prints the labels and area of entities, devices and areas, and each entity's device and categories, with their names. Entities take entity IDs; devices and areas take an ID or a name:

```bash
ha-bridge registry get --entity automation.morning_lights --device "Kitchen speaker" --area kitchen
```

```text
entity Morning lights (automation.morning_lights)
  area: none
  labels: Lighting (lighting)
  category in automation: Lights (01JQ8Y2V5X0C9M1N6T3B7R4K2D)
device Kitchen speaker (5f0c6d1e8b2a4c7d9e3f1a2b4c6d8e0f)
  area: Kitchen (kitchen)
  labels: none
area Kitchen (kitchen)
  labels: Downstairs (downstairs)
```

An entity's `area` is its own. Without one, it's in its device's area, as Home Assistant shows it. Nothing is expanded, so `--area` reads the area itself, not what's in it. `--json` prints a list of `{ "kind", "id", "name", "area", "device_id", "labels", "categories" }`, leaving out what doesn't apply to the kind.

## Labels

```bash
ha-bridge label list
ha-bridge label create "Evening lights" --icon mdi:weather-night --color indigo
ha-bridge label update evening_lights --description "Lights that come on at sunset"
ha-bridge label delete evening_lights
```

`create` prints the new label's ID, which Home Assistant makes from its name. `--color` takes a theme colour, such as `indigo` or `light-blue`, or a hex colour such as `#ff0000`. `update` only changes the fields you pass; an empty value, such as `--icon ""`, clears one. Deleting a label takes it off everything that has it.

`add` and `remove` change the labels of entities, devices and areas, by label ID or name, and keep every other label they have:

```bash
ha-bridge label add "Evening lights" --entity light.porch --entity light.hallway
ha-bridge label add lighting downstairs --device "Kitchen speaker" --area kitchen
ha-bridge label remove "Evening lights" --entity light.porch
```

Each item's labels are read from Home Assistant first, so a label added a moment ago by something else is kept. Items that already have the change are left alone.

## Categories

Categories belong to a scope: `automation`, `script`, `scene` or `helpers` in Home Assistant's own pages. An entity has at most one category in each scope.

```bash
ha-bridge category list automation
ha-bridge category create automation Lighting --icon mdi:lightbulb
ha-bridge category update automation Lighting --name Lights
ha-bridge category delete automation Lights
```

`create` prints the new category's ID. Categories are found by ID or name within their scope. Deleting a category takes every entity out of it.

`set` puts entities in a category, moving them from any other in that scope, and `clear` takes them out. Automations, scripts and scenes use their own domain's scope; helpers and other entities need `--scope`:

```bash
ha-bridge category set Lighting automation.morning_lights automation.evening_lights
ha-bridge category set Guests --scope helpers input_boolean.guest_mode
ha-bridge category clear automation.morning_lights
```

An entity keeps its categories in other scopes.

## Device areas

`device set-area` moves devices to an area, and `device clear-area` takes them out of theirs. Both take device and area IDs or names:

```bash
ha-bridge device set-area Kitchen "Kitchen speaker" "Kettle plug"
ha-bridge device clear-area "Kitchen speaker"
```

A device's entities without an area of their own follow it.

## Output and failures

`label add` and `remove`, `category set` and `clear`, and `device set-area` and `clear-area` print nothing when they succeed. `--json` prints each item afterwards, as `registry get --json` does. A name that matches nothing or more than one label, category, device or area exits 1 and says so, as does an entity Home Assistant has no registry entry for. Without an admin token, changes exit 1 before asking Home Assistant.

See [`label`](/commands/label), [`category`](/commands/category), [`device`](/commands/device) and [`registry`](/commands/registry) for every argument and flag, and [Bridge protocol](/using/protocol#rpcs) for the RPCs behind them.
