import { describe, expect, test } from "bun:test";
import {
  Effect,
  Layer,
  Match,
  Option,
  Queue,
  Redacted,
  Schema,
  Stream,
} from "effect";
import { FetchHttpClient } from "effect/http";
import { Socket } from "effect/socket";
import { BridgeConfig } from "../config/Config.js";
import { HomeAssistant } from "./HomeAssistant.js";

// Past the sliding state pubsub's 4096 slots, so a full snapshot cannot be
// delivered to a watcher that is already subscribed.
const snapshotSize = 5000;

const kitchenIndex = 4500;

const fillerSnapshot = (kitchenState: string) =>
  Array.from({ length: snapshotSize }, (_, index) => ({
    entity_id:
      index === kitchenIndex ? "light.kitchen" : `sensor.filler_${index}`,
    state: index === kitchenIndex ? kitchenState : "0",
  }));

const Command = Schema.Struct({
  id: Schema.optionalKey(Schema.Finite),
  type: Schema.String,
});

const decodeCommand = Schema.decodeUnknownSync(Schema.fromJsonString(Command));

type Command = typeof Command.Type;

const configResult = {
  location_name: "Home",
  time_zone: "UTC",
  language: "en",
  country: null,
  currency: "USD",
  version: "2026.10.0",
  unit_system: { temperature: "°C" },
};

type HomeAssistantFrame = {
  readonly id?: number;
  readonly type: string;
  readonly success?: boolean;
  readonly result?: Schema.Json;
};

const resultFrame = (
  message: Command,
  result: Schema.Json,
): HomeAssistantFrame => ({
  id: message.id,
  type: "result",
  success: true,
  result,
});

class FakeWebSocket implements Socket.WebSocketLike {
  readyState = 0;

  private readonly listeners = new Map<
    string,
    Set<(event: Socket.WebSocketEvent) => void>
  >();

  constructor(private readonly generation: number) {
    queueMicrotask(() => {
      this.readyState = 1;
      this.emit("open", {});
      this.emit("message", { data: JSON.stringify({ type: "auth_required" }) });
    });
  }

  addEventListener(
    type: "open" | "message" | "error" | "close",
    listener: (event: Socket.WebSocketEvent) => void,
    options?: { readonly once?: boolean },
  ) {
    const current = options?.once
      ? (event: Socket.WebSocketEvent) => {
          this.removeEventListener(type, current);
          listener(event);
        }
      : listener;

    const group = this.listeners.get(type) ?? new Set();

    group.add(current);
    this.listeners.set(type, group);
  }

  removeEventListener(
    type: "open" | "message" | "error" | "close",
    listener: (event: Socket.WebSocketEvent) => void,
  ) {
    this.listeners.get(type)?.delete(listener);
  }

  send(data: string | Uint8Array<ArrayBuffer>) {
    const asText = Schema.decodeUnknownOption(Schema.String)(data);

    if (Option.isSome(asText)) {
      this.respond(asText.value);

      return;
    }

    this.respond(
      new TextDecoder().decode(
        Schema.decodeUnknownSync(Schema.Uint8Array)(data),
      ),
    );
  }

  private respond(text: string) {
    const message = decodeCommand(text);

    if (message.type === "auth") {
      this.emit("message", { data: JSON.stringify({ type: "auth_ok" }) });

      return;
    }

    if (message.type === "get_states") {
      const states =
        this.generation === 1
          ? [{ entity_id: "light.kitchen", state: "off" }]
          : fillerSnapshot("on");

      this.emit("message", {
        data: JSON.stringify(resultFrame(message, states)),
      });

      return;
    }

    // Historical chunk, then a newer live entry, then the recorder catch-up
    // for an older entry that was not committed in time for the first chunk.
    if (message.type === "logbook/event_stream") {
      const event = (payload: Schema.Json) =>
        this.emit("message", {
          data: JSON.stringify({
            id: message.id,
            type: "event",
            event: payload,
          }),
        });

      this.emit("message", {
        data: JSON.stringify(resultFrame(message, null)),
      });
      event({ events: [], start_time: 1, end_time: 2, partial: true });
      event({
        events: [
          {
            when: 1_893_456_002,
            entity_id: "light.kitchen",
            state: "on",
          },
        ],
      });
      event({
        events: [
          {
            when: 1_893_456_001,
            entity_id: "binary_sensor.door",
            state: "on",
          },
        ],
        start_time: 1,
        end_time: 2,
      });

      return;
    }

    const result = Match.value(message.type).pipe(
      Match.when("config/entity_registry/list_for_display", () => ({
        entities: [],
      })),
      Match.when("config/device_registry/list", () => []),
      Match.when("config/area_registry/list", () => []),
      Match.when("config/floor_registry/list", () => []),
      Match.when("config/label_registry/list", () => []),
      Match.when("extract_from_target", () => ({
        referenced_entities: ["light.kitchen"],
        referenced_devices: [],
        referenced_areas: [],
        missing_devices: [],
        missing_areas: [],
        missing_floors: [],
        missing_labels: [],
      })),
      Match.when("get_config", () => configResult),
      Match.orElse(() => null),
    );

    this.emit("message", {
      data: JSON.stringify(resultFrame(message, result)),
    });
  }

