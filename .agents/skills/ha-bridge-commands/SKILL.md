---
name: ha-bridge-commands
description: Add or change ha-bridge CLI commands, bridge RPCs and watcher or bar JSON output. Use when editing src/index.ts, src/bridge/Server.ts, src/homeassistant/HomeAssistant.ts, src/cli/output.ts or packages/client/src/Rpcs.ts, or when exposing a new Home Assistant action, read or watch to local clients.
license: Apache-2.0
compatibility: Requires mise and Bun from the ha-bridge repository root.
---

# ha-bridge commands

## Pick the smallest path

Most new commands are another Home Assistant action and need no protocol change:

1. Add a builder to `packages/effect-ha/src/Action.ts`. Use `onEntity` for entity-targeted actions and `switchable` for on, off and toggle domains. Keep the Home Assistant action and field names (`cover.set_cover_position`, `tilt_position`).
2. Add the command in `src/index.ts` and send it with `callAction`, which goes through the existing `CallAction` RPC.

Add a new RPC only when the operation is not an action: a new read, a stream, or something served over REST such as `CameraSnapshot`. A new RPC touches, in order:

1. `packages/effect-ha`: the Home Assistant request, response schema and any REST helper.
2. `packages/client/src/Rpcs.ts`: the `Rpc.make` entry, with `error: HomeAssistantError` when Home Assistant can reject it. It is the published protocol, so renaming or reshaping an RPC breaks `@timmo001/effect-ha-bridge` users and other-language clients.
3. `src/homeassistant/HomeAssistant.ts`: a method on `HomeAssistantService`. Go through `connected` so it fails with "not connected" instead of hanging while the bridge reconnects. Reads and watches serve from the `states` cache and `changes` PubSub rather than asking Home Assistant per request.
4. `src/bridge/Server.ts`: the handler in `Handlers`. TypeScript fails until every RPC has one.
5. `src/index.ts`: the command.

## CLI conventions

- Reuse the helpers: `domainCommand` (domain name plus a short alias), `entityActionCommand`, `toggleCommands`, `stateWatchCommand`, `nameArgument`, `withBridge` and `failWith`. Entity commands take the name without the domain prefix.
- Wrap every client effect in `withBridge`, which resolves the socket and turns `RpcClientError` into a "could not reach the bridge" message.
- Fail with `CommandError` through `failWith`; `reportCliCause` prints `ha-bridge: <message>` and sets exit code 1. Validate arguments before sending, with pure parsers beside their domain (`src/homeassistant/inputNumber.ts`).
- Watcher output is a contract for bars and scripts. Build it in `src/cli/output.ts`, keep `--bar-json` one JSON object per line, and don't change existing fields or text without treating it as a breaking change.

## Verify

- Add `bun:test` tests beside the source (`*.test.ts`) for parsers and output formatting; leave command wiring to the checks.
- Run `mise run docs:gen` after any change to commands, aliases, arguments or flags, and update `docs/src/content/docs/reference/protocol.md` for a new or changed RPC.
- Run `mise run check`, `mise run test` and `mise run build`, then try the built binary against a running bridge: `./dist/ha-bridge --socket <path> ...`.
