---
title: ha-bridge watch
description: Arguments and flags for every ha-bridge watch command.
sidebar:
  label: watch
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge watch` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge watch`

Alias: `ha-bridge w`

```text
DESCRIPTION
  Print the state of every entity a target matches now and on every change

USAGE
  ha-bridge watch [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, such as light.desk; repeat for more (optional)

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --domain string         Only entities in this domain, such as light
  --json                  Print the full entity update as JSON
  --field string          Print only this field, such as state or attributes.brightness; repeat for more
  --bar-json              Print one bar JSON object per state
  --icon string           Same as --text
  --text string           Text template shown instead of the state, such as {attributes.brightness}
  --text-on string        Text appended when the entity is on
  --text-off string       Text appended when the entity is off
  --tooltip string        Tooltip template when no on or off tooltip applies
  --tooltip-on string     Tooltip when the entity is on
  --tooltip-off string    Tooltip when the entity is off
  --class string          Class template when no on or off class applies
  --class-on string       Class when the entity is on
  --class-off string      Class when the entity is off
  --on-state string       State that counts as on; repeat for more (default: on)
  --entity string         Entity ID or name; repeat for more
  --device string         Device ID or name; repeat for more
  --area string           Area ID or name; repeat for more
  --floor string          Floor ID or name; repeat for more
  --label string          Label ID or name; repeat for more
```
