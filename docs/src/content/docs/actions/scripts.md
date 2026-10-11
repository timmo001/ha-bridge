---
title: Scripts
description: Start, stop and run scripts, with variables and responses, and read and change their configs.
---

`script turn-on` (`on`) starts a script and returns straight away. `turn-off` (`off`) stops it and `toggle` (`t`) does either:

```bash
ha-bridge script turn-on morning_routine
ha-bridge script turn-off morning_routine
ha-bridge script toggle morning_routine
```

## Running and waiting

`script run` runs the script, waits for it to finish and prints its response as JSON. A script sets its response with a `stop` action and `response_variable`; scripts without one print `null`:

```bash
ha-bridge script run get_bin_day
```

```json
{"bin":"recycling","day":"Thursday"}
```

## Variables

`turn-on` and `run` take `--variables`, a JSON object the script reads as variables:

```bash
ha-bridge script run announce_weather --variables '{"room":"kitchen"}'
```

`script reload` reloads scripts from YAML.

| Command | Home Assistant action |
| --- | --- |
| `script turn-on` | `script.turn_on` |
| `script turn-off` | `script.turn_off` |
| `script toggle` | `script.toggle` |
| `script run` | `script.<name>` |
| `script reload` | `script.reload` |

## Reading and changing configs

`script config` reads and writes scripts as Home Assistant's script editor does, the same way as [`automation config`](/actions/automations#reading-and-changing-configs). It needs a token that belongs to an admin.

```bash
ha-bridge script config get morning_routine
ha-bridge script config update morning_routine -f morning.yaml
ha-bridge script config create -f new-script.yaml
ha-bridge script config delete morning_routine
```

`config get` prints the script's config as YAML, or `{ "domain", "entity_id", "id", "editable", "config" }` with `--json`. `create`, `update` and `delete` change `scripts.yaml`, and only scripts in it can be changed. A new script's key comes from its `alias` unless you pass `--id`, such as `--id morning_routine`, and `create` prints it.

See [`ha-bridge script`](/commands/script) for every argument and flag.
