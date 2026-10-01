---
title: Libraries
description: Use the bridge, or Home Assistant directly, from your own Effect app.
---

Home Assistant Bridge is built from two Effect v4 libraries, published to npm and JSR. Both work under Bun and Node.

| Package | Use it to |
| --- | --- |
| [`@timmo001/effect-ha-bridge`](https://github.com/timmo001/ha-bridge/tree/main/packages/client) | Talk to a running bridge over its socket, sharing its connection |
| [`@timmo001/effect-ha`](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha) | Connect to Home Assistant yourself, with typed actions and schemas |

The bridge itself is built on `effect-ha`: it holds the one Home Assistant connection, and serves it through the RPCs that `effect-ha-bridge` defines. The CLI is a client of those same RPCs, so anything the CLI does, your app can do too.

Most local apps want the bridge client: they start instantly, share the bridge's cache and never hold a token. Use `effect-ha` directly when there is no bridge, such as on a server or in a one-off script.

## Bridge client

```bash
bun add @timmo001/effect-ha-bridge @timmo001/effect-ha effect
```

`effect` is a peer dependency, so install the Effect v4 version your app already uses.

### How it connects

`BridgeClient` is an Effect service built on `effect/rpc`. `BridgeClient.layer(socketPath)` opens the Unix socket and speaks newline-delimited JSON, the same [protocol](/using/protocol) the CLI uses. The connection lives as long as the layer, so provide it once around the work that needs it.

`resolveSocketPath` finds the socket the same way the CLI does:

1. The path you pass in, if any.
2. `HA_BRIDGE_SOCK`, if set.
3. `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`.
4. `$TMPDIR/ha-bridge-$USER/ha-bridge.sock`, with `/tmp` and `default` as fallbacks.

Calls fail straight away when the bridge isn't running, rather than waiting for it. Long-running watchers are meant to exit and let their supervisor, such as systemd or Quickshell, start them again.

### Methods

`BridgeClient` has one method per [RPC](/using/protocol#rpcs):

| Method | Returns |
| --- | --- |
| `GetEntity({ entityId })` | The entity's state and display name from the bridge's cache, or `null` if it doesn't exist |
| `WatchEntity({ entityId })` | A `Stream` of updates, starting with the current state if the bridge has it. It keeps going across Home Assistant reconnects |
| `CallAction(action)` | The action's response when `return_response` is set, otherwise `null`. Fails with `HomeAssistantError` |
| `GetConfig()` | Home Assistant's config, such as its name, version and units |
| `CameraSnapshot({ entityId })` | The camera's current image, as `contentType` and `data` bytes |

Entity results are `EntityUpdate`s: the raw `EntityState` plus `name`, the display name the bridge resolved the same way the Home Assistant frontend does.

`getCalendarEvents(entityId, { start, end })` is a helper on top of `CallAction`. It calls `calendar.get_events` and decodes the events.

### Example

```ts
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Light } from "@timmo001/effect-ha";
import { BridgeClient, resolveSocketPath } from "@timmo001/effect-ha-bridge";
import { Effect, Option, Stream } from "effect";

const main = Effect.gen(function* () {
  const socketPath = yield* resolveSocketPath(Option.none());

  yield* Effect.gen(function* () {
    const client = yield* BridgeClient;

    yield* client.CallAction(Light.toggle("light.desk"));

    yield* client.WatchEntity({ entityId: "light.desk" }).pipe(
      Stream.runForEach(({ name, state }) =>
        Effect.log(`${name}: ${state.state}`),
      ),
    );
  }).pipe(Effect.provide(BridgeClient.layer(socketPath)));
});

main.pipe(Effect.provide(BunServices.layer), BunRuntime.runMain);
```

See the [client README](https://github.com/timmo001/ha-bridge/tree/main/packages/client#readme) for action responses, calendars and error handling.

## Home Assistant library

```bash
bun add @timmo001/effect-ha effect
```

### Connecting

`connect({ url, token, onState })` opens a WebSocket to Home Assistant's `/api/websocket`, using `wss` for `https` URLs, and logs in with a long-lived access token. It needs a `Scope`, which closes the connection, and a `Socket.WebSocketConstructor`, such as `BunSocket.layerWebSocketConstructor`.

It returns a session with:

- `callAction(action)`: runs an action and returns its response, or `null`.
- `getConfig`: reads Home Assistant's config.
- `request(command)`: sends a supported raw command, such as `get_states`, `subscribe_events` or the entity and device registry lists. The session adds the message id and matches up the reply.
- `closed`: fails once the connection drops. The library doesn't reconnect on its own; race your work against `closed` and retry with a `Schedule`, as the bridge does.

`connect` doesn't subscribe to anything by itself. Send `subscribe_events` for `state_changed` and each new state is passed to `onState`.

### Actions

Actions are plain data in the shape automations use: `action`, plus optional `data`, `target` and `return_response`. The `Action` schema checks them, so you can build one by hand for any action.

The domain builders do it for you with typed entity IDs and options, such as `Light.turnOn("light.desk", { brightness_pct: 50 })`, `Cover.setPosition(...)` or `MediaPlayer.playMedia(...)`. Where an action takes structured data, its schema is exported too (for example `LightTurnOnData` or `ClimateSetTemperatureData`). The [Actions](/actions) pages list every domain and builder.

Because builders only return data, the same action works with `session.callAction` here and `client.CallAction` on the bridge.

### Other helpers

- `EntityState`, with `friendlyName`, `stateWithUnit`, `stringAttribute` and `numberAttribute` for reading it.
- `entityNamerFrom` and `displayName`, which name entities from the entity and device registries like the frontend does.
- `Calendar.getEvents` and `Calendar.eventsFrom` for calendar events.
- `cameraSnapshot`, which fetches a camera image through Home Assistant's REST camera proxy.
- `HomeAssistantError`, the one error type for failed requests.

See the [`effect-ha` README](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha#readme) for a full connection example.
