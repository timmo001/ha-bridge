---
name: ha-bridge-cli
description: Control and read Home Assistant from the shell, scripts and status bars with the ha-bridge CLI. Use for calling actions, reading or watching state and events, --bar-json output, templates, searching entities, automation and script configs, reading Home Assistant's logs to diagnose or confirm a fix, or connecting an app to a bridge. Not for changing ha-bridge itself.
license: Apache-2.0
compatibility: Requires the ha-bridge CLI and a running bridge (ha-bridge serve, normally the ha-bridge.service user unit on a desktop, or started by the app inside a Home Assistant app). The docs-ha-bridge MCP server is optional.
---

# ha-bridge CLI

`ha-bridge` keeps one Home Assistant connection per machine and serves it on a Unix socket. Every command except `serve` and `setup` is a small client of that socket. When the agent has an `ha-bridge` Code Mode namespace, prefer its tools for the operations it covers (reading state, search, templates, history, logs, configs, calling actions); the rules below still apply.

## Rules

- Go through the bridge. Don't open your own Home Assistant WebSocket or REST connection, or read the token from `~/.config/ha-bridge/config.yml`, to do something a command or the bridge protocol already does.
- Use Home Assistant's current names: actions, not services. Commands are named after the domain (`light`, `media_player`, `alarm_control_panel`), each with action subcommands.
- Look up commands and flags before using them; there are over 90 domains and flags change. Don't guess from memory or from Go Automate, which this replaced.
- Subcommands drop the domain from Home Assistant's action names and use hyphens: `cover.close_cover` is `cover close`, `light.turn_on` is `light turn-on` and `media_player.volume_set` is `media_player volume-set`. Check `ha-bridge <domain> --help` for the list.
- Never run `ha-bridge setup` for the user. It prompts for a token; ask them to run it.
- Ask before actions with real-world effects the user didn't request, such as unlocking, opening covers or garage doors, disarming alarms, restarting Home Assistant or running scripts.
- Ask before `system_log clear` or changing log levels with `logger`. Clearing throws away the evidence a diagnosis needs, and debug levels flood the log.
- Ask before creating, updating or deleting an automation or script the user didn't ask you to change.
- For how Home Assistant itself behaves, and for writing automations and scripts the current way, use the `home-assistant` skill alongside this one.

## Find the command

1. `ha-bridge search <words>` finds entities, devices, areas and matching ha-bridge commands from the bridge's cache. Use it to turn a name into an entity ID.
2. `ha-bridge <command> --help`, and `--help` on each subcommand, is the reference for the installed version.
3. The docs, through the `docs-ha-bridge` MCP server when it's available (`search_docs`, then `get_page`), or <https://ha-bridge.timmo.dev>.

| Task                                                 | Docs route                                     |
| ---------------------------------------------------- | ---------------------------------------------- |
| Targets, exit codes and the domain list for actions  | `/actions`                                     |
| One domain's actions                                 | `/actions/<domain>`, such as `/actions/lights` |
| Automation and script configs                        | `/actions/automations`, `/actions/scripts`     |
| Every command, argument and flag                     | `/commands`, `/commands/<command>`             |
| Read or watch state, targets, `--json` and `--field` | `/using/reading`                               |
| Status bar or script output                          | `/using/bar-json`                              |
| Templates                                            | `/using/templates`                             |
| Events, triggers and conditions                      | `/using/events`                                |
| History and logbook                                  | `/using/history`                               |
| Logs, Core's errors and log search                   | `/using/logs`                                  |
| Searching                                            | `/using/search`                                |
| Connecting an app or another language                | `/libraries`, `/using/protocol`                |
| Socket path, config and the user service             | `/configuration`, `/running`                   |

## Targets

- Action commands take entity IDs last, with or without the domain (`ha-bridge light turn-on desk`), or `--entity`, `--device`, `--area`, `--floor` and `--label` with an ID or name.
- `get`, `watch` and `homeassistant turn-on`/`turn-off`/`toggle` take full entity IDs, since they cover every domain.
- A name has to match exactly one item, ignoring case, or the command fails and lists the matches. Pick from that list rather than retrying variations.

## Output for scripts and bars

- Never parse the plain output of `get` or `watch`. Use `--json`, `--field <path>`, or `--bar-json`.
- `--field` paths start from the state object: `attributes.current_position`, not `state.attributes.current_position`. A path that finds nothing prints an empty line, with a warning on stderr.
- `--bar-json` prints one JSON object per line (`text`, `tooltip`, `class`, `name`) for one entity, and fails when the target matches more than one. It can't be combined with `--json` or `--field`.
- Watchers exit with status 1 when the bridge restarts or can't be reached. Run them under something that restarts them, such as a bar's restart interval or a systemd unit with `Restart=on-failure`.
- For output the flags can't express, use `template watch --bar-json`.

