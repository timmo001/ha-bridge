---
title: Supervisor
description: Start and stop apps, back up and restore, and reboot or shut down the host.
---

`hassio` commands call the Supervisor through Home Assistant, so they only work on installations with the Supervisor, and need an admin token.

## Apps

Apps are named by slug, such as `core_ssh`:

```bash
ha-bridge hassio app-start core_ssh
ha-bridge hassio app-restart core_mosquitto
ha-bridge hassio app-stop core_ssh
ha-bridge hassio app-stdin core_ssh "echo hello"
ha-bridge hassio app-stdin my_app '{"command":"refresh"}' --json
```

`app-stdin` writes text, or a JSON object with `--json`.

## Backups

`backup-full` backs up everything and prints the new backup's slug. `backup-partial` backs up only what you pick: `--homeassistant` for the configuration, `--folder` for `share`, `addons/local`, `ssl` or `media`, and `--app` for apps. Repeat `--folder` and `--app` for more:

```bash
ha-bridge hassio backup-full --name "Before upgrade" --exclude-database
ha-bridge hassio backup-partial --homeassistant --folder share --app core_mosquitto
```

Backups are compressed and saved locally unless you pass `--no-compressed` or a backup mount with `--location`. `--password` protects them.

`restore-full` and `restore-partial` take the slug, and the same choices for a partial restore:

```bash
ha-bridge hassio restore-partial 1a2b3c4d --homeassistant --password secret
```

## Host and mounts

```bash
ha-bridge hassio host-reboot
ha-bridge hassio host-shutdown
ha-bridge hassio mount-reload "NAS media"
```

`mount-reload` takes the mount's device ID or name.

| Command | Home Assistant action |
| --- | --- |
| `hassio app-start`, `app-stop`, `app-restart`, `app-stdin` | `hassio.app_start`, `app_stop`, `app_restart`, `app_stdin` |
| `hassio backup-full`, `backup-partial` | `hassio.backup_full`, `backup_partial` |
| `hassio restore-full`, `restore-partial` | `hassio.restore_full`, `restore_partial` |
| `hassio host-reboot`, `host-shutdown` | `hassio.host_reboot`, `host_shutdown` |
| `hassio mount-reload` | `hassio.mount_reload` |
