---
title: ha-bridge timer_list
description: Arguments and flags for every ha-bridge timer_list command.
sidebar:
  label: timer_list
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge timer_list` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge timer_list`

```text
DESCRIPTION
  Timer list actions: lists that each hold many timers

USAGE
  ha-bridge timer_list <subcommand> [flags]

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list create`

```text
DESCRIPTION
  Start a new timer and print its timer_id as JSON, keyed by entity ID

USAGE
  ha-bridge timer_list create [flags] <duration> [<entity_id...>]

ARGUMENTS
  duration string        Seconds or HH:MM:SS
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --name string              Name, such as Pasta
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list get`

```text
DESCRIPTION
  Print each list's timers as JSON, keyed by entity ID

USAGE
  ha-bridge timer_list get [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --status choice            Only timers with this status; repeat for more (default: all) (choices: active, paused, finished, cancelled)
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list pause`

```text
DESCRIPTION
  Pause a timer

USAGE
  ha-bridge timer_list pause [flags] <timer_id> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list unpause`

```text
DESCRIPTION
  Start a paused timer again

USAGE
  ha-bridge timer_list unpause [flags] <timer_id> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list cancel`

```text
DESCRIPTION
  Cancel a timer

USAGE
  ha-bridge timer_list cancel [flags] <timer_id> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list finish`

```text
DESCRIPTION
  Finish a timer now

USAGE
  ha-bridge timer_list finish [flags] <timer_id> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list add-time`

```text
DESCRIPTION
  Add time to a timer

USAGE
  ha-bridge timer_list add-time [flags] <timer_id> <duration> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  duration string        Seconds or HH:MM:SS
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list subtract-time`

```text
DESCRIPTION
  Take time off a timer

USAGE
  ha-bridge timer_list subtract-time [flags] <timer_id> <duration> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  duration string        Seconds or HH:MM:SS
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge timer_list remove`

```text
DESCRIPTION
  Remove a timer from the list

USAGE
  ha-bridge timer_list remove [flags] <timer_id> [<entity_id...>]

ARGUMENTS
  timer_id string        Timer ID, from create or get
  entity_id... string    Entity ID, with or without the timer_list. prefix; repeat for more (optional)

FLAGS
  --entity string            Entity ID or name; repeat for more
  --device string            Device ID or name; repeat for more
  --area string              Area ID or name; repeat for more
  --floor string             Floor ID or name; repeat for more
  --label string             Label ID or name; repeat for more
  --exclude-entity string    Entity ID or name to leave out; repeat for more
  --exclude-device string    Device ID or name to leave out; repeat for more
  --exclude-area string      Area ID or name to leave out; repeat for more
  --exclude-floor string     Floor ID or name to leave out; repeat for more
  --exclude-label string     Label ID or name to leave out; repeat for more

INHERITED FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
