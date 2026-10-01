---
title: Migrating from Go Automate
description: What changes when you move from Go Automate to ha-bridge.
---

Home Assistant Bridge replaces [Go Automate](https://github.com/timmo001/go-automate). The commands do the same things, but every command now goes through the bridge, so the bridge service must be running for actions as well as watchers.

## Commands

Drop `go-automate ha` from the front, and `bridge` from the bridge commands:

| Go Automate | Home Assistant Bridge |
| --- | --- |
| `go-automate ha bridge serve` | `ha-bridge serve` |
| `go-automate ha bridge watch entity <entity_id>` | `ha-bridge watch entity <entity_id>` |
| `go-automate ha light toggle <name>` | `ha-bridge light toggle <name>` |
| `go-automate ha cover watch <name>` | `ha-bridge cover watch <name>` |
| `go-automate completion zsh` | `ha-bridge --completions zsh` |

The domain commands, their aliases, arguments and flags are unchanged. `camera snapshot` and `setup` are new. See [Commands](/reference/commands/) for the full list.

## Service and socket

| | Go Automate | Home Assistant Bridge |
| --- | --- | --- |
| User service | `go-automate-home-assistant-bridge.service` | `ha-bridge.service` |
| Socket | `$XDG_RUNTIME_DIR/go-automate/home-assistant.sock` | `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock` |
| Protocol | `get_entity` and `watch_entity` JSON requests | [Effect RPC](/reference/protocol/) |

Scripts that spoke Go Automate's socket protocol directly need moving to the [new protocol](/reference/protocol/) or the [client library](/libraries/).

## Config

You don't need to set anything up again. When `~/.config/ha-bridge/config.yml` doesn't exist, the bridge reads `~/.config/go-automate/config.yml` and copies it across.

Go Automate asked for your URL and token the first time it ran. Home Assistant Bridge doesn't prompt on its own; run `ha-bridge setup` instead.

## Output

Bar JSON has the same fields and key order, with two small differences:

- A `null` target temperature or tilt position is left out of `climate watch` and `cover watch` text, as if the attribute were missing.
- `<`, `>` and `&` are printed as they are, not as `\u003c`, `\u003e` and `\u0026`. JSON parsers read both the same way.

## Switching over

1. Stop and disable the old service:

   ```bash
   systemctl --user disable --now go-automate-home-assistant-bridge.service
   ```

2. [Install](/install/) Home Assistant Bridge, then make sure `ha-bridge.service` is running.
3. Update your key bindings, bar modules and scripts to the new commands.
4. Remove Go Automate.
