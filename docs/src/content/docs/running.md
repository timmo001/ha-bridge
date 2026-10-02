---
title: Running the bridge
description: Run Home Assistant Bridge as a systemd user service, read its logs and keep it running.
---

`ha-bridge serve` holds the Home Assistant connection. Every other command needs it running, so it normally runs as a systemd user service.

## User service

The packages install `ha-bridge.service` as a user unit. The Arch package enables it for every user's future logins. To start it now, or after installing a `.deb` or `.rpm`:

```bash
systemctl --user daemon-reload
systemctl --user enable --now ha-bridge.service
```

Check it's connected:

```bash
systemctl --user status ha-bridge.service
journalctl --user -u ha-bridge.service -f
```

A healthy start logs `Bridge listening`, `Cached registries` and `Bridge subscribed to Home Assistant`.

The service restarts 5 seconds after it fails, for example when it starts before you've run [setup](/configuration).

User services only run while you're logged in. To keep the bridge running after you log out, enable lingering:

```bash
sudo loginctl enable-linger "$USER"
```

## Connection behaviour

When the bridge connects to Home Assistant, it:

1. Authenticates with your token.
2. Subscribes to `state_changed` events, then reads every entity's state into its cache.
3. Reads the entity, device, area and floor registries, so watchers get the same display names the Home Assistant frontend shows and [search](/using/search) can match devices and areas.

If the connection drops, the bridge reconnects every 5 seconds. Watchers stay connected to the bridge and get every entity's fresh state once it's back. Actions fail with "the bridge is not connected to Home Assistant" until then.

## Upgrades

The Arch package restarts a running service after an upgrade, so it uses the new binary straight away. For other installs, restart it yourself:

```bash
systemctl --user restart ha-bridge.service
```

Watchers exit when the bridge restarts. Run them under something that restarts them, such as a status bar's restart interval or a systemd unit.

## Run in the foreground

To troubleshoot, stop the service and run the bridge in a terminal with debug logs:

```bash
systemctl --user stop ha-bridge.service
ha-bridge serve --log-level debug
```

Use `--socket` to run a second bridge beside the service, for example with a different config:

```bash
XDG_CONFIG_HOME=/tmp/ha-test ha-bridge serve --socket /tmp/ha-test.sock
ha-bridge light toggle desk --socket /tmp/ha-test.sock
```

## Install the unit by hand

When you build from source, copy the unit and point `ExecStart` at your binary:

```bash
mkdir -p ~/.config/systemd/user
cp .scripts/linux/ha-bridge.service ~/.config/systemd/user/
sed -i "s#/usr/bin/ha-bridge#$(command -v ha-bridge)#" ~/.config/systemd/user/ha-bridge.service
systemctl --user daemon-reload
systemctl --user enable --now ha-bridge.service
```
