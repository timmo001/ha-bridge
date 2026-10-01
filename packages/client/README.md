# @timmo001/effect-ha-bridge

Effect client and protocol for [ha-bridge](https://github.com/timmo001/ha-bridge), which keeps one Home Assistant connection per machine and serves it to local apps over a Unix socket.

Use it to talk to a running `ha-bridge serve` from your own Effect app instead of spawning the `ha-bridge` CLI. It works under Bun and Node.

## Install

```bash
bun add @timmo001/effect-ha-bridge effect
npm install @timmo001/effect-ha-bridge effect
npx jsr add @timmo001/effect-ha-bridge
```

`effect` is a peer dependency, so install the same Effect v4 version your app uses.

## Usage

`BridgeClient.layer(path)` connects to the bridge socket. `resolveSocketPath` finds the same socket the CLI uses, so most apps can pass `Option.none()`:

1. The path you pass in, if any
2. `$HA_BRIDGE_SOCK`
3. `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`
4. `$TMPDIR/ha-bridge-$USER/ha-bridge.sock` (with `/tmp` and `default` as fallbacks)

`resolveSocketPath` needs the platform `Path` service, so provide `NodeServices.layer` from `@effect/platform-node` or `BunServices.layer` from `@effect/platform-bun`.

```ts
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  BridgeClient,
  resolveSocketPath,
  stateWithUnit,
} from "@timmo001/effect-ha-bridge";
import { Console, Effect, Option } from "effect";

const program = Effect.gen(function* () {
  const client = yield* BridgeClient;
  const update = yield* client.GetEntity({
    entityId: "sensor.office_temperature",
  });

  if (update === null) {
    return yield* Console.log("Entity not found");
  }

  yield* Console.log(`${update.name}: ${stateWithUnit(update.state)}`);
});

const main = Effect.gen(function* () {
  const socketPath = yield* resolveSocketPath(Option.none());

  yield* program.pipe(Effect.provide(BridgeClient.layer(socketPath)));
});

main.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
```

### Read an entity

`GetEntity` returns the entity's state and display name, or `null` when the bridge has no state for it.

```ts
const desk = Effect.gen(function* () {
  const client = yield* BridgeClient;

  return yield* client.GetEntity({ entityId: "light.desk" });
});
```

### Watch an entity

`WatchEntity` returns a `Stream` that emits the current state (when the bridge has one), then every change.

```ts
const watchDesk = Effect.gen(function* () {
  const client = yield* BridgeClient;

  yield* client
    .WatchEntity({ entityId: "light.desk" })
    .pipe(
      Stream.runForEach(({ state, name }) =>
        Console.log(`${name}: ${state.state}`),
      ),
    );
});
```

### Run an action

`CallAction` takes an action in the shape Home Assistant automations use: `action`, `data` and `target`. Typed builders cover common actions, such as `Light.toggle`, `InputNumber.setValue`, `Cover.setPosition` and `Climate.setFanMode`. It fails with `HomeAssistantError` when Home Assistant rejects the action.

```ts
const dimDesk = Effect.gen(function* () {
  const client = yield* BridgeClient;

  yield* client.CallAction(Light.toggle("light.desk"));

  yield* client
    .CallAction({
      action: "light.turn_on",
      data: { brightness_pct: 50 },
      target: { entity_id: "light.desk" },
    })
    .pipe(
      Effect.catchTag("HomeAssistantError", (error) =>
        Console.error(`Action failed: ${error.message}`),
      ),
    );
});
```

Set `return_response: true` for actions that return data. `CallAction` then succeeds with the response; otherwise it succeeds with `null`.

### Calendar events

`getCalendarEvents` returns the events on a calendar that overlap a time range. All-day events have ISO dates for `start` and `end`; others have date-times.

```ts
const upcoming = getCalendarEvents("calendar.personal", {
  start: new Date(),
  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
```

### Config and camera snapshots

`GetConfig` returns Home Assistant's config, such as `time_zone`, `location_name` and `version`. `CameraSnapshot` returns a camera's current image as bytes, with its content type.

```ts
const frontDoor = Effect.gen(function* () {
  const client = yield* BridgeClient;
  const { time_zone } = yield* client.GetConfig();
  const { contentType, data } = yield* client.CameraSnapshot({
    entityId: "camera.front_door",
  });
});
```

## Errors

Calls fail with `RpcClientError` when the bridge isn't reachable rather than waiting for it to come back. Long-running watchers exit, so run them under a supervisor (such as systemd) that restarts them.

## Licence

Apache 2.0. See [LICENSE](./LICENSE).
