---
title: ha-bridge hassio
description: Arguments and flags for every ha-bridge hassio command.
sidebar:
  label: hassio
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge hassio` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge hassio`

```text
DESCRIPTION
  Supervisor actions

USAGE
  ha-bridge hassio <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio app-start`

```text
DESCRIPTION
  Start an app

USAGE
  ha-bridge hassio app-start [flags] <app>

ARGUMENTS
  app string    App slug, such as core_ssh

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio app-stop`

```text
DESCRIPTION
  Stop an app

USAGE
  ha-bridge hassio app-stop [flags] <app>

ARGUMENTS
  app string    App slug, such as core_ssh

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio app-restart`

```text
DESCRIPTION
  Restart an app

USAGE
  ha-bridge hassio app-restart [flags] <app>

ARGUMENTS
  app string    App slug, such as core_ssh

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio app-stdin`

```text
DESCRIPTION
  Write to an app's stdin

USAGE
  ha-bridge hassio app-stdin [flags] <app> <input>

ARGUMENTS
  app string      App slug, such as core_ssh
  input string    Text to write

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --json             Send the input as a JSON object
```

## `ha-bridge hassio host-reboot`

```text
DESCRIPTION
  Reboot the host

USAGE
  ha-bridge hassio host-reboot [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio host-shutdown`

```text
DESCRIPTION
  Shut down the host

USAGE
  ha-bridge hassio host-shutdown [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge hassio backup-full`

```text
DESCRIPTION
  Back up everything and print the slug

USAGE
  ha-bridge hassio backup-full [flags]

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --name string         Backup name (default: the date and time)
  --password string     Password to protect it with
  --compressed          Compress the backup (the default); --no-compressed doesn't
  --location string     Backup mount to save to (default: local storage)
  --exclude-database    Leave out the Home Assistant database
```

## `ha-bridge hassio backup-partial`

```text
DESCRIPTION
  Back up some parts and print the slug

USAGE
  ha-bridge hassio backup-partial [flags]

FLAGS
  --socket string       Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --name string         Backup name (default: the date and time)
  --password string     Password to protect it with
  --compressed          Compress the backup (the default); --no-compressed doesn't
  --location string     Backup mount to save to (default: local storage)
  --exclude-database    Leave out the Home Assistant database
  --homeassistant       Include Home Assistant's configuration
  --folder choice       Folder to include; repeat for more (choices: share, addons/local, ssl, media)
  --app string          App slug to include; repeat for more
```

## `ha-bridge hassio restore-full`

```text
DESCRIPTION
  Restore everything from a backup

USAGE
  ha-bridge hassio restore-full [flags] <slug>

ARGUMENTS
  slug string    Backup slug

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --password string    Backup password
```

## `ha-bridge hassio restore-partial`

```text
DESCRIPTION
  Restore some parts from a backup

USAGE
  ha-bridge hassio restore-partial [flags] <slug>

ARGUMENTS
  slug string    Backup slug

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --password string    Backup password
  --homeassistant      Include Home Assistant's configuration
  --folder choice      Folder to include; repeat for more (choices: share, addons/local, ssl, media)
  --app string         App slug to include; repeat for more
```

## `ha-bridge hassio mount-reload`

```text
DESCRIPTION
  Reload a network storage mount

USAGE
  ha-bridge hassio mount-reload [flags] <device>

ARGUMENTS
  device string    Mount device ID or name

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
