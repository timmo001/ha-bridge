---
title: Conversation and AI tasks
description: Send text to conversation agents and generate data or images with AI tasks.
---

## Conversation

`conversation process` sends text to a conversation agent, as if you'd typed it into Assist, and prints the reply as JSON:

```bash
ha-bridge conversation process "turn on the desk light"
ha-bridge conversation process "what's on today?" --agent-id conversation.openai
```

`--conversation-id` continues a conversation, using the ID from a previous reply. `conversation reload` reloads the agent's intents.

## AI tasks

`ai_task generate-data` asks an AI task entity to generate data and prints it as JSON. `--structure` asks for structured output, as a JSON object of selectors:

```bash
ha-bridge ai_task generate-data dinner "Suggest a dinner using chicken"
ha-bridge ai_task generate-data names "Suggest a name for a cat" --structure '{"name":{"selector":{"text":null}}}'
ha-bridge ai_task generate-image poster "A cosy living room at dusk" openai_image
```

`generate-data` uses the preferred AI task entity unless you pass `--entity`.

| Command | Home Assistant action |
| --- | --- |
| `conversation process` | `conversation.process` |
| `conversation reload` | `conversation.reload` |
| `ai_task generate-data` | `ai_task.generate_data` |
| `ai_task generate-image` | `ai_task.generate_image` |

See [`ha-bridge conversation`](/commands/conversation) and [`ha-bridge ai_task`](/commands/ai-task) for every argument and flag.
