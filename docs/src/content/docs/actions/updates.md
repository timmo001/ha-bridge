---
title: Updates
description: List, check, install or skip updates.
---

## Reading updates

`update list` (`ls`) lists every update Home Assistant offers, as Settings > Updates does: Core, the OS, the Supervisor, apps, device firmware, HACS and every other integration's. Each line has the entity ID, the name, the state (`on` when an update is waiting) and the versions, separated by tabs. `--available` keeps only updates that are waiting and haven't been skipped. A target, such as `--area` or `--label`, narrows the list:

```bash
ha-bridge update list --available
```

```text
update.home_assistant_core_update  Home Assistant Core Update  on  2026.11.0 -> 2026.11.1
update.esphome_kitchen  Kitchen Firmware  on  2026.9.0 -> 2026.10.0
```

`update get` shows one update in full: its title, integration, versions, progress while installing, what it supports and its release notes:

```bash
ha-bridge update get home_assistant_core_update
```

`update check` checks for new versions now rather than waiting for each integration's next poll, as Settings > Updates > Check for updates does. With a Supervisor and an admin token, it has the Supervisor check for new versions of Core, the OS, itself and its plugins and reload the app store first, which can take up to two minutes. Then it asks every update entity to check again, or only those a target matches. Run `update list` a few seconds later to see what changed.

`--json` prints the bridge's [protocol](/using/protocol#rpcs) result for each.

## Installing and skipping

`update install` installs the latest version, or the one you give with `--version`. `--backup` backs up first, where the integration supports it:

```bash
ha-bridge update install home_assistant_core_update --backup
ha-bridge update install esphome_kitchen --version 2026.9.1
ha-bridge update skip esphome_kitchen
ha-bridge update clear-skipped esphome_kitchen
```

| Command | Home Assistant action |
| --- | --- |
| `update install` | `update.install` |
| `update skip` | `update.skip` |
| `update clear-skipped` | `update.clear_skipped` |

See [`ha-bridge update`](/commands/update) for every argument and flag.
