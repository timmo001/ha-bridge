---
title: Actions
description: Control Home Assistant entities from the command line, one action per command.
---

Action commands send one Home Assistant action through the bridge and exit. They exit with status 1 and print the error when the bridge isn't running, the options are invalid, or Home Assistant rejects the action.

## Entity names

Action commands take the entity name **without** its domain, because the command already says which domain it acts on:

```bash
# Acts on light.bedroom_lamp
ha-bridge light turn-on bedroom_lamp
```

[Watch commands](/using/watching/) are different: `watch entity` takes the full entity ID.

## Domains

| Domain | Command | Alias | What it does |
| --- | --- | --- | --- |
| [Lights](/actions/lights/) | `light` | `l` | On, off and toggle, with brightness, colour and effects |
| [Switches](/actions/switches/) | `switch` | `s` | On, off and toggle |
| [Input booleans](/actions/input-booleans/) | `input_boolean` | `ib` | On, off, toggle and reload |
| [Input numbers](/actions/input-numbers/) | `input_number` | `in` | Set, step up or down, and reload |
| [Covers](/actions/covers/) | `cover` | `c` | Open, close, stop, position and tilt |
| [Climate](/actions/climate/) | `climate` | `cl` | HVAC mode, temperature, humidity and other modes |
| [Assist satellites](/actions/assist-satellites/) | `assist_satellite` | `as` | Announce, start a conversation or ask a question |
| [Cameras](/actions/cameras/) | `camera` | None | Snapshots, recording, streams and motion detection |

[Commands](/reference/commands/) lists every argument and flag. Any other action can be called from your own app with [`CallAction`](/libraries/).
