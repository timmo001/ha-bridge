---
title: ha-bridge assist_satellite
description: Arguments and flags for every ha-bridge assist_satellite command.
sidebar:
  label: assist_satellite
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge assist_satellite` command and its help, as `--help` prints it. Each also accepts the [global flags](/commands#global-flags).

## `ha-bridge assist_satellite`

Alias: `ha-bridge as`

```text
DESCRIPTION
  Assist satellite actions

USAGE
  ha-bridge assist_satellite <subcommand> [flags]

FLAGS
  --socket string    Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
```

## `ha-bridge assist_satellite announce`

Alias: `ha-bridge assist_satellite a`

```text
DESCRIPTION
  Announce a message on satellites

USAGE
  ha-bridge assist_satellite announce [flags] <message> [<entity_id...>]

ARGUMENTS
  message string         Message to announce
  entity_id... string    Entity ID, with or without the assist_satellite. prefix; repeat for more (optional)

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --media-id string                Media ID to play instead of speaking the message
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
  --entity string                  Entity ID or name; repeat for more
  --device string                  Device ID or name; repeat for more
  --area string                    Area ID or name; repeat for more
  --floor string                   Floor ID or name; repeat for more
  --label string                   Label ID or name; repeat for more
```

## `ha-bridge assist_satellite start-conversation`

Alias: `ha-bridge assist_satellite c`

```text
DESCRIPTION
  Speak a message on satellites, then listen for a reply

USAGE
  ha-bridge assist_satellite start-conversation [flags] <message> [<entity_id...>]

ARGUMENTS
  message string         Message to start with
  entity_id... string    Entity ID, with or without the assist_satellite. prefix; repeat for more (optional)

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --media-id string                Media ID to play instead of speaking the message
  --extra-system-prompt string     Context for the conversation agent, such as why it was started
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
  --entity string                  Entity ID or name; repeat for more
  --device string                  Device ID or name; repeat for more
  --area string                    Area ID or name; repeat for more
  --floor string                   Floor ID or name; repeat for more
  --label string                   Label ID or name; repeat for more
```

## `ha-bridge assist_satellite ask-question`

Alias: `ha-bridge assist_satellite q`

```text
DESCRIPTION
  Ask a question on a satellite and print the reply as JSON

USAGE
  ha-bridge assist_satellite ask-question [flags] <question> [<entity_id...>]

ARGUMENTS
  question string        Question to ask
  entity_id... string    Entity ID, with or without the assist_satellite. prefix; repeat for more (optional)

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --answer string                  Possible answer as id=sentence,sentence; repeat for more answers
  --media-id string                Media ID to play instead of speaking the question
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
  --entity string                  Entity ID or name; repeat for more
  --device string                  Device ID or name; repeat for more
  --area string                    Area ID or name; repeat for more
  --floor string                   Floor ID or name; repeat for more
  --label string                   Label ID or name; repeat for more
```
