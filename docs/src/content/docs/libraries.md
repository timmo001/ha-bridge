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
| `GetEntities({ target, domain? })` | The state and display name of every entity the target matches. Fails with `TargetError` when a name doesn't resolve |
| `WatchEntities({ target, domain? })` | A `Stream` of updates for every matching entity, starting with their current states. It keeps going across Home Assistant reconnects and picks up entities the target newly matches |
| `CallAction(action)` | The action's response when `return_response` is set, otherwise `null`. Names in the target are resolved first. Fails with `HomeAssistantError` or `TargetError` |
| `GetConfig()` | Home Assistant's config, such as its name, version and units |
| `CameraSnapshot({ target })` | The image from the one camera the target matches, as `contentType` and `data` bytes |
| `RenderTemplate({ template, variables?, strict?, timeout? })` | The template's first render, as `result` and any `warnings`. Fails with `HomeAssistantError` on a render error |
| `WatchTemplate({ template, variables?, strict?, timeout? })` | A `Stream` of renders, each `{ result }` or `{ error, level }`, as what the template reads changes. It renders again after reconnects |

A target has the same fields as an action's target in Home Assistant: `entity_id`, `device_id`, `area_id`, `floor_id` and `label_id`. Each takes an ID or a name, and the bridge resolves names to IDs. `domain` keeps only entities in that domain. [The protocol](/using/protocol#rpcs) has the full rules.

Entity results are `EntityUpdate`s: the raw `EntityState` plus `name`, the display name the bridge resolved the same way the Home Assistant frontend does.

`getCalendarEvents(target, { start, end })` is a helper on top of `CallAction`. It calls `calendar.get_events` and returns the events keyed by calendar entity ID.

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

    yield* client.CallAction(Light.toggle({ area_id: "office" }));

    yield* client
      .WatchEntities({ target: { area_id: "office" }, domain: "light" }).pipe(
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

`connect({ url, token })` opens a WebSocket to Home Assistant's `/api/websocket`, using `wss` for `https` URLs, and logs in with a long-lived access token. It needs a `Scope`, which closes the connection, and a `Socket.WebSocketConstructor`, such as `BunSocket.layerWebSocketConstructor`.

It returns a session with:

- `callAction(action)`: runs an action and returns its response, or `null`.
- `getConfig`: reads Home Assistant's config.
- `request(command)`: sends a supported raw command, such as `get_states` or the entity and device registry lists. The session adds the message id and matches up the reply.
- `subscribe(subscription)`: sends a subscription, such as `subscribe_events`, and succeeds once Home Assistant accepts it with a `Stream` of its events. Events for each subscription are routed to its own stream by message id, and closing the scope unsubscribes.
- `extractTarget(target)`: asks Home Assistant which entities, devices and areas a target refers to, through `extract_from_target`.
- `closed`: fails once the connection drops. The library doesn't reconnect on its own; race your work against `closed` and retry with a `Schedule`, as the bridge does.

`connect` doesn't subscribe to anything by itself. Subscribe to `state_changed` and decode each event with `StateChangedEvent`; its `new_state` is `null` when an entity is removed. `HomeAssistantEvent` decodes any other event.

### Actions

Actions are plain data in the shape automations use: `action`, plus optional `data`, `target` and `return_response`. The `Action` schema checks them, so you can build one by hand for any action.

The domain builders do it for you with a target and typed options, such as `Light.turnOn({ entity_id: "light.desk" }, { brightness_pct: 50 })`, `Cover.setPosition(...)` or `MediaPlayer.playMedia(...)`. Where an action takes structured data, its schema is exported too (for example `LightTurnOnData` or `ClimateSetTemperatureData`). The [Actions](/actions) pages list every domain and builder.

Because builders only return data, the same action works with `session.callAction` here and `client.CallAction` on the bridge.

### Other helpers

- `EntityState`, with `friendlyName`, `stateWithUnit`, `stringAttribute` and `numberAttribute` for reading it.
- `entityNamerFrom` and `displayName`, which name entities from the entity and device registries like the frontend does.
- `Calendar.getEvents` and `Calendar.eventsFrom`, and `Schedule.getSchedule` and `Schedule.schedulesFrom`, which return results keyed by entity ID.
- `cameraSnapshot`, which fetches a camera image through Home Assistant's REST camera proxy.
- `HomeAssistantError`, the one error type for failed requests.

See the [`effect-ha` README](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha#readme) for a full connection example.
