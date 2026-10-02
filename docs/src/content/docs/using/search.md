---
title: Searching
description: Find Home Assistant entities, devices and areas, and ha-bridge commands, with fuzzy search.
---

`search` finds entities, devices and areas from the bridge's cache, and the ha-bridge commands that match, much like the Home Assistant quick bar:

```bash
ha-bridge search kitchen light --limit 2
# entity  script.lights_kitchen  Lights - Kitchen  Kitchen, Downstairs
# device  d88d33d052088faa8338c9a94a31b9ca  2M Wire Rope Light  Kitchen, Downstairs

ha-bridge search light on --kind command
# command  ha-bridge light turn-on  Turn on  ha-bridge l on
```

Each line is the kind, the ID, the name and its context, separated by tabs. Entities and devices show their area and floor, and commands show their description and short alias. When there are more matches than shown, a summary on stderr says how many.

## Matching

Every word must match some field, and words can match different fields, so `kitchen light` finds a light in the kitchen area. Small typos still match, and accents are ignored.

| Kind | Fields, from most to least important |
| --- | --- |
| Entity | Name, friendly name, device, parent device, area, domain, floor, entity ID |
| Device | Name, area, its entities' domains, parent device, floor |
| Area | Name, floor, area ID |
| Command | Command, description, alias, command group |

Names are the ones Home Assistant dashboards show, as described in [Bar JSON](/using/bar-json#output). A child device without its own area is in its parent's area. Disabled devices are left out. Aliases aren't searched.

Results far below the best match are dropped. The rest are ranked by score, with shorter names first when scores are close.

## Filters

| Flag | Effect |
| --- | --- |
| `--kind` | Only `entity`, `device`, `area` or `command`; repeat for more |
| `--domain` | Only entities in this domain, and the devices, areas and commands for it |
| `--area` | Only entities, devices and areas in this area, by area ID or name |
| `--device-class` | Only entities with this device class, and their devices and areas |

Commands have no area or device class, so `--area` and `--device-class` leave them out.

## More results

`--limit` sets how many results to show (default 20). `--page` shows a later page of `--limit` results, starting at 1:

```bash
ha-bridge search temperature --limit 10 --page 2
```

`--json` prints `{ "results", "total", "unavailable" }`, plus `page` and `pages` with `--page`. Results are the [search matches](/using/protocol#rpcs) the bridge sends, and commands appear as `{ "kind": "command", "id", "name", "score", "matched", "description", "alias" }`.

If the bridge couldn't load a registry, search still runs and warns on stderr that results may be incomplete.
