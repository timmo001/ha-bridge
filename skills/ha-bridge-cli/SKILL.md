---
name: ha-bridge-cli
description: Control and read Home Assistant from the shell, scripts and status bars with the ha-bridge CLI. Use when calling Home Assistant actions, reading or watching entity state, feeding a bar or script with --bar-json, rendering templates, watching events, searching entities, or connecting an app to a running bridge. For changing ha-bridge itself, use its repository's own skills.
license: Apache-2.0
compatibility: Requires the ha-bridge CLI and a running bridge (ha-bridge serve, normally the ha-bridge.service user unit). The docs-ha-bridge MCP server is optional.
---

# ha-bridge CLI

`ha-bridge` keeps one Home Assistant connection per machine and serves it on a Unix socket. Every command except `serve` and `setup` is a small client of that socket.

## Rules

- Go through the bridge. Don't open your own Home Assistant WebSocket or REST connection, or read the token from `~/.config/ha-bridge/config.yml`, to do something a command or the bridge protocol already does.
- Use Home Assistant's current names: actions, not services. Commands are named after the domain (`light`, `media_player`, `alarm_control_panel`), each with action subcommands.
- Look up commands and flags before using them; there are over 90 domains and flags change. Don't guess from memory or from Go Automate, which this replaced.
- Never run `ha-bridge setup` for the user. It prompts for a token; ask them to run it.
- Ask before actions with real-world effects the user didn't request, such as unlocking, opening covers or garage doors, disarming alarms, restarting Home Assistant or running scripts.

## Find the command

1. `ha-bridge search <words>` finds entities, devices, areas and matching ha-bridge commands from the bridge's cache. Use it to turn a name into an entity ID.
2. `ha-bridge <command> --help`, and `--help` on each subcommand, is the reference for the installed version.
3. The docs, through the `docs-ha-bridge` MCP server when it's available (`search_docs`, then `get_page`), or <https://ha-bridge.timmo.dev>.

| Task                                                 | Docs route                                     |
| ---------------------------------------------------- | ---------------------------------------------- |
| Targets, exit codes and the domain list for actions  | `/actions`                                     |
| One domain's actions                                 | `/actions/<domain>`, such as `/actions/lights` |
| Every command, argument and flag                     | `/commands`, `/commands/<command>`             |
| Read or watch state, targets, `--json` and `--field` | `/using/reading`                               |
| Status bar or script output                          | `/using/bar-json`                              |
| Templates                                            | `/using/templates`                             |
| Events, triggers and conditions                      | `/using/events`                                |
| History and logbook                                  | `/using/history`                               |
| Searching                                            | `/using/search`                                |
| Connecting an app or another language                | `/libraries`, `/using/protocol`                |
| Socket path, config and the user service             | `/configuration`, `/running`                   |

## Targets

- Action commands take entity IDs last, with or without the domain (`ha-bridge light turn-on desk`), or `--entity`, `--device`, `--area`, `--floor` and `--label` with an ID or name.
- `get`, `watch` and `homeassistant turn-on`/`turn-off`/`toggle` take full entity IDs, since they cover every domain.
- A name has to match exactly one item, ignoring case, or the command fails and lists the matches. Pick from that list rather than retrying variations.

## Output for scripts and bars

- Never parse the plain output of `get` or `watch`. Use `--json`, `--field <path>`, or `--bar-json`.
- `--bar-json` prints one JSON object per line (`text`, `tooltip`, `class`, `name`) for one entity, and fails when the target matches more than one. It can't be combined with `--json` or `--field`.
- Watchers exit with status 1 when the bridge restarts or can't be reached. Run them under something that restarts them, such as a bar's restart interval or a systemd unit with `Restart=on-failure`.
- For output the flags can't express, use `template watch --bar-json`.

## When it fails

- "could not reach the bridge": the bridge isn't running. Check `systemctl --user status ha-bridge.service`; don't start a second `serve` alongside it.
- "the bridge is not connected to Home Assistant": the bridge is reconnecting, every 5 seconds. Check `journalctl --user -u ha-bridge.service`.
- Commands find the socket from `--socket`, then `$HA_BRIDGE_SOCK`, then `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`. Set `HA_BRIDGE_SOCK` only to target a different bridge, such as a development one.