## Automation and script configs

`ha-bridge automation config` and `ha-bridge script config` read and write them as Home Assistant's editors do, and need an admin token.

- To find out why an automation ran when it did, start with `automation config get <automation>`. It prints the exact triggers, offsets, conditions and actions as YAML, so you don't have to infer them from the logbook or history. `--json` adds its `id` and whether it's `editable`.
- `create -f <file>` and `update <automation> -f <file>` take YAML or JSON, or `-f -` for stdin. Home Assistant validates the config and refuses mistakes, saying why. `update` replaces the whole config, so start from `config get` and keep its `id` and `alias`.
- Before saving, run `validate -f <file>`. Saving only catches what Home Assistant's schema rejects; `validate` also lists the entities, actions, devices, areas, floors and labels the config names that don't exist, which Spook would otherwise flag after saving. It exits 1 on any problem, and doesn't need an admin token.
- Try triggers and conditions before saving: `trigger watch '<trigger>'` and `condition test '<condition>'`.
- When writing or changing a config, use Home Assistant's built-in triggers, conditions and actions before templates. The `home-assistant` skill covers which ones exist.
- Only automations in `automations.yaml` and scripts in `scripts.yaml` can be changed. Others exit 1 saying so; edit them where they're defined.

## Logs for diagnosing and fixing

`ha-bridge logs` reads Home Assistant's logs through the bridge. Areas and aliases follow the Home Assistant CLI: `core` (`ha`), `supervisor` (`su`), `host` (`ho`), `apps` (`addons`), `audio`, `cli`, `dns`, `multicast` and `observer`, each with `get` and `watch`. Check `ha-bridge logs <area> <command> --help` for the flags.

To diagnose:

1. Start with `logs core errors get --json`. It's Core's own deduplicated list, the one Settings > System > Logs shows: logger, `source` file and line, messages, traceback, `count`, `first_occurred` and `timestamp`. The logger names the integration, as `homeassistant.components.<domain>` or `custom_components.<domain>`.
2. Widen with `logs search <words> --json`, which ranks matches across Core's errors and Core's log; add `--source` for the Supervisor, the host or an app's slug. Every word has to match, so search for one distinctive term first, then narrow.
3. For context around an error, read the log itself: `logs core get -n 200 --json`, or `logs core get --integration <domain>` for one integration and its libraries (Home Assistant 2026.11 or newer). Core's records keep their tracebacks, and `-n` counts records, not lines.
4. For a crash or restart, read the boot before: `logs host boots`, then `logs host get --boot -1` or `logs core get --boot -1`. `logs apps list` gives the slugs for app logs.

To confirm a fix, note the error's `count` and `timestamp` before, then `logs core errors watch --json --search <term>`. It prints each new error and each repeat, so silence after the change is the evidence. `logs <area> watch` follows a log the same way.

- Parse `--json`, never the plain text. `get` prints one JSON list of records; `watch` prints each record as a JSON string per line.
- Logs need a token that belongs to an admin, and every log but Core's needs a Supervisor. When one can't be read, the command exits 1 with a message saying why: no admin rights, no Supervisor, or a Home Assistant too old for it, such as `logs core watch` before 2026.11. Treat that as "this log isn't available" and carry on with the others; retrying won't change it.
- Logs hold IP and MAC addresses, hostnames, device and person names, and sometimes URLs with credentials. Redact them before anything leaves the machine: issues, pull requests, chats, or a model or service elsewhere.

## Inside a Home Assistant app

You're inside a Home Assistant app when `SUPERVISOR_TOKEN` is set. The bridge then connects through the Supervisor with the app's token, so there's no config file and nothing to set up.

- The app starts `ha-bridge serve` itself. Don't run `serve` or `setup`.
- There's no systemd. When the bridge can't be reached or isn't connected, ask the user to check the app's log in Home Assistant (Settings > Apps > the app > Log).
- What the bridge can read depends on the app's own permissions. A log command that says a setting such as `hassio_api` is missing means the app doesn't have it; only the app can change that, so carry on with the logs you can read.

## When it fails

- "could not reach the bridge": the bridge isn't running. Check the `ha-bridge.service` user unit's status (the `systemd` Code Mode namespace, or `systemctl --user status ha-bridge.service`), or the app's log inside an app; don't start a second `serve` alongside it.
- "the bridge is not connected to Home Assistant": the bridge is reconnecting, every 5 seconds. Check the unit's journal (the `systemd` namespace's logs, or `journalctl --user -u ha-bridge.service`), or the app's log inside an app.
- Commands find the socket from `--socket`, then `$HA_BRIDGE_SOCK`, then `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`. Set `HA_BRIDGE_SOCK` only to target a different bridge, such as a development one.
