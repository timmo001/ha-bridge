---
title: Libraries
description: Use the bridge, or Home Assistant directly, from your own Effect app.
---

Home Assistant Bridge is built from two Effect v4 libraries, published to npm and JSR. Both work under Bun and Node.

| Package | Use it to |
| --- | --- |
| [`@timmo001/effect-ha-bridge`](https://github.com/timmo001/ha-bridge/tree/main/packages/client) | Talk to a running bridge over its socket, sharing its connection |
| [`@timmo001/effect-ha`](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha) | Connect to Home Assistant yourself, with typed actions and schemas |

Most local apps want the bridge client: they start instantly, share the bridge's cache and never hold a token.

## Bridge client

```bash
bun add @timmo001/effect-ha-bridge @timmo001/effect-ha effect
```

`BridgeClient` has one method per [RPC](/reference/protocol/#rpcs): `GetEntity`, `WatchEntity`, `CallAction`, `GetConfig` and `CameraSnapshot`. `resolveSocketPath` finds the socket the same way the CLI does, and `getCalendarEvents` reads calendar events through `CallAction`.

```ts
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Light } from "@timmo001/effect-ha";
import { BridgeClient, resolveSocketPath } from "@timmo001/effect-ha-bridge";
import { Effect, Option } from "effect";

const main = Effect.gen(function* () {
  const socketPath = yield* resolveSocketPath(Option.none());

  yield* Effect.gen(function* () {
    const client = yield* BridgeClient;
    yield* client.CallAction(Light.toggle("light.desk"));
  }).pipe(Effect.provide(BridgeClient.layer(socketPath)));
});

main.pipe(Effect.provide(BunServices.layer), BunRuntime.runMain);
```

See the [client README](https://github.com/timmo001/ha-bridge/tree/main/packages/client#readme) for watching, action responses, calendars and errors.

## Home Assistant library

```bash
bun add @timmo001/effect-ha effect
```

`connect` opens and authenticates a WebSocket session with `callAction`, `getConfig` and raw `request`. The library also has typed action builders for each domain on the [Actions](/actions/) pages (such as `Light`, `Cover`, `Climate` and `Lock`, plus `Calendar`) with schemas for their action data, the `EntityState` schema, frontend-style entity naming and `cameraSnapshot`.

See the [`effect-ha` README](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha#readme) for details.
