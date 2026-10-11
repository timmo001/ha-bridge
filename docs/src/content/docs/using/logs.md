---
title: Logs
description: Read, watch and search Home Assistant's logs, from Core's errors to the Supervisor, host, plugins and apps.
---

`logs` reads Home Assistant's logs through the bridge. Every log needs a token that belongs to an admin user. The bridge checks before asking Home Assistant, and a token without admin rights gets a clear message and exit code 1 rather than Home Assistant's refusal.

The areas and their aliases follow the Home Assistant CLI's `ha <area> logs`:

| Command | Alias | Log |
| --- | --- | --- |
| `logs core` | `logs ha` | Home Assistant Core |
| `logs supervisor` | `logs su` | The Supervisor |
| `logs host` | `logs ho` | The host's journal |
| `logs apps` | `logs addons` | An app, by its slug |
| `logs audio` | `logs snd` | The audio plugin |
| `logs cli` | | The CLI plugin |
| `logs dns` | | The DNS plugin |
| `logs multicast` | `logs mc` | The multicast plugin |
| `logs observer` | | The observer plugin |

Every log but Core's needs the Supervisor, so Home Assistant OS or a Supervised install. Without one, those commands say so and exit with code 1.

## Reading a log

`get` prints a log's latest records, oldest first:

```bash
ha-bridge logs core get -n 50
ha-bridge logs supervisor get --verbose
ha-bridge logs host get --boot -1
ha-bridge logs apps get core_mosquitto
```

- `-n`, `--lines` sets how many of the latest records to print. The Supervisor prints 100 when it's left out, and at least 2.
- `-b`, `--boot` reads an earlier boot by offset: `0` for this one, `-1` for the one before, and so on. `logs host boots` lists them with their boot IDs.
- `--verbose` adds the time, host and process to each line, as the journal records them.
- `--json` prints the records as one JSON list.

Core's records keep their tracebacks with them, so `-n` counts whole records rather than lines. `logs core get --latest` reads only what was logged since Core last started; Home Assistant doesn't allow it for the other logs. Without a Supervisor, `logs core get` reads Core's log file instead, which has no boots. `--integration mqtt` reads only an integration's records, including the libraries it uses, from Core's live log, which needs Home Assistant 2026.11 or newer.

`logs apps list` lists the installed apps, with the slug each log command takes.

## Watching a log

`watch` prints a log's latest records, then each new one:

```bash
ha-bridge logs supervisor watch -n 5
ha-bridge logs apps watch core_zwave_js
ha-bridge logs core watch --integration zha
```

It takes `-n`, `--verbose` and `--json` as `get` does, printing each record as JSON. A Supervisor log starts with its last 10 records when `-n` is left out. It follows reconnects: a Supervisor log carries on from the journal entry it reached, so it doesn't print what it already printed.

`logs core watch` streams Core's log as it's written, starting with the end of the log file: its last 100 lines, or an integration's last 5000. After a reconnect, it leaves out what it already printed. It needs Home Assistant 2026.11 or newer, and on an older Core it says so and exits with code 1.

## Core's errors

`logs core errors get` lists the errors and warnings Core keeps, as Settings > System > Logs shows them, newest first: the time, level, logger and latest message, with how many times it happened:

```bash
ha-bridge logs core errors get
ha-bridge logs core errors watch --search mqtt
```

Core merges repeats of the same error into one entry and keeps the latest 50. `logs core errors watch` prints each new error and each repeat of an earlier one. Core only announces them with `fire_event` turned on, so the bridge reads the list every 5 seconds instead, and works on every install. `--json` prints each entry as Home Assistant sends it.

## Searching

`--search` on `get` and `watch` keeps only the records that match, in time order. It's typo-tolerant, like [`ha-bridge search`](/using/search), and every word has to match somewhere in the record, so a traceback matches by any of its lines.

`logs search` searches several logs at once and ranks the matches, best first:

```bash
ha-bridge logs search mqtt disconnected
ha-bridge logs search "timeout" --source supervisor --source core_zwave_js
```

It searches Core's errors and Core's log by default; `--source` takes `errors`, an area or an app's slug, and repeats. `-n` sets how many of each log's latest records to search, 1000 by default. `--limit` and `--page` page through the results as `ha-bridge search` does, and `--json` prints `{ "results", "total" }`, each result with its `source`, `record` and `score`.