  close() {
    this.readyState = 3;
    this.emit("close", { code: 1006 });
  }

  private emit(
    type: "open" | "message" | "error" | "close",
    event: Socket.WebSocketEvent,
  ) {
    const group = this.listeners.get(type);

    if (group === undefined) {
      return;
    }

    for (const listener of group) {
      listener(event);
    }
  }
}

let generation = 0;

let current: FakeWebSocket | undefined;

const configLayer = Layer.succeed(
  BridgeConfig,
  BridgeConfig.of({
    path: "/tmp/ha-bridge-test-config.yml",
    load: Effect.succeed({
      url: "http://homeassistant.local:8123",
      token: Redacted.make("token"),
    }),
    setup: Effect.die("unused"),
  }),
);

const webSocketLayer = Layer.succeed(Socket.WebSocketConstructor, () => {
  generation += 1;
  current = new FakeWebSocket(generation);

  return current;
});

describe("HomeAssistant state cache", () => {
  test("watchers see state that changed across a reconnect when the snapshot is large", async () => {
    generation = 0;

    const states = await Effect.runPromise(
      Effect.gen(function* () {
        const homeAssistant = yield* HomeAssistant;
        const seen = yield* Queue.unbounded<string>();

        yield* homeAssistant
          .watchEntities({ target: { entity_id: "light.kitchen" } })
          .pipe(
            Stream.runForEach((update) =>
              Queue.offer(seen, update.state.state),
            ),
            Effect.forkScoped,
          );

        const first = yield* Queue.take(seen).pipe(Effect.timeout("2 seconds"));
        current?.close();

        let next = first;

        while (next === first) {
          next = yield* Queue.take(seen).pipe(Effect.timeout("8 seconds"));
        }

        return [first, next];
      }).pipe(
        Effect.provide(
          HomeAssistant.layer.pipe(
            Layer.provide(configLayer),
            Layer.provide(FetchHttpClient.layer),
            Layer.provide(webSocketLayer),
          ),
        ),
        Effect.scoped,
      ),
    );

    expect(states).toEqual(["off", "on"]);
  }, 15_000);
});

describe("HomeAssistant logbook watch", () => {
  test("keeps a recorder catch-up entry that arrives after a newer live one", async () => {
    generation = 0;

    const entities = await Effect.runPromise(
      Effect.gen(function* () {
        const homeAssistant = yield* HomeAssistant;
        const seen = yield* Queue.unbounded<string>();

        yield* homeAssistant.watchLogbook({}).pipe(
          Stream.runForEach((entry) =>
            Queue.offer(seen, entry.entity_id ?? ""),
          ),
          Effect.forkScoped,
        );

        const first = yield* Queue.take(seen).pipe(Effect.timeout("2 seconds"));

        const second = yield* Queue.take(seen).pipe(
          Effect.timeout("2 seconds"),
        );

        return [first, second];
      }).pipe(
        Effect.provide(
          HomeAssistant.layer.pipe(
            Layer.provide(configLayer),
            Layer.provide(FetchHttpClient.layer),
            Layer.provide(webSocketLayer),
          ),
        ),
        Effect.scoped,
      ),
    );

    expect(entities).toEqual(["binary_sensor.door", "light.kitchen"]);
  }, 15_000);
});
