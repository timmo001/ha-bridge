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
  });

  const config = yield* session.getConfig;
  yield* Console.log(`Connected to Home Assistant ${config.version}`);

  yield* session.callAction(
    InputBoolean.toggle({ entity_id: "input_boolean.in_a_call" }),
  );
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
- `request(command)`: sends a raw WebSocket command, such as `get_states`, `fire_event`, `history/history_during_period`, `logbook/get_events` or `test_condition`. It succeeds with the reply's result as JSON.
- `subscribe(subscription)`: sends a subscription (`subscribe_events`, `render_template`, `logbook/event_stream`, `subscribe_trigger` or `subscribe_condition`) and succeeds once Home Assistant accepts it with a `Stream` of its events. Closing the scope unsubscribes.
- `extractTarget(target)`: asks Home Assistant which entities, devices and areas a target refers to, with `extract_from_target`. It takes IDs only.
- `closed`: fails once the connection is lost.

Decode `state_changed` events with `StateChangedEvent`, and other events with `HomeAssistantEvent`:

```ts
const events = yield* session.subscribe({
  type: "subscribe_events",
  event_type: "state_changed",
});

yield* events.pipe(
  Stream.mapEffect(Schema.decodeUnknownEffect(StateChangedEvent)),
  Stream.runForEach(({ data }) => Console.log(data.entity_id)),
);
```

Other replies and events have schemas and readers too: `TemplateUpdate` for `render_template`, `TriggerEvent` for `subscribe_trigger`, `ConditionResult` and `ConditionUpdate` for conditions, `historyFrom` for history (with ISO times), and `logbookFrom` and `logbookEventFrom` for the logbook.

## Actions

Builders take a `Target`, the same fields as an action's target in Home Assistant (`entity_id`, `device_id`, `area_id`, `floor_id` and `label_id`, each a string or a list of IDs). They return a plain `Action` (`{ action, data?, target?, return_response? }`), so you can also write one by hand:

```ts
import {
  Camera,
  Climate,
  Cover,
  InputNumber,
  Light,
} from "@timmo001/effect-ha";

Light.turnOn({ entity_id: "light.office" });
Light.turnOn(
  { area_id: "office" },
  { brightness_pct: 60, color_temp_kelvin: 3000 },
);
InputNumber.increment({ entity_id: "input_number.desk_height" });
Cover.setPosition({ floor_id: "upstairs" }, 40);
Climate.setFanMode({ label_id: "bedrooms" }, "high");
Camera.record({ entity_id: "camera.front_door" }, "/media/front_door.mp4", {
  duration: 20,
});

const restart = { action: "homeassistant.restart" };
```

Home Assistant applies a domain's action only to that domain's entities, so `Light.turnOn({ area_id: "office" })` leaves the office's switches alone. Actions that need one particular entity, such as `Script.run`, `AssistSatellite.askQuestion` and `cameraSnapshot`, take an entity ID typed by domain instead, and `isEntityIdIn(domain)` narrows a string to one.

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

`Calendar.getEvents` builds a `calendar.get_events` action and `Calendar.eventsFrom` reads its response, keyed by calendar entity ID. `Schedule.getSchedule` and `Schedule.schedulesFrom` work the same way for schedules, and `Recorder.getStatistics` and `Recorder.statisticsFrom` for long-term statistics, keyed by statistic ID:

```ts
const response = yield* session.callAction(
  Calendar.getEvents({ entity_id: "calendar.work" }, { start, end }),
);

const events = yield* Calendar.eventsFrom(response);
// events["calendar.work"]
```

Other actions with responses pair the same way: `Hassio.backupFull` with `Hassio.backupFrom` for the new backup's slug, and `ShellCommand.run` and `RestCommand.run` with `returnResponse: true` and their `responseFrom`:

```ts
const response = yield* session.callAction(
  ShellCommand.run("disk_usage", undefined, { returnResponse: true }),
);

const { stdout, returncode } = yield* ShellCommand.responseFrom(response);
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

`EntityState` is the schema for a state object. `friendlyName` and `stateWithUnit` format one for display. `entityNamerFrom` builds names the way Home Assistant dashboards do (parent device, device and entity name) from the entity and device registries, and `entityNameParts` returns those parts separately. `AreaRegistry`, `FloorRegistry` and `LabelRegistry` decode `config/area_registry/list`, `config/floor_registry/list` and `config/label_registry/list`.

Failures use `HomeAssistantError`.

## Licence

Apache 2.0. See [LICENSE](https://github.com/timmo001/ha-bridge/blob/main/LICENSE).
