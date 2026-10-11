---
title: Agent skills
description: Teach coding agents to use ha-bridge, and to read these docs, with Agent Skills.
---

[Agent Skills](https://agentskills.io) give coding agents, such as Claude Code, OpenCode and Codex, instructions they load when a task needs them. ha-bridge has three for using it.

Install the two for working with Home Assistant with the [Skills CLI](https://skills.sh):

```bash
npx skills add timmo001/ha-bridge --skill ha-bridge-cli --skill home-assistant
```

Or in Claude Code, which installs both:

```text
/plugin install ha-bridge --marketplace timmo001/ha-bridge
```

## ha-bridge-cli

`ha-bridge-cli` teaches an agent to use the CLI: finding the right command and flags, calling actions, reading and watching state, feeding bars and scripts, reading and changing [automation](/actions/automations#reading-and-changing-configs) and [script](/actions/scripts#reading-and-changing-configs) configs, and reading, watching and searching [logs](/using/logs) to diagnose a problem or confirm a fix. It also sets rules, such as asking before actions with real-world effects and redacting logs before they leave the machine.

The skill needs the `ha-bridge` CLI and a [running bridge](/running). It points agents at these docs, through the docs MCP server when it's connected.

## home-assistant

`home-assistant` teaches an agent where to look up how Home Assistant behaves, in its docs at home-assistant.io and developers.home-assistant.io and in Core's source, and to write automations and scripts the current way, preferring purpose-specific triggers and conditions such as `light.turned_on` and `light.is_on`. It also covers explaining why an automation ran when it did, such as reading sun event times from the `sensor.sun_next_*` history rather than `sun.sun`.

It's the reference half of the pair: `ha-bridge-cli` does the reading, testing and saving. It needs search or fetch tools for the docs.

## The docs skill

This site serves a skill that points agents at these docs rather than what they remember, at [/.well-known/agent-skills/home-assistant-bridge/SKILL.md](https://ha-bridge.timmo.dev/.well-known/agent-skills/home-assistant-bridge/SKILL.md). It lists every page and the ways to read them: any page as Markdown by adding `.md` to its URL, [llms.txt](https://ha-bridge.timmo.dev/llms.txt), and the MCP server at `https://ha-bridge.timmo.dev/mcp`, with `search_docs` and `get_page`.

## Working on ha-bridge

The repository has its own skills for changing ha-bridge, in `.agents/skills`: adding commands and RPCs, the docs, the `@timmo001/effect-ha` library, releases and reviews. Agents working in a checkout pick them up from there.
