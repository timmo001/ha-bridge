---
title: ha-bridge template
description: Arguments and flags for every ha-bridge template command.
sidebar:
  label: template
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge template` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge template`

```text
DESCRIPTION
  Render templates and reload template entities

USAGE
  ha-bridge template <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge template render`

Alias: `ha-bridge template r`

```text
DESCRIPTION
  Render a template once and print the result

USAGE
  ha-bridge template render [flags] <template>

ARGUMENTS
  template string    Template, such as "{{ states('sun.sun') }}"

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Variables as a JSON object, such as '{"room":"office"}'
  --strict              Fail on undefined variables
  --timeout number      Seconds the first render may take
  --json                Print each result as JSON
  --bar-json            Print one bar JSON object per result, taking text, tooltip and class from an object result
```

## `ha-bridge template watch`

Alias: `ha-bridge template w`

```text
DESCRIPTION
  Print a template's result now and whenever it changes

USAGE
  ha-bridge template watch [flags] <template>

ARGUMENTS
  template string    Template, such as "{{ states('sun.sun') }}"

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --variables string    Variables as a JSON object, such as '{"room":"office"}'
  --strict              Fail on undefined variables
  --timeout number      Seconds the first render may take
  --json                Print each result as JSON
  --bar-json            Print one bar JSON object per result, taking text, tooltip and class from an object result
```

## `ha-bridge template reload`

```text
DESCRIPTION
  Reload the template YAML configuration

USAGE
  ha-bridge template reload [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
