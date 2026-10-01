---
title: ha-bridge assist_satellite
description: Arguments and flags for every ha-bridge assist_satellite command.
---

<!-- Generated from src/index.ts by `mise run docs:gen`. Do not edit by hand. -->

Every `ha-bridge assist_satellite` command and its help, as `--help` prints it. Each also accepts the [global flags](/reference/commands/#global-flags).

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
  Announce a message on an area's satellites

USAGE
  ha-bridge assist_satellite announce [flags] <area_id> <message>

ARGUMENTS
  area_id string    Area to announce in
  message string    Message to announce

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --media-id string                Media ID to play instead of speaking the message
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
```

## `ha-bridge assist_satellite start-conversation`

Alias: `ha-bridge assist_satellite c`

```text
DESCRIPTION
  Speak a message on an area's satellites, then listen for a reply

USAGE
  ha-bridge assist_satellite start-conversation [flags] <area_id> <message>

ARGUMENTS
  area_id string    Area to start the conversation in
  message string    Message to start with

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --media-id string                Media ID to play instead of speaking the message
  --extra-system-prompt string     Context for the conversation agent, such as why it was started
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
```

## `ha-bridge assist_satellite ask-question`

Alias: `ha-bridge assist_satellite q`

```text
DESCRIPTION
  Ask a question on a satellite and print the reply as JSON

USAGE
  ha-bridge assist_satellite ask-question [flags] <name> <question>

ARGUMENTS
  name string        Entity name without the assist_satellite. prefix
  question string    Question to ask

FLAGS
  --socket string                  Path to the bridge socket (default: $HA_BRIDGE_SOCK, then $XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock)
  --answer string                  Possible answer as id=sentence,sentence; repeat for more answers
  --media-id string                Media ID to play instead of speaking the question
  --preannounce                    Play the pre-announcement sound first (the default); --no-preannounce skips it
  --preannounce-media-id string    Media ID to play as the pre-announcement
```
