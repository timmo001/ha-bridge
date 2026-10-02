import {
  Deferred,
  Effect,
  Fiber,
  Queue,
  Redacted,
  Ref,
  Schema,
  type Scope,
  Stream,
} from "effect";
import { Socket } from "effect/socket";
import type { Action } from "./Action.js";
import { HomeAssistantConfig } from "./HomeAssistantConfig.js";
import { HomeAssistantError } from "./HomeAssistantError.js";
import type { FireEventRequest } from "./Event.js";
import type { TemplateRequest } from "./Template.js";
import {
  ExtractedTarget,
  type ExtractTargetOptions,
  type Target,
} from "./Target.js";

const AuthMessage = Schema.Struct({
  type: Schema.Literals(["auth_required", "auth_ok", "auth_invalid"]),
  message: Schema.optionalKey(Schema.String),
});

const ResultMessage = Schema.Struct({
  id: Schema.Finite,
  type: Schema.Literal("result"),
  success: Schema.Boolean,
  result: Schema.optionalKey(Schema.NullOr(Schema.Json)),
  error: Schema.optionalKey(Schema.Struct({ message: Schema.String })),
});

// `id` is the id of the subscribing request.
const EventMessage = Schema.Struct({
  id: Schema.Finite,
  type: Schema.Literal("event"),
  event: Schema.Json,
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
        | "config/device_registry/list"
        | "config/area_registry/list"
        | "config/floor_registry/list"
        | "config/label_registry/list";
    }
  | { readonly type: "unsubscribe_events"; readonly subscription: number }
  | {
      readonly type: "fire_event";
      readonly event_type: string;
      readonly event_data?: FireEventRequest["event_data"] | undefined;
    }
  | {
      readonly type: "history/history_during_period";
      // ISO times.
      readonly start_time: string;
      readonly end_time?: string | undefined;
      readonly entity_ids: ReadonlyArray<string>;
      readonly no_attributes?: boolean | undefined;
      readonly significant_changes_only?: boolean | undefined;
    }
  | ({ readonly type: "logbook/get_events" } & LogbookQuery)
  | {
      readonly type: "extract_from_target";
      readonly target: Target;
      readonly expand_group?: boolean | undefined;
      readonly primary_entities_only?: boolean | undefined;
    }
  | {
      readonly type: "call_service";
      readonly domain: string;
      readonly service: string;
      // Undefined fields are left out when the message is serialised.
      readonly service_data?: Action["data"] | undefined;
      readonly target?: Action["target"] | undefined;
      readonly return_response?: boolean | undefined;
    };

// Requests that stream events until they are unsubscribed.
export type HomeAssistantSubscription =
  | {
      readonly type: "subscribe_events";
      // Every event when left out; needs an admin token for most types.
      readonly event_type?: string | undefined;
    }
  | {
      readonly type: "render_template";
      readonly template: string;
      readonly variables?: TemplateRequest["variables"] | undefined;
      readonly strict?: boolean | undefined;
      readonly timeout?: number | undefined;
      // Sends render errors and warnings as events.
      readonly report_errors?: boolean | undefined;
    }
  | ({ readonly type: "logbook/event_stream" } & LogbookQuery);

// Logbook entries between ISO times, for some entities and devices, or all
// of them when both are left out.
export interface LogbookQuery {
  readonly start_time: string;
  readonly end_time?: string | undefined;
  readonly entity_ids?: ReadonlyArray<string> | undefined;
  readonly device_ids?: ReadonlyArray<string> | undefined;
}

type OutgoingMessage =
  | ((HomeAssistantCommand | HomeAssistantSubscription) & {
      readonly id: number;
    })
  | { readonly type: "auth"; readonly access_token: string };

export interface HomeAssistantSession {
  readonly request: (
    command: HomeAssistantCommand,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError>;
  // Succeeds with the action's response when `return_response` is set, otherwise null.
  readonly callAction: (
    action: Action,
  ) => Effect.Effect<Schema.Json | null, HomeAssistantError>;
  readonly getConfig: Effect.Effect<HomeAssistantConfig, HomeAssistantError>;
  // What the target refers to, expanded by Home Assistant. Names aren't
  // resolved; every field must hold IDs.
  readonly extractTarget: (
    target: Target,
    options?: ExtractTargetOptions,
  ) => Effect.Effect<ExtractedTarget, HomeAssistantError>;
  // Succeeds once Home Assistant accepts the subscription, with its events,
  // which fail once the connection is lost. Closing the scope unsubscribes.
  readonly subscribe: (
    subscription: HomeAssistantSubscription,
  ) => Effect.Effect<
    Stream.Stream<Schema.Json, HomeAssistantError>,
    HomeAssistantError,
    Scope.Scope
  >;
  // Fails once the connection is lost; never succeeds.
  readonly closed: Effect.Effect<never, HomeAssistantError>;
}

const decodeConfig = Schema.decodeUnknownEffect(HomeAssistantConfig);

const decodeExtractedTarget = Schema.decodeUnknownEffect(ExtractedTarget);

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
}) {
  const url = websocketUrl(options.url);
  yield* Effect.logInfo("Connecting to Home Assistant", url);
  const socket = yield* Socket.makeWebSocket(url);

  const pull = yield* Socket.readerString(socket).pipe(
    Effect.mapError(fail("connect to Home Assistant")),
  );

  const writer = yield* socket.writer;

  const write = (message: OutgoingMessage) =>
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

  yield* write({ type: "auth", access_token: Redacted.value(options.token) });
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
    Deferred.Deferred<Schema.Json | null, HomeAssistantError>
  >();

  // Events wait here until their stream reads them, so the reader keeps up
  // with Home Assistant.
  const subscriptions = new Map<number, Queue.Queue<Schema.Json>>();

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
        ? Deferred.succeed(deferred, message.result ?? null)
        : Deferred.fail(
            deferred,
            new HomeAssistantError({
              message: message.error?.message ?? "request failed",
            }),
          );

      return;
    }

    if (message.type === "event") {
      const queue = subscriptions.get(message.id);

      if (queue !== undefined) {
        yield* Queue.offer(queue, message.event);
      }
    }
  });

  const reader = yield* Effect.forkScoped(
    Effect.forever(Effect.flatMap(nextMessage, dispatch)),
  );

  const closed = Fiber.join(reader);

  const send = (
    id: number,
    command: HomeAssistantCommand | HomeAssistantSubscription,
  ) =>
    Effect.gen(function* () {
      const deferred = yield* Deferred.make<
        Schema.Json | null,
        HomeAssistantError
      >();

      pending.set(id, deferred);

      return yield* write({ ...command, id }).pipe(
        Effect.andThen(Effect.raceFirst(Deferred.await(deferred), closed)),
        Effect.ensuring(Effect.sync(() => pending.delete(id))),
      );
    });

  const takeId = Ref.getAndUpdate(nextId, (value) => value + 1);

  const request = (command: HomeAssistantCommand) =>
    Effect.flatMap(takeId, (id) => send(id, command));

  const subscribe = Effect.fn("HomeAssistant.subscribe")(function* (
    subscription: HomeAssistantSubscription,
  ) {
    const id = yield* takeId;
    const queue = yield* Queue.unbounded<Schema.Json>();

    // Registered first, so no event arrives before its queue.
    yield* Effect.acquireRelease(
      Effect.sync(() => subscriptions.set(id, queue)),
      () => Effect.sync(() => subscriptions.delete(id)),
    );

    yield* send(id, subscription);

    yield* Effect.addFinalizer(() =>
      request({ type: "unsubscribe_events", subscription: id }).pipe(
        Effect.ignore,
      ),
    );

    return Stream.fromQueue(queue).pipe(Stream.interruptWhen(closed));
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

  const extractTarget = Effect.fn("HomeAssistant.extractTarget")(function* (
    target: Target,
    extract?: ExtractTargetOptions,
  ) {
    const result = yield* request({
      type: "extract_from_target",
      target,
      expand_group: extract?.expandGroup,
      primary_entities_only: extract?.primaryEntitiesOnly,
    });

    return yield* decodeExtractedTarget(result).pipe(
      Effect.mapError(failWith("decode extracted target")),
    );
  });

  return {
    request,
    callAction,
    getConfig,
    extractTarget,
    subscribe,
    closed,
  } satisfies HomeAssistantSession;
});
