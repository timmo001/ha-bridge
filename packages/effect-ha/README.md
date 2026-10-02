# @timmo001/effect-ha

Effect schemas, typed actions and a WebSocket connection for Home Assistant.

It powers [ha-bridge](https://github.com/timmo001/ha-bridge), and works on its own in any Effect v4 app under Bun or Node. If you want to share one connection between local apps, use [`@timmo001/effect-ha-bridge`](https://github.com/timmo001/ha-bridge/tree/main/packages/client) with a running bridge instead.

## Install

```bash
bun add @timmo001/effect-ha effect
npm install @timmo001/effect-ha effect
npx jsr add @timmo001/effect-ha
```

`effect` is a peer dependency, so install the same Effect v4 version your app uses.

## Connect

`connect` opens a WebSocket, authenticates with a long-lived access token and returns a session. It needs a `Scope`, which closes the connection, and a `Socket.WebSocketConstructor`, such as `BunSocket.layerWebSocketConstructor` from `@effect/platform-bun`, or `Socket.layerWebSocketConstructorGlobal` from `effect/socket` on runtimes with a global `WebSocket`.

```ts
import { BunRuntime, BunSocket } from "@effect/platform-bun";
import { connect, InputBoolean } from "@timmo001/effect-ha";
import { Console, Effect, Redacted } from "effect";

const program = Effect.gen(function* () {
  const session = yield* connect({
    url: "http://homeassistant.local:8123",
    token: Redacted.make(process.env.HA_TOKEN ?? ""),
    onState: () => Effect.void,
  });

  const config = yield* session.getConfig;
  yield* Console.log(`Connected to Home Assistant ${config.version}`);

  yield* session.callAction(InputBoolean.toggle("input_boolean.in_a_call"));
});

program.pipe(
  Effect.scoped,
  Effect.provide(BunSocket.layerWebSocketConstructor),
  BunRuntime.runMain,
);
```

The session has:

- `callAction(action)`: runs an action. It succeeds with the action's response when `return_response` is set, otherwise `null`.
- `getConfig`: the instance's configuration, such as its time zone and version.
- `request(command)`: sends a raw WebSocket command, such as `get_states` or `subscribe_events`.
- `closed`: fails once the connection is lost.

`onState` receives each new entity state from `state_changed` events after you subscribe to them with `request`. The optional `onRemove` receives the ID of an entity removed from Home Assistant, and `onEvent` receives the type of every other subscribed event, such as `entity_registry_updated`.

## Actions

Builders return a plain `Action` (`{ action, data?, target?, return_response? }`), so you can also write one by hand:

```ts
import { Camera, Climate, Cover, InputNumber, Light } from "@timmo001/effect-ha";

Light.turnOn("light.office");
Light.turnOn("light.office", { brightness_pct: 60, color_temp_kelvin: 3000 });
InputNumber.increment("input_number.desk_height");
Cover.setPosition("cover.office_blind", 40);
Climate.setFanMode("climate.office", "high");
Camera.record("camera.front_door", "/media/front_door.mp4", { duration: 20 });

const restart = { action: "homeassistant.restart" };
```

Entity IDs are typed by domain, so `Light.turnOn("switch.fan")` is a type error.

Action data follows Home Assistant's own action schemas. Where Core checks more than types can say, such as ranges or fields that can't be set together, the package exports the schema too, so you can check data before sending it:

```ts
import { LightTurnOnData } from "@timmo001/effect-ha";
import { Schema } from "effect";

const data = yield* Schema.decodeUnknownEffect(LightTurnOnData)({
  brightness_pct: 60,
  rgb_color: [255, 100, 100],
});
```

## Calendar events

`Calendar.getEvents` builds a `calendar.get_events` action and `Calendar.eventsFrom` reads one calendar's events from its response:

```ts
const response = yield* session.callAction(
  Calendar.getEvents("calendar.work", { start, end }),
);

const events = yield* Calendar.eventsFrom("calendar.work", response);
```

## Assist satellite questions

`AssistSatellite.askQuestion` builds an `assist_satellite.ask_question` action and `AssistSatellite.answerFrom` reads the reply from its response:

```ts
const response = yield* session.callAction(
  AssistSatellite.askQuestion("assist_satellite.kitchen", {
    question: "What music would you like?",
    answers: [{ id: "genre", sentences: ["play {genre}", "{genre}"] }],
  }),
);

const answer = yield* AssistSatellite.answerFrom(response);
```

## Camera snapshots

Home Assistant only serves camera images over REST, so `cameraSnapshot` needs an `HttpClient` instead of the session:

```ts
import { cameraSnapshot } from "@timmo001/effect-ha";
import { FetchHttpClient } from "effect/http";

const snapshot = yield* cameraSnapshot(
  { url, token },
  "camera.front_door",
).pipe(Effect.provide(FetchHttpClient.layer));
```

## Entities

`EntityState` is the schema for a state object. `friendlyName` and `stateWithUnit` format one for display. `entityNamerFrom` builds names the way Home Assistant dashboards do (parent device, device and entity name) from the entity and device registries, and `entityNameParts` returns those parts separately. `AreaRegistry` and `FloorRegistry` decode `config/area_registry/list` and `config/floor_registry/list`.

Failures use `HomeAssistantError`.

## Licence

Apache 2.0. See [LICENSE](https://github.com/timmo001/ha-bridge/blob/main/LICENSE).
