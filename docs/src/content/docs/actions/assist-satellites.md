---
title: Assist satellites
description: Announce messages, start conversations and ask questions on Assist satellites.
---

`assist_satellite` (`as`) speaks through Assist satellites, such as voice assistants.

## Announce

`announce` (`as a`) announces a message on every satellite in an area. Pass the **area ID**, then the message in quotes:

```bash
ha-bridge assist_satellite announce living_room "Dinner is ready"
```

## Start a conversation

`start-conversation` (`as c`) speaks a message on an area's satellites, then listens for a reply. `--extra-system-prompt` tells the conversation agent why it started:

```bash
ha-bridge assist_satellite start-conversation living_room "The garage is open. Shall I close it?" \
  --extra-system-prompt "The garage door has been open for an hour"
```

## Ask a question

`ask-question` (`as q`) asks a question on one satellite, waits for the reply and prints it as JSON. Pass the satellite's entity name, not an area.

Each `--answer` is an ID and the sentences that match it, separated by commas. Sentences use [Assist's sentence syntax](https://developers.home-assistant.io/docs/voice/intent-recognition/template-sentence-syntax/) without punctuation:

```bash
ha-bridge assist_satellite ask-question kitchen "What music would you like?" \
  --answer "genre=play {genre},{genre}" --answer "none=nothing,no music"
```

```json
{"id":"genre","sentence":"play jazz","slots":{"genre":"jazz"}}
```

`id` is `null` when the reply matched no answer.

## Media and pre-announcements

All three commands take:

| Flag | Use |
| --- | --- |
| `--media-id` | Play media instead of speaking the message |
| `--no-preannounce` | Skip the sound before the message |
| `--preannounce-media-id` | Play different media before the message |

## Actions

| Command | Home Assistant action | Target |
| --- | --- | --- |
| `assist_satellite announce` | `assist_satellite.announce` | `area_id` |
| `assist_satellite start-conversation` | `assist_satellite.start_conversation` | `area_id` |
| `assist_satellite ask-question` | `assist_satellite.ask_question` | `assist_satellite.<name>` |
