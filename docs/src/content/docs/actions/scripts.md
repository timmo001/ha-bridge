---
title: Scripts
description: Start, stop and run scripts, with variables and responses.
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

See [`ha-bridge script`](/reference/commands/script) for every argument and flag.
