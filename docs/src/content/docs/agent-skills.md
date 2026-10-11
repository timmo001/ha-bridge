---
title: Agent skills
description: Teach coding agents to use ha-bridge, and to read these docs, with Agent Skills.
---

[Agent Skills](https://agentskills.io) give coding agents, such as Claude Code, OpenCode and Codex, instructions they load when a task needs them. ha-bridge has two for using it.

## ha-bridge-cli

`ha-bridge-cli` teaches an agent to use the CLI: finding the right command and flags, calling actions, reading and watching state, feeding bars and scripts, and reading, watching and searching [logs](/using/logs) to diagnose a problem or confirm a fix. It also sets rules, such as asking before actions with real-world effects and redacting logs before they leave the machine.

Install it with the [Skills CLI](https://skills.sh):

```bash
npx skills add timmo001/ha-bridge --skill ha-bridge-cli
```

Or in Claude Code:

```text
/plugin install ha-bridge --marketplace timmo001/ha-bridge
```

The skill needs the `ha-bridge` CLI and a [running bridge](/running). It points agents at these docs, through the docs MCP server when it's connected.

## The docs skill

This site serves a skill that points agents at these docs rather than what they remember, at [/.well-known/agent-skills/home-assistant-bridge/SKILL.md](https://ha-bridge.timmo.dev/.well-known/agent-skills/home-assistant-bridge/SKILL.md). It lists every page and the ways to read them: any page as Markdown by adding `.md` to its URL, [llms.txt](https://ha-bridge.timmo.dev/llms.txt), and the MCP server at `https://ha-bridge.timmo.dev/mcp`, with `search_docs` and `get_page`.

## Working on ha-bridge

The repository has its own skills for changing ha-bridge, in `.agents/skills`: adding commands and RPCs, the docs, the `@timmo001/effect-ha` library, releases and reviews. Agents working in a checkout pick them up from there.
