---
title: Alarm panels
description: Arm, disarm and trigger alarm control panels.
---

`alarm_control_panel` (`alarm`) arms, disarms or triggers a panel. Each takes `--code` for panels that need one:

```bash
ha-bridge alarm arm-away house --code 1234
ha-bridge alarm arm-home house
ha-bridge alarm arm-night house
ha-bridge alarm arm-vacation house
ha-bridge alarm arm-custom-bypass house
ha-bridge alarm disarm house --code 1234
ha-bridge alarm trigger house
```

| Command | Home Assistant action |
| --- | --- |
| `alarm disarm` | `alarm_control_panel.alarm_disarm` |
| `alarm arm-home` | `alarm_control_panel.alarm_arm_home` |
| `alarm arm-away` | `alarm_control_panel.alarm_arm_away` |
| `alarm arm-night` | `alarm_control_panel.alarm_arm_night` |
| `alarm arm-vacation` | `alarm_control_panel.alarm_arm_vacation` |
| `alarm arm-custom-bypass` | `alarm_control_panel.alarm_arm_custom_bypass` |
| `alarm trigger` | `alarm_control_panel.alarm_trigger` |

See [`ha-bridge alarm_control_panel`](/commands/alarm-control-panel) for every argument and flag.
