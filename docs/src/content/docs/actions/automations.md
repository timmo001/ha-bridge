---
title: Automations
description: Turn automations on and off, trigger them, reload them, and read and change their configs.
---

`automation` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`):

```bash
ha-bridge automation turn-on hallway_motion
ha-bridge automation turn-off hallway_motion
ha-bridge automation toggle hallway_motion
```

`turn-off` stops any running actions. `--no-stop-actions` lets them finish:

```bash
ha-bridge automation turn-off hallway_motion --no-stop-actions
```

## Triggering

`trigger` runs an automation's actions now. It skips the conditions unless you pass `--no-skip-condition`:

```bash
ha-bridge automation trigger hallway_motion
ha-bridge automation trigger hallway_motion --no-skip-condition
```

`automation reload` reloads automations from YAML.

| Command | Home Assistant action |
| --- | --- |
| `automation turn-on` | `automation.turn_on` |
| `automation turn-off` | `automation.turn_off` |
| `automation toggle` | `automation.toggle` |
| `automation trigger` | `automation.trigger` |
| `automation reload` | `automation.reload` |

## Reading and changing configs

`automation config` reads and writes automations as Home Assistant's automation editor does. It needs a token that belongs to an admin.

`config get` prints the config an automation was loaded from as YAML, with its triggers, offsets, conditions and actions. This is where to look when you need to know why an automation ran when it did:

```bash
ha-bridge automation config get office_curtains_sunrise
```

```yaml
id: "1700000000000"
alias: Office curtains at sunrise
triggers:
  - trigger: sun
    event: sunrise
    offset: 00:30:00
conditions: []
actions:
  - action: cover.set_cover_position
    target:
      entity_id: cover.office_curtains
    data:
      position: 90
mode: single
```

`--json` prints `{ "domain", "entity_id", "id", "editable", "config" }`. `editable` says whether the automation is in `automations.yaml`. Automations defined in `configuration.yaml` or a package can be read but not changed.

`create`, `update` and `delete` change `automations.yaml`. `create` and `update` read the config from a YAML or JSON file with `--file` (`-f`), or from stdin with `-f -`. Home Assistant validates it first and refuses a config with mistakes, saying why. `update` replaces all of the automation's config, so start from `config get`:

```bash
ha-bridge automation config get office_curtains_sunrise > curtains.yaml
# edit curtains.yaml
ha-bridge automation config update office_curtains_sunrise -f curtains.yaml
ha-bridge automation config create -f new-automation.yaml
ha-bridge automation config delete office_curtains_sunrise
```

`create` prints the new automation's ID, and makes one up unless you pass `--id`. Home Assistant reloads the automation after saving, so its entity appears shortly after.

See [`ha-bridge automation`](/commands/automation) for every argument and flag.
