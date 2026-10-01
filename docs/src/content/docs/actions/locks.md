---
title: Locks
description: Lock, unlock and open locks.
---

`lock` has `lock`, `unlock` and `open`, which opens the latch on locks that have one. Each takes `--code` for locks that need a code:

```bash
ha-bridge lock lock front_door
ha-bridge lock unlock front_door --code 1234
ha-bridge lock open front_door
```

| Command | Home Assistant action |
| --- | --- |
| `lock lock` | `lock.lock` |
| `lock unlock` | `lock.unlock` |
| `lock open` | `lock.open` |

See [`ha-bridge lock`](/commands/lock) for every argument and flag.
