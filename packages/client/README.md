# @timmo001/effect-ha-bridge

Effect client and protocol for [ha-bridge](https://github.com/timmo001/ha-bridge), which keeps one Home Assistant connection per machine and serves it to local apps over a Unix socket.

Use it to talk to a running `ha-bridge serve` from your own Effect app instead of spawning the `ha-bridge` CLI. It works under Bun and Node.

## Install

```bash
bun add @timmo001/effect-ha-bridge @timmo001/effect-ha effect
npm install @timmo001/effect-ha-bridge @timmo001/effect-ha effect
npx jsr add @timmo001/effect-ha-bridge @timmo001/effect-ha
```

`effect` is a peer dependency, so install the same Effect v4 version your app uses. Home Assistant types and action builders, such as `EntityState`, `Light` and `HomeAssistantError`, come from [`@timmo001/effect-ha`](https://github.com/timmo001/ha-bridge/tree/main/packages/effect-ha); add it when you use them directly.

## Usage

`BridgeClient.layer(path)` connects to the bridge socket. `resolveSocketPath` finds the same socket the CLI uses, so most apps can pass `Option.none()`:

1. The path you pass in, if any
2. `$HA_BRIDGE_SOCK`
3. `$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock`
4. `$TMPDIR/ha-bridge-$USER/ha-bridge.sock` (with `/tmp` and `default` as fallbacks)

`resolveSocketPath` needs the platform `Path` service, so provide `NodeServices.layer` from `@effect/platform-node` or `BunServices.layer` from `@effect/platform-bun`.

```ts
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { stateWithUnit } from "@timmo001/effect-ha";
import { BridgeClient, resolveSocketPath } from "@timmo001/effect-ha-bridge";
import { Console, Effect, Option } from "effect";

const program = Effect.gen(function* () {
  const client = yield* BridgeClient;
  const updates = yield* client.GetEntities({
    target: { entity_id: "sensor.office_temperature" },
  });

  for (const { name, state } of updates) {
    yield* Console.log(`${name}: ${stateWithUnit(state)}`);
  }
});

const main = Effect.gen(function* () {
  const socketPath = yield* resolveSocketPath(Option.none());

  yield* program.pipe(Effect.provide(BridgeClient.layer(socketPath)));
});

main.pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
```

### Targets

Reads, watches, actions and camera snapshots take a target with the same fields as an action's target in Home Assistant: `entity_id`, `device_id`, `area_id`, `floor_id` and `label_id`, each a string or a list. Every value can be an ID or a name; the bridge resolves names to IDs, then Home Assistant decides which entities the target contains. `domain` keeps only entities in that domain. A name that matches nothing or more than one item fails with `TargetError`.

### Read entities

`GetEntities` returns the state and display name of every entity the target matches.

```ts
const officeLights = Effect.gen(function* () {
  const client = yield* BridgeClient;

  return yield* client.GetEntities({
    target: { area_id: "Office" },
    domain: "light",
  });
});
```

### Watch entities

`WatchEntities` returns a `Stream` that emits the current state of every matching entity, then every change. After a reconnect or a registry change, the bridge expands the target again and emits entities it newly matches.

```ts
const watchDesk = Effect.gen(function* () {
  const client = yield* BridgeClient;

  yield* client
    .WatchEntities({ target: { label_id: "Evening lights" }, domain: "light" })
    .pipe(
      Stream.runForEach(({ state, name }) =>
        Console.log(`${name}: ${state.state}`),
      ),
    );
});
```

### Run an action

`CallAction` takes an action in the shape Home Assistant automations use: `action`, `data` and `target`. Typed builders from `@timmo001/effect-ha` cover common actions, such as `Light.toggle`, `InputNumber.setValue`, `Cover.setPosition` and `Climate.setFanMode`. Names in the target are resolved first. It fails with `HomeAssistantError` when Home Assistant rejects the action, and `TargetError` when a name doesn't resolve.

```ts
const dimDesk = Effect.gen(function* () {
  const client = yield* BridgeClient;

  yield* client.CallAction(Light.toggle({ area_id: "Office" }));

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

`getCalendarEvents` returns the events that overlap a time range on every calendar the target matches, keyed by calendar entity ID. All-day events have ISO dates for `start` and `end`; others have date-times. An event may include `status`, `confirmed` or `tentative`, when the calendar reports one.

```ts
const upcoming = getCalendarEvents(
  { entity_id: "calendar.personal" },
  {
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
);
```

### Config and camera snapshots

`GetConfig` returns Home Assistant's config, such as `time_zone`, `location_name` and `version`. `CameraSnapshot` returns the current image, as bytes with its content type, from the one camera its target matches.

```ts
const frontDoor = Effect.gen(function* () {
  const client = yield* BridgeClient;
  const { time_zone } = yield* client.GetConfig();
  const { contentType, data } = yield* client.CameraSnapshot({
    target: { entity_id: "camera.front_door" },
  });
});
```

## Errors

Calls fail with `RpcClientError` when the bridge isn't reachable rather than waiting for it to come back. Long-running watchers exit, so run them under a supervisor (such as systemd) that restarts them.

## Licence

Apache 2.0. See [LICENSE](https://github.com/timmo001/ha-bridge/blob/main/LICENSE).
