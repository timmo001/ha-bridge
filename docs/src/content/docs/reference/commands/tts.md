---
title: ha-bridge tts
description: Arguments and flags for every ha-bridge tts command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge tts` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

## `ha-bridge tts`

```text
DESCRIPTION
  Text-to-speech actions

USAGE
  ha-bridge tts <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge tts speak`

```text
DESCRIPTION
  Speak a message on a media player

USAGE
  ha-bridge tts speak [flags] <name> <media_player> <message>

ARGUMENTS
  name string            Entity name without the tts. prefix
  media_player string    Media player name without media_player.
  message string         Message text

FLAGS
  --socket string      Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --language string    Language, such as en-GB
  --cache              Cache the audio (the default); --no-cache skips it
  --options string     Engine options, such as a voice, as a JSON object
```

## `ha-bridge tts clear-cache`

```text
DESCRIPTION
  Clear the speech cache

USAGE
  ha-bridge tts clear-cache [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```
