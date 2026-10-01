---
title: Remotes
description: Turn remotes on and off, send commands, and learn or delete commands.
---

`remote` has `turn-on` (`on`), `turn-off` (`off`) and `toggle` (`t`). `turn-on` takes `--activity`, one of the remote's `activity_list`:

```bash
ha-bridge remote turn-on living_room --activity "Watch TV"
ha-bridge remote turn-off living_room
```

## Sending commands

`send-command` sends one or more commands in order. `--device` picks the device they're for:

```bash
ha-bridge remote send-command living_room power
ha-bridge remote send-command living_room volume_up volume_up --device tv
ha-bridge remote send-command living_room volume_up --num-repeats 5 --delay-secs 0.2
```

| Flag | Value |
| --- | --- |
| `--num-repeats` | Times to repeat the commands (default: 1) |
| `--delay-secs` | Seconds between commands (default: 0.4) |
| `--hold-secs` | Seconds to hold each command (default: 0) |

## Learning and deleting commands

`learn-command` waits for you to press buttons on the physical remote and saves them under the names you give. `delete-command` removes them:

```bash
ha-bridge remote learn-command living_room power --device tv --command-type ir
ha-bridge remote delete-command living_room power --device tv
```

`learn-command` also takes `--alternative`, to save a second code for a command, and `--timeout` in seconds.

| Command | Home Assistant action |
| --- | --- |
| `remote turn-on` | `remote.turn_on` |
| `remote turn-off` | `remote.turn_off` |
| `remote toggle` | `remote.toggle` |
| `remote send-command` | `remote.send_command` |
| `remote learn-command` | `remote.learn_command` |
| `remote delete-command` | `remote.delete_command` |

See [`ha-bridge remote`](/reference/commands/remote) for every argument and flag.
