---
title: History and logbook
description: Read recorded entity history and logbook entries, and watch new logbook entries.
---

## History

`history get` prints the recorded states of the target's entities, one line per change, with the time, entity ID and state:

```bash
ha-bridge history get sun.sun --start "2 days"
ha-bridge history get --area office --start 2026-10-01T00:00:00Z --end 2026-10-02T00:00:00Z
```

`--start` and `--end` take an ISO time or a duration before now, such as `2 hours` or `3 days`. `--start` defaults to `1 day` and `--end` to now. Times are printed in UTC.

`--json` prints the history as one JSON object, keyed by entity ID, with each state's `state`, `attributes`, `last_changed` and `last_updated`. `--no-attributes` leaves out attributes, which makes long histories much smaller. `--all-changes` also includes changes to attributes alone, for entities whose attribute changes Home Assistant leaves out by default, such as climate entities.

## Logbook

`logbook get` prints logbook entries, one per line, with the time and the entry. Give a target to see only its entities and devices; without one, it prints every entry:

```bash
ha-bridge logbook get --start "1 hour"
ha-bridge logbook get --device "Front door" --start "1 week" --json
```

It takes the same `--start`, `--end` and `--json` flags as `history get`.

`logbook watch` prints new entries as they happen, for a target or for everything. After the bridge reconnects, it carries on from that moment, so it doesn't repeat entries:

```bash
ha-bridge logbook watch --area kitchen
```

`logbook log` adds an entry; see [System](/actions/system#logbook-and-system-log).
