import { Deferred, Effect, Fiber, Redacted, Ref, Schema } from "effect";
import { Socket } from "effect/socket";
import type { Action } from "./Action.js";
import { EntityState } from "./Entity.js";
import { HomeAssistantConfig } from "./HomeAssistantConfig.js";
import { HomeAssistantError } from "./HomeAssistantError.js";

const AuthMessage = Schema.Struct({
  type: Schema.Literals(["auth_required", "auth_ok", "auth_invalid"]),
  message: Schema.optionalKey(Schema.String),
});

const ResultMessage = Schema.Struct({
  id: Schema.Finite,
  type: Schema.Literal("result"),
  success: Schema.Boolean,
  result: Schema.optionalKey(Schema.Unknown),
  error: Schema.optionalKey(Schema.Struct({ message: Schema.String })),
});

const EventMessage = Schema.Struct({
  type: Schema.Literal("event"),
  event: Schema.Struct({
    event_type: Schema.String,
    data: Schema.Struct({
      new_state: Schema.optionalKey(Schema.NullOr(EntityState)),
    }),
  }),
});

const decodeMessage = Schema.decodeUnknownEffect(
  Schema.fromJsonString(
    Schema.Union([AuthMessage, ResultMessage, EventMessage]),
  ),
);

// Supported requests; `request` adds the message id.
export type HomeAssistantCommand =
  | {
      readonly type:
        | "get_states"
        | "get_config"
        | "config/entity_registry/list_for_display"
        | "config/device_registry/list";
    }
  | { readonly type: "subscribe_events"; readonly event_type: string }
  | {
      readonly type: "call_service";
      readonly domain: string;
      readonly service: string;
      // Undefined fields are left out when the message is serialised.
      readonly service_data?: Action["data"] | undefined;
      readonly target?: Action["target"] | undefined;
      readonly return_response?: boolean | undefined;
    };

type OutgoingMessage =
  | (HomeAssistantCommand & { readonly id: number })
  | { readonly type: "auth"; readonly access_token: string };

