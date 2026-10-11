---
title: ha-bridge logs
description: Arguments and flags for every ha-bridge logs command.
sidebar:
  label: logs
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge logs` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge logs`

Alias: `ha-bridge log`

```text
DESCRIPTION
  Read, watch and search Home Assistant's logs. Needs an admin token

USAGE
  ha-bridge logs <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs core`

Alias: `ha-bridge logs ha`

```text
DESCRIPTION
  Home Assistant Core's logs

USAGE
  ha-bridge logs core <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs core get`

```text
DESCRIPTION
  Print Core's latest log records, oldest first, from the Supervisor's journal, or Core's log file without one

USAGE
  ha-bridge logs core get [flags]

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                  Print as JSON
  --search string         Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer     How many of the latest records to show
  --boot, -b integer      A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose               Add the time, host and process to each line
  --latest                Only what was logged since Core last started
  --integration string    Only this integration's records, such as mqtt, including its libraries'
```

## `ha-bridge logs core watch`

Alias: `ha-bridge logs core w`

```text
DESCRIPTION
  Print the end of Core's log, then each record as it's logged. Needs Home Assistant 2026.11 or newer

USAGE
  ha-bridge logs core watch [flags]

FLAGS
  --socket string         Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                  Print as JSON
  --search string         Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer     How many of the latest records to show
  --integration string    Only this integration's records, such as mqtt, including its libraries'
```

## `ha-bridge logs core errors`

```text
DESCRIPTION
  Core's logged errors and warnings, as Settings > System > Logs lists them

USAGE
  ha-bridge logs core errors <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs core errors get`

```text
DESCRIPTION
  Print the errors and warnings Core keeps, newest first: time, level, logger and message

USAGE
  ha-bridge logs core errors get [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
  --search string    Only show what fuzzily matches this text, as ha-bridge search does
```

## `ha-bridge logs core errors watch`

Alias: `ha-bridge logs core errors w`

```text
DESCRIPTION
  Print each new error or warning, and each repeat of an earlier one

USAGE
  ha-bridge logs core errors watch [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
  --search string    Only show what fuzzily matches this text, as ha-bridge search does
```

## `ha-bridge logs supervisor`

Alias: `ha-bridge logs su`

```text
DESCRIPTION
  The Supervisor's log

USAGE
  ha-bridge logs supervisor <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs supervisor get`

```text
DESCRIPTION
  Print the Supervisor's latest log records, oldest first

USAGE
  ha-bridge logs supervisor get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs supervisor watch`

Alias: `ha-bridge logs supervisor w`

```text
DESCRIPTION
  Print the Supervisor's latest log records, then each new one

USAGE
  ha-bridge logs supervisor watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs host`

Alias: `ha-bridge logs ho`

```text
DESCRIPTION
  The host's journal

USAGE
  ha-bridge logs host <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs host get`

```text
DESCRIPTION
  Print the host's latest log records, oldest first

USAGE
  ha-bridge logs host get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs host watch`

Alias: `ha-bridge logs host w`

```text
DESCRIPTION
  Print the host's latest log records, then each new one

USAGE
  ha-bridge logs host watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs host boots`

```text
DESCRIPTION
  List the host's boots: the offset --boot takes, then the boot ID

USAGE
  ha-bridge logs host boots [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
```

## `ha-bridge logs apps`

Alias: `ha-bridge logs addons`

```text
DESCRIPTION
  Apps' logs

USAGE
  ha-bridge logs apps <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs apps list`

Alias: `ha-bridge logs apps ls`

```text
DESCRIPTION
  List the installed apps: slug, name and state

USAGE
  ha-bridge logs apps list [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Print as JSON
```

## `ha-bridge logs apps get`

```text
DESCRIPTION
  Print an app's latest log records, oldest first

USAGE
  ha-bridge logs apps get [flags] <slug>

ARGUMENTS
  slug string    The app's slug, such as core_mosquitto

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs apps watch`

Alias: `ha-bridge logs apps w`

```text
DESCRIPTION
  Print an app's latest log records, then each new one

USAGE
  ha-bridge logs apps watch [flags] <slug>

ARGUMENTS
  slug string    The app's slug, such as core_mosquitto

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs audio`

Alias: `ha-bridge logs snd`

```text
DESCRIPTION
  The audio plugin's log

USAGE
  ha-bridge logs audio <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs audio get`

```text
DESCRIPTION
  Print the audio plugin's latest log records, oldest first

USAGE
  ha-bridge logs audio get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs audio watch`

Alias: `ha-bridge logs audio w`

```text
DESCRIPTION
  Print the audio plugin's latest log records, then each new one

USAGE
  ha-bridge logs audio watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs cli`

```text
DESCRIPTION
  The CLI plugin's log

USAGE
  ha-bridge logs cli <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs cli get`

```text
DESCRIPTION
  Print the CLI plugin's latest log records, oldest first

USAGE
  ha-bridge logs cli get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs cli watch`

Alias: `ha-bridge logs cli w`

```text
DESCRIPTION
  Print the CLI plugin's latest log records, then each new one

USAGE
  ha-bridge logs cli watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs dns`

```text
DESCRIPTION
  The DNS plugin's log

USAGE
  ha-bridge logs dns <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs dns get`

```text
DESCRIPTION
  Print the DNS plugin's latest log records, oldest first

USAGE
  ha-bridge logs dns get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs dns watch`

Alias: `ha-bridge logs dns w`

```text
DESCRIPTION
  Print the DNS plugin's latest log records, then each new one

USAGE
  ha-bridge logs dns watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs multicast`

Alias: `ha-bridge logs mc`

```text
DESCRIPTION
  The multicast plugin's log

USAGE
  ha-bridge logs multicast <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs multicast get`

```text
DESCRIPTION
  Print the multicast plugin's latest log records, oldest first

USAGE
  ha-bridge logs multicast get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs multicast watch`

Alias: `ha-bridge logs multicast w`

```text
DESCRIPTION
  Print the multicast plugin's latest log records, then each new one

USAGE
  ha-bridge logs multicast watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs observer`

```text
DESCRIPTION
  The observer plugin's log

USAGE
  ha-bridge logs observer <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge logs observer get`

```text
DESCRIPTION
  Print the observer plugin's latest log records, oldest first

USAGE
  ha-bridge logs observer get [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --boot, -b integer     A boot by offset: 0 for this one, -1 for the one before (see logs host boots)
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs observer watch`

Alias: `ha-bridge logs observer w`

```text
DESCRIPTION
  Print the observer plugin's latest log records, then each new one

USAGE
  ha-bridge logs observer watch [flags]

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json                 Print as JSON
  --search string        Only show what fuzzily matches this text, as ha-bridge search does
  --lines, -n integer    How many of the latest records to show
  --verbose              Add the time, host and process to each line
```

## `ha-bridge logs search`

```text
DESCRIPTION
  Fuzzy search Core's errors and logs, best match first: source, then the record

USAGE
  ha-bridge logs search [flags] <query...>

ARGUMENTS
  query... string    Words to search for, such as mqtt timeout

FLAGS
  --socket string        Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --source string        Where to look: errors, core, supervisor, host, audio, cli, dns, multicast, observer or an app's slug; repeat for more (default: errors and core)
  --lines, -n integer    How many of each log's latest records to search (default: 1000)
  --limit integer        Most results to show
  --page integer         Show this page of --limit results, starting at 1
  --json                 Print the results as JSON
```
