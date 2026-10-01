# ha-bridge agents

`ha-bridge` keeps one Home Assistant WebSocket connection per machine and serves every operation (actions, reads and watches) to local clients over a single Unix socket. It replaces Go Automate.

## Stack

- Runtime, package manager and compiler: Bun.
- Language: TypeScript with Effect v4. Read `node_modules/effect/ai-docs` and the Effect source before writing Effect code.
- Prefer Effect platform services (`FileSystem`, `Path`, `ChildProcessSpawner`, `Socket`, `SocketServer`, `effect/cli`) from `@effect/platform-bun` over hand-written Node or Bun wrappers.
- Task runner: mise.

## Rules

- Keep source under `src/`. Keep the CLI tree in `src/index.ts` so help and completions come from one place.
- Every operation goes through the bridge socket. CLI commands are thin socket clients; they never open their own Home Assistant connection.
- Pin dependencies to exact versions (`bun add -E`).
- Run project tasks through mise. Scripts complex enough to need logic are written in Effect and exposed as mise tasks.
- Install only published packages; never install a local build over the installed one.
- Base protocol and client changes on how Home Assistant works: read `core` (server) and `frontend` (client) together, as the workspace `AGENTS.md` describes. Public names follow current Home Assistant terms (actions, not services), even where the wire protocol still uses older names such as `call_service`. Never use `hass` in names; use `ha` or `HomeAssistant`, even where Core or the frontend still do. Wire field names stay as Home Assistant expects.
- `packages/effect-ha` owns its own Effect WebSocket connection; do not depend on `home-assistant-js-websocket`. Use that library (`home-assistant/home-assistant-js-websocket`, which the frontend uses) as the reference when a protocol feature becomes needed, such as `subscribe_entities` diffs, `coalesce_messages`, ping keepalive, or resubscribing after a reconnect. Add features only when something uses them.

## Validation

Run these after source changes:

```bash
mise run check
mise run test
mise run build
```
