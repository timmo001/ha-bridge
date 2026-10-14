---
title: Configuration
description: Point Home Assistant Bridge at your Home Assistant URL and a long-lived access token.
---

The bridge needs your Home Assistant URL and a long-lived access token. Only `ha-bridge serve` reads them; every other command talks to the bridge socket.

## Set up

Run setup once in a terminal:

```bash
ha-bridge setup
```

It asks for your URL and token, then saves them. The token isn't shown as you type or paste it. Run it again to change either value; it offers your saved URL as the default.

If the bridge service is already running, restart it so it uses the new values:

```bash
systemctl --user restart ha-bridge.service
```

A service that started before you ran setup keeps retrying every 5 seconds, so it picks up a new config without a restart.

## Config file

Setup writes `config.yml` in `$XDG_CONFIG_HOME/ha-bridge`, which is usually `~/.config/ha-bridge/config.yml`:

```yaml
homeassistant:
  url: http://homeassistant.local:8123
  token: your-long-lived-access-token
```

- `homeassistant.url`: your Home Assistant base URL, starting with `http://` or `https://`. The bridge connects over `ws://` or `wss://` to match.
- `homeassistant.token`: a long-lived access token.

The directory is only readable by you (`0700`) and the file by you (`0600`). The config is per user, so run setup as the same user that runs the bridge service.

### Go Automate config

If `~/.config/ha-bridge/config.yml` doesn't exist, the bridge reads `~/.config/go-automate/config.yml` instead and copies it to the new location. See [Migrating from Go Automate](/from-go-automate).

## Inside a Home Assistant app

A Home Assistant app can run the bridge in its own container with no config file. When neither config file exists and `SUPERVISOR_TOKEN` is set, as it is in every app, `ha-bridge serve` connects to Home Assistant through the Supervisor at `http://supervisor/core` with that token. A config file still wins if there is one, and `serve` logs which one it uses when it starts: `Using config file` with its path, or `No config file, using SUPERVISOR_TOKEN`. Moving a config file away takes effect when the bridge restarts.

The app starts `ha-bridge serve` itself, then runs commands against its socket. Set `HA_BRIDGE_SOCK` for both if you want a fixed socket path.

The app's `config.yaml` needs:

```yaml
homeassistant_api: true
# For logs from the Supervisor, the host, its plugins and apps:
hassio_api: true
hassio_role: manager
```

`homeassistant_api` covers states, actions, watches, automation and script configs and Core's log. Inside an app, the Supervisor won't serve its logs through Home Assistant, so the bridge asks the Supervisor API directly, which needs `hassio_api`. The `homeassistant` role is enough for Core's log; the rest need `manager`. Without them, `logs core get` falls back to Core's log file, and the other log commands say which setting is missing.

## Create a long-lived access token

1. In Home Assistant, open your profile.
2. Go to the **Security** tab and scroll to **Long-lived access tokens**.
3. Select **Create token**, name it (for example `ha-bridge`) and copy the value.

Home Assistant only shows the token once, so paste it straight into `ha-bridge setup`.

## Socket path

Commands find the bridge socket in this order:

1. `--socket <path>`
2. `$HA_BRIDGE_SOCK`
3. `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`
4. `$TMPDIR/ha-bridge-$USER/ha-bridge.sock`, falling back to `/tmp` and `default`

`ha-bridge serve` uses the same order to decide where to listen, so the defaults always match.
