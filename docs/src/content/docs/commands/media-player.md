---
title: ha-bridge media_player
description: Arguments and flags for every ha-bridge media_player command.
sidebar:
  label: media_player
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge media_player` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge media_player`

Alias: `ha-bridge mp`

```text
DESCRIPTION
  Media player actions

USAGE
  ha-bridge media_player <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player turn-on`

Alias: `ha-bridge media_player on`

```text
DESCRIPTION
  Turn on

USAGE
  ha-bridge media_player turn-on [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player turn-off`

Alias: `ha-bridge media_player off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge media_player turn-off [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player toggle`

Alias: `ha-bridge media_player t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge media_player toggle [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player play`

```text
DESCRIPTION
  Play

USAGE
  ha-bridge media_player play [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player pause`

```text
DESCRIPTION
  Pause

USAGE
  ha-bridge media_player pause [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player play-pause`

```text
DESCRIPTION
  Play or pause

USAGE
  ha-bridge media_player play-pause [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player stop`

```text
DESCRIPTION
  Stop

USAGE
  ha-bridge media_player stop [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player next`

```text
DESCRIPTION
  Next track

USAGE
  ha-bridge media_player next [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player previous`

```text
DESCRIPTION
  Previous track

USAGE
  ha-bridge media_player previous [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player volume-up`

```text
DESCRIPTION
  Turn the volume up

USAGE
  ha-bridge media_player volume-up [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player volume-down`

```text
DESCRIPTION
  Turn the volume down

USAGE
  ha-bridge media_player volume-down [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player clear-playlist`

```text
DESCRIPTION
  Clear the playlist

USAGE
  ha-bridge media_player clear-playlist [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player unjoin`

```text
DESCRIPTION
  Leave the player's group

USAGE
  ha-bridge media_player unjoin [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player volume`

```text
DESCRIPTION
  Set the volume

USAGE
  ha-bridge media_player volume [flags] <name> <volume>

ARGUMENTS
  name string      Entity name without the media_player. prefix
  volume string    Volume from 0 to 1

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player mute`

```text
DESCRIPTION
  Mute or unmute

USAGE
  ha-bridge media_player mute [flags] <name> <state>

ARGUMENTS
  name string     Entity name without the media_player. prefix
  state string    on or off

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player seek`

```text
DESCRIPTION
  Seek to a position

USAGE
  ha-bridge media_player seek [flags] <name> <position>

ARGUMENTS
  name string        Entity name without the media_player. prefix
  position string    Position in seconds

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player source`

```text
DESCRIPTION
  Select the input source

USAGE
  ha-bridge media_player source [flags] <name> <source>

ARGUMENTS
  name string      Entity name without the media_player. prefix
  source string    One of the player's source_list

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player sound-mode`

```text
DESCRIPTION
  Select the sound mode

USAGE
  ha-bridge media_player sound-mode [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the media_player. prefix
  mode string    One of the player's sound_mode_list

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player shuffle`

```text
DESCRIPTION
  Turn shuffle on or off

USAGE
  ha-bridge media_player shuffle [flags] <name> <state>

ARGUMENTS
  name string     Entity name without the media_player. prefix
  state string    on or off

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player repeat`

```text
DESCRIPTION
  Set the repeat mode

USAGE
  ha-bridge media_player repeat [flags] <name> <mode>

ARGUMENTS
  name string    Entity name without the media_player. prefix
  mode string    off, all or one

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player play-media`

```text
DESCRIPTION
  Play media

USAGE
  ha-bridge media_player play-media [flags] <name> <content_id>

ARGUMENTS
  name string          Entity name without the media_player. prefix
  content_id string    Media to play, such as a URL

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media type, such as music or url
  --enqueue choice         Queue behaviour (default: play) (choices: play, next, add, replace)
  --announce               Pause what's playing to announce the media
```

## `ha-bridge media_player join`

```text
DESCRIPTION
  Group players with this one

USAGE
  ha-bridge media_player join [flags] <name> <member...>

ARGUMENTS
  name string         Entity name without the media_player. prefix
  member... string    Player to group with this one, without media_player.; repeat for more

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge media_player browse`

```text
DESCRIPTION
  Print the player's media library as JSON

USAGE
  ha-bridge media_player browse [flags] <name>

ARGUMENTS
  name string    Entity name without the media_player. prefix

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media content type, from a browse response
  --content-id string      Media content ID, from a browse response
```

## `ha-bridge media_player search`

```text
DESCRIPTION
  Search the player's media, printing JSON

USAGE
  ha-bridge media_player search [flags] <name> <query>

ARGUMENTS
  name string     Entity name without the media_player. prefix
  query string    Text to search for

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media content type, from a browse response
  --content-id string      Media content ID, from a browse response
```