export interface HomeAssistantSession {
  readonly request: (
    command: HomeAssistantCommand,
  ) => Effect.Effect<unknown, HomeAssistantError>;
  // Succeeds with the action's response when `return_response` is set, otherwise null.
  readonly callAction: (
    action: Action,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError>;
  readonly getConfig: Effect.Effect<HomeAssistantConfig, HomeAssistantError>;
  // Fails once the connection is lost; never succeeds.
  readonly closed: Effect.Effect<never, HomeAssistantError>;
}

const decodeConfig = Schema.decodeUnknownEffect(HomeAssistantConfig);

const decodeActionResult = Schema.decodeUnknownEffect(
  Schema.Struct({ response: Schema.optionalKey(Schema.Json) }),
);

const failWith = (context: string) => (error: { readonly message: string }) =>
  new HomeAssistantError({ message: `${context}: ${error.message}` });

export const websocketUrl = (url: string) => {
  const parsed = new URL(url);

  const scheme =
    parsed.protocol === "https:" || parsed.protocol === "wss:" ? "wss" : "ws";

  return `${scheme}://${parsed.host}/api/websocket`;
};

const fail = (context: string) => (cause: unknown) =>
  new HomeAssistantError({ message: `${context}: ${String(cause)}` });

export const connect = Effect.fn("HomeAssistant.connect")(function* (options: {
  readonly url: string;
  readonly token: Redacted.Redacted;
  readonly onState: (state: EntityState) => Effect.Effect<void>;
  // Receives the type of every other subscribed event.
  readonly onEvent?: (eventType: string) => Effect.Effect<void>;
}) {
  const url = websocketUrl(options.url);
  yield* Effect.logInfo("Connecting to Home Assistant", url);
  const socket = yield* Socket.makeWebSocket(url);

  const pull = yield* Socket.readerString(socket).pipe(
    Effect.mapError(fail("connect to Home Assistant")),
  );

  const writer = yield* socket.writer;

  const send = (message: OutgoingMessage) =>
    writer
      .write(JSON.stringify(message))
      .pipe(Effect.mapError(fail("send request")));

  const frames: Array<string> = [];

  const nextMessage: Effect.Effect<
    | typeof AuthMessage.Type
    | typeof ResultMessage.Type
    | typeof EventMessage.Type,
    HomeAssistantError
  > = Effect.suspend(() => {
    const frame = frames.shift();

    if (frame === undefined) {
      return pull.pipe(
        Effect.mapError(fail("read message")),
        Effect.flatMap((batch) => {
          frames.push(...batch);

          return nextMessage;
        }),
      );
    }

    return decodeMessage(frame).pipe(
      Effect.catch((error) =>
        Effect.logDebug("Ignoring Home Assistant message", error.message).pipe(
          Effect.andThen(nextMessage),
        ),
      ),
    );
  });

  const welcome = yield* nextMessage;

  if (welcome.type !== "auth_required") {
    return yield* new HomeAssistantError({
      message: `unexpected welcome message type "${welcome.type}"`,
    });
  }

  yield* send({ type: "auth", access_token: Redacted.value(options.token) });
  const auth = yield* nextMessage;

  if (auth.type !== "auth_ok") {
    const reason = "message" in auth && auth.message ? `: ${auth.message}` : "";

    return yield* new HomeAssistantError({
      message: `authentication failed with response type "${auth.type}"${reason}`,
    });
  }

  yield* Effect.logInfo("Authenticated with Home Assistant");

  const pending = new Map<
    number,
    Deferred.Deferred<unknown, HomeAssistantError>
  >();

  const nextId = yield* Ref.make(1);

  const dispatch = Effect.fn(function* (
    message:
      | typeof AuthMessage.Type
      | typeof ResultMessage.Type
      | typeof EventMessage.Type,
  ) {
    if (message.type === "result") {
      const deferred = pending.get(message.id);

      if (deferred === undefined) {
        return;
      }

      yield* message.success
        ? Deferred.succeed(deferred, message.result)
        : Deferred.fail(
            deferred,
            new HomeAssistantError({
              message: message.error?.message ?? "request failed",
            }),
          );

      return;
    }

    if (message.type !== "event") {
      return;
    }

    const { event_type, data } = message.event;

    if (event_type === "state_changed") {
      if (data.new_state) {
        yield* options.onState(data.new_state);
      }
    } else if (options.onEvent !== undefined) {
      yield* options.onEvent(event_type);
    }
  });

  const reader = yield* Effect.forkScoped(
    Effect.forever(Effect.flatMap(nextMessage, dispatch)),
  );

  const closed = Fiber.join(reader);

  const request = (command: HomeAssistantCommand) =>
    Effect.gen(function* () {
      const id = yield* Ref.getAndUpdate(nextId, (value) => value + 1);
      const deferred = yield* Deferred.make<unknown, HomeAssistantError>();
      pending.set(id, deferred);

      return yield* send({ ...command, id }).pipe(
        Effect.andThen(Effect.raceFirst(Deferred.await(deferred), closed)),
        Effect.ensuring(Effect.sync(() => pending.delete(id))),
      );
    });

  const callAction = Effect.fn("HomeAssistant.callAction")(function* (
    action: Action,
  ) {
    const separator = action.action.indexOf(".");

    const result = yield* request({
      type: "call_service",
      domain: action.action.slice(0, separator),
      service: action.action.slice(separator + 1),
      service_data: action.data,
      target: action.target,
      return_response: action.return_response,
    });

    const { response } = yield* decodeActionResult(result).pipe(
      Effect.mapError(failWith("decode action result")),
    );

    return response ?? null;
  });

  const getConfig = request({ type: "get_config" }).pipe(
    Effect.flatMap((result) =>
      decodeConfig(result).pipe(
        Effect.mapError(failWith("decode Home Assistant config")),
      ),
    ),
  );

  return {
    request,
    callAction,
    getConfig,
    closed,
  } satisfies HomeAssistantSession;
});
