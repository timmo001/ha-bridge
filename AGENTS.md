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
- Public names follow current Home Assistant terms (actions, not services). Never use `hass` in names; use `ha` or `HomeAssistant`.

## Background Dev Servers

- Start the docs dev server with `mise run serve:docs:dev`, which runs it through Pitchfork in the background and restarts it if it exits or stops responding. Do not run `mise run docs:dev` or `blume dev` in the foreground from an agent.
- Use `mise run serve:docs:status`, `mise run serve:docs:logs`, `mise run serve:docs:restart` and `mise run serve:docs:stop` to manage it.
- The daemon is configured in `pitchfork.toml` and serves `http://localhost:4321/`.

## Validation

Run these after source changes:

```bash
mise run check
mise run test
mise run build
```
