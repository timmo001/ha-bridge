---
title: Calendars and weather
description: Read and add calendar events, and read weather forecasts.
---

## Calendars

`calendar events` prints events from now to `--days` ahead (default: 7) as JSON:

```bash
ha-bridge calendar events family --days 14
```

`create-event` adds an event. Give `--start` and `--end` as dates for an all-day event (the end is exclusive) or as dates and times, or use `--in-days` or `--in-weeks` for an all-day event that far from today:

```bash
ha-bridge calendar create-event family "Dentist" --start "2026-10-02 09:00" --end "2026-10-02 10:00" --location "High Street"
ha-bridge calendar create-event family "Holiday" --start 2026-12-20 --end 2026-12-27
ha-bridge calendar create-event family "Renew insurance" --in-weeks 2
```

## Weather

`weather forecast` prints the forecast as JSON. `--type` is `daily` (the default), `hourly` or `twice_daily`:

```bash
ha-bridge weather forecast home --type hourly
```

| Command | Home Assistant action |
| --- | --- |
| `calendar events` | `calendar.get_events` |
| `calendar create-event` | `calendar.create_event` |
| `weather forecast` | `weather.get_forecasts` |

See [`ha-bridge calendar`](/reference/commands/calendar) and [`ha-bridge weather`](/reference/commands/weather) for every argument and flag.
