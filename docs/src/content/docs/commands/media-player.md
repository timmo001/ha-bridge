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
  ha-bridge media_player turn-on [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player turn-off`

Alias: `ha-bridge media_player off`

```text
DESCRIPTION
  Turn off

USAGE
  ha-bridge media_player turn-off [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player toggle`

Alias: `ha-bridge media_player t`

```text
DESCRIPTION
  Toggle

USAGE
  ha-bridge media_player toggle [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player play`

```text
DESCRIPTION
  Play

USAGE
  ha-bridge media_player play [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player pause`

```text
DESCRIPTION
  Pause

USAGE
  ha-bridge media_player pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player play-pause`

```text
DESCRIPTION
  Play or pause

USAGE
  ha-bridge media_player play-pause [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player stop`

```text
DESCRIPTION
  Stop

USAGE
  ha-bridge media_player stop [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player next`

```text
DESCRIPTION
  Next track

USAGE
  ha-bridge media_player next [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player previous`

```text
DESCRIPTION
  Previous track

USAGE
  ha-bridge media_player previous [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player volume-up`

```text
DESCRIPTION
  Turn the volume up

USAGE
  ha-bridge media_player volume-up [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player volume-down`

```text
DESCRIPTION
  Turn the volume down

USAGE
  ha-bridge media_player volume-down [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player clear-playlist`

```text
DESCRIPTION
  Clear the playlist

USAGE
  ha-bridge media_player clear-playlist [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player unjoin`

```text
DESCRIPTION
  Leave the player's group

USAGE
  ha-bridge media_player unjoin [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player volume`

```text
DESCRIPTION
  Set the volume

USAGE
  ha-bridge media_player volume [flags] <volume> [<entity_id...>]

ARGUMENTS
  volume string          Volume from 0 to 1
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player mute`

```text
DESCRIPTION
  Mute or unmute

USAGE
  ha-bridge media_player mute [flags] <state> [<entity_id...>]

ARGUMENTS
  state string           on or off
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player seek`

```text
DESCRIPTION
  Seek to a position

USAGE
  ha-bridge media_player seek [flags] <position> [<entity_id...>]

ARGUMENTS
  position string        Position in seconds
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player source`

```text
DESCRIPTION
  Select the input source

USAGE
  ha-bridge media_player source [flags] <source> [<entity_id...>]

ARGUMENTS
  source string          One of the player's source_list
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player sound-mode`

```text
DESCRIPTION
  Select the sound mode

USAGE
  ha-bridge media_player sound-mode [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            One of the player's sound_mode_list
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player shuffle`

```text
DESCRIPTION
  Turn shuffle on or off

USAGE
  ha-bridge media_player shuffle [flags] <state> [<entity_id...>]

ARGUMENTS
  state string           on or off
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player repeat`

```text
DESCRIPTION
  Set the repeat mode

USAGE
  ha-bridge media_player repeat [flags] <mode> [<entity_id...>]

ARGUMENTS
  mode string            off, all or one
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player play-media`

```text
DESCRIPTION
  Play media

USAGE
  ha-bridge media_player play-media [flags] <content_id> [<entity_id...>]

ARGUMENTS
  content_id string      Media to play, such as a URL
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media type, such as music or url
  --enqueue choice         Queue behaviour (default: play) (choices: play, next, add, replace)
  --announce               Pause what's playing to announce the media
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```

## `ha-bridge media_player join`

```text
DESCRIPTION
  Group other players with these

USAGE
  ha-bridge media_player join [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --member string    Player to group with these, as an entity ID, object ID or name; repeat for more
  --entity string    Entity ID or name; repeat for more
  --device string    Device ID or name; repeat for more
  --area string      Area ID or name; repeat for more
  --floor string     Floor ID or name; repeat for more
  --label string     Label ID or name; repeat for more
```

## `ha-bridge media_player browse`

```text
DESCRIPTION
  Print the player's media library as JSON

USAGE
  ha-bridge media_player browse [flags] [<entity_id...>]

ARGUMENTS
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media content type, from a browse response
  --content-id string      Media content ID, from a browse response
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```

## `ha-bridge media_player search`

```text
DESCRIPTION
  Search the player's media, printing JSON

USAGE
  ha-bridge media_player search [flags] <query> [<entity_id...>]

ARGUMENTS
  query string           Text to search for
  entity_id... string    Entity ID, with or without the media_player. prefix; repeat for more (optional)

FLAGS
  --socket string          Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --content-type string    Media content type, from a browse response
  --content-id string      Media content ID, from a browse response
  --entity string          Entity ID or name; repeat for more
  --device string          Device ID or name; repeat for more
  --area string            Area ID or name; repeat for more
  --floor string           Floor ID or name; repeat for more
  --label string           Label ID or name; repeat for more
```
