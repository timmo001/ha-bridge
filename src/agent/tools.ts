/**
 * The Code Mode surface. `ha-bridge agent tools --json` describes each tool,
 * and `ha-bridge agent call <tool>` runs one with its input as JSON on stdin,
 * so the OpenCode plugin in packages/opencode only needs the binary, and its
 * tools always match it.
 */
import {
  ConditionRequest,
  ConditionResult,
  FireEventRequest,
  History,
  HomeAssistantConfig,
  HomeAssistantEvent,
  LogbookEntry,
  SystemLogEntry,
  TemplateRender,
} from "@timmo001/effect-ha";
import {
  BridgeClient,
  CheckUpdatesRequest,
  ConfigValidation,
  CreateEntityConfigRequest,
  EntityConfig,
  EntityConfigRequest,
  EntityUpdate,
  HistoryRequest,
  LogApp,
  LogBoots,
  LogbookRequest,
  LogRequest,
  LogSearchRequest,
  LogSearchResults,
  SavedEntityConfig,
  SearchRequest,
  SearchResults,
  SystemLogRequest,
  TargetRequest,
  UpdateDetails,
  UpdateEntityConfigRequest,
  UpdateRequest,
  UpdatesCheck,
  UpdatesRequest,
  UpdateStatus,
  ValidateEntityConfigRequest,
} from "@timmo001/effect-ha-bridge";
import { Duration, Effect, Predicate, Schema, Stream } from "effect";
import { RpcClientError } from "effect/rpc/RpcClientError";

/** Why a Code Mode call failed. */
export class AgentError extends Schema.TaggedError<AgentError>()("AgentError", {
  message: Schema.String,
}) {}

const JsonObject = Schema.Record(Schema.String, Schema.Json);

/** One tool as the plugin registers it. */
export const ManifestTool = Schema.Struct({
  name: Schema.String,
  argv: Schema.Array(Schema.String),
  description: Schema.String,
  access: Schema.Literals(["read", "write"]),
  alwaysAsk: Schema.Boolean,
  pinned: Schema.Boolean,
  timeoutMillis: Schema.Int,
  json: Schema.Boolean,
  // The whole input goes to the command as JSON on stdin.
  stdin: Schema.Boolean,
  input: JsonObject,
  // The input key whose value narrows the write permission below the tool,
  // such as call_action's action, so "always allow" covers one action.
  resource: Schema.optionalKey(Schema.String),
});

export type ManifestTool = typeof ManifestTool.Type;

/** Every tool, and whether the bridge's socket is there to call them. */
export const Manifest = Schema.Struct({
  available: Schema.Boolean,
  tools: Schema.Array(ManifestTool),
});

export type Manifest = typeof Manifest.Type;

interface AgentTool {
  readonly name: string;
  readonly description: string;
  readonly access: "read" | "write";
  readonly pinned: boolean;
  readonly timeout: Duration.Duration;
  readonly resource: string | undefined;
  readonly input: Schema.Json;
  readonly call: (
    text: string,
  ) => Effect.Effect<string, AgentError | RpcClientError, BridgeClient>;
}

const isJsonObject = Schema.is(JsonObject);

const decodeJson = Schema.decodeUnknownSync(Schema.Json);

const safeIntegerBounds = new Map([
  ["minimum", Number.MIN_SAFE_INTEGER],
  ["maximum", Number.MAX_SAFE_INTEGER],
]);

// Effect adds the safe-integer range to every Schema.Int; drop it as OpenCode
// does, so the catalogue's signatures stay short.
const dropSafeIntegerBounds = (schema: Schema.Json): Schema.Json => {
  if (Array.isArray(schema)) {
    return schema.map(dropSafeIntegerBounds);
  }

  if (!isJsonObject(schema)) {
    return schema;
  }

  const integer = schema["type"] === "integer";

  return Object.fromEntries(
    Object.entries(schema)
      .filter(
        ([key, value]) => !integer || safeIntegerBounds.get(key) !== value,
      )
      .map(([key, value]) => [key, dropSafeIntegerBounds(value)]),
  );
};

const jsonSchemaOf = (schema: Schema.Top) => {
  const document = Schema.toJsonSchemaDocument(schema, {
    onExcessProperty: "error",
  });

  return dropSafeIntegerBounds(
    decodeJson(
      Object.keys(document.definitions).length === 0
        ? document.schema
        : { ...document.schema, $defs: document.definitions },
    ),
  );
};

// Every client failure carries a message; connection failures pass through,
// for the CLI to explain.
const toAgentError = <E>(error: E) =>
  error instanceof RpcClientError
    ? error
    : new AgentError({
        message: Predicate.hasProperty(error, "message")
          ? String(error.message)
          : String(error),
      });

// Binds a tool's input and output schemas to its run, so each call decodes
// its stdin strictly and prints its result in the bridge's wire format.
const tool = <I, IE, O, OE, E>(definition: {
  readonly name: string;
  readonly description: string;
  readonly access: "read" | "write";
  readonly pinned?: boolean;
  readonly timeout?: Duration.Input;
  readonly resource?: string;
  readonly input: Schema.Codec<I, IE>;
  readonly output: Schema.Codec<O, OE>;
  readonly run: (input: I) => Effect.Effect<O, E, BridgeClient>;
}): AgentTool => {
  const timeout = Duration.fromInputUnsafe(definition.timeout ?? "2 minutes");

  const decode = Schema.decodeUnknownEffect(
    Schema.fromJsonString(Schema.toCodecJson(definition.input)),
  );

  const encode = Schema.encodeEffect(Schema.toCodecJson(definition.output));

  return {
    name: definition.name,
    description: definition.description,
    access: definition.access,
    pinned: definition.pinned ?? false,
    timeout,
    resource: definition.resource,
    input: jsonSchemaOf(definition.input),
    call: (text) =>
      Effect.gen(function* () {
        const input = yield* decode(text.trim() === "" ? "{}" : text, {
          onExcessProperty: "error",
          errors: "all",
        }).pipe(
          Effect.mapError(
            (error) =>
              new AgentError({ message: `Invalid input: ${error.message}` }),
          ),
        );

        const result = yield* definition.run(input).pipe(
          Effect.mapError(toAgentError),
          Effect.timeoutOrElse({
            duration: timeout,
            orElse: () =>
              Effect.fail(
                new AgentError({ message: `${definition.name} timed out` }),
              ),
          }),
        );

        const encoded = yield* encode(result).pipe(
          Effect.mapError(
            (error) =>
              new AgentError({
                message: `Could not encode the result: ${error.message}`,
              }),
          ),
        );

        return JSON.stringify(encoded, null, 2);
      }),
  };
};

const withBridge = <A, E>(
  f: (bridge: BridgeClient["Service"]) => Effect.Effect<A, E>,
) => Effect.flatMap(Effect.service(BridgeClient), f);

// Struct({}) accepts any keys, so a tool that takes none uses this instead.
const NoInput = Schema.Record(Schema.String, Schema.Never);

const Ok = Schema.Struct({ ok: Schema.Boolean });

const ok = { ok: true } as const;

const watchLimits = {
  count: Schema.optionalKey(Schema.Int).annotate({
    description: "Stop after this many updates, 1 by default",
  }),
  seconds: Schema.optionalKey(Schema.Int).annotate({
    description: "Stop after this many seconds, 60 by default",
  }),
};

// A stream's first items, stopping at a count or a deadline.
const collect = <A, E>(
  stream: Stream.Stream<A, E>,
  limits: { readonly count?: number; readonly seconds?: number },
) =>
  stream.pipe(
    Stream.take(limits.count ?? 1),
    Stream.interruptWhen(Effect.sleep(Duration.seconds(limits.seconds ?? 60))),
    Stream.runCollect,
  );

/** Every Code Mode tool, in the order the catalogue lists them. */
export const agentTools: ReadonlyArray<AgentTool> = [
  tool({
    name: "get_entities",
    description:
      "Read the state, attributes and name of the entities a target matches, optionally in one domain.",
    access: "read",
    pinned: true,
    input: TargetRequest,
    output: Schema.Array(EntityUpdate),
    run: (input) => withBridge((bridge) => bridge.GetEntities(input)),
  }),
  tool({
    name: "search",
    description:
      "Fuzzy-search entities, devices and areas by name, or list those a target matches.",
    access: "read",
    pinned: true,
    input: SearchRequest,
    output: SearchResults,
    run: (input) => withBridge((bridge) => bridge.Search(input)),
  }),
  tool({
    name: "get_config",
    description:
      "Read Home Assistant's core config: location, time zone, version and units.",
    access: "read",
    input: NoInput,
    output: HomeAssistantConfig,
    run: () => withBridge((bridge) => bridge.GetConfig()),
  }),
  tool({
    name: "render_template",
    description: "Render a Jinja template in Home Assistant.",
    access: "read",
    input: Schema.Struct({
      template: Schema.String,
      variables: Schema.optionalKey(JsonObject),
      strict: Schema.optionalKey(Schema.Boolean),
    }),
    output: TemplateRender,
    run: (input) => withBridge((bridge) => bridge.RenderTemplate(input)),
  }),
  tool({
    name: "test_condition",
    description:
      "Check whether a condition, in automation YAML form as JSON, holds now.",
    access: "read",
    input: ConditionRequest,
    output: ConditionResult,
    run: (input) => withBridge((bridge) => bridge.TestCondition(input)),
  }),
  tool({
    name: "get_history",
    description:
      "Read the state history of a target's entities from an ISO start time.",
    access: "read",
    input: HistoryRequest,
    output: History,
    run: (input) => withBridge((bridge) => bridge.GetHistory(input)),
  }),
  tool({
    name: "get_logbook",
    description:
      "Read logbook entries from an ISO start time, for a target or everything.",
    access: "read",
    input: LogbookRequest,
    output: Schema.Array(LogbookEntry),
    run: (input) => withBridge((bridge) => bridge.GetLogbook(input)),
  }),
  tool({
    name: "get_system_log",
    description:
      "Read Home Assistant's system log: grouped errors and warnings with their counts.",
    access: "read",
    pinned: true,
    input: SystemLogRequest,
    output: Schema.Array(SystemLogEntry),
    run: (input) => withBridge((bridge) => bridge.GetSystemLog(input)),
  }),
  tool({
    name: "get_log",
    description:
      "Read raw log lines from core, the supervisor, the host or an app, optionally filtered.",
    access: "read",
    input: LogRequest,
    output: Schema.Array(Schema.String),
    run: (input) => withBridge((bridge) => bridge.GetLog(input)),
  }),
  tool({
    name: "search_logs",
    description:
      "Search the logs of core, the supervisor, apps and the system log's errors at once.",
    access: "read",
    input: LogSearchRequest,
    output: LogSearchResults,
    run: (input) => withBridge((bridge) => bridge.SearchLogs(input)),
  }),
  tool({
    name: "get_log_boots",
    description: "List the host boots that get_log's boot can select.",
    access: "read",
    input: NoInput,
    output: LogBoots,
    run: () => withBridge((bridge) => bridge.GetLogBoots()),
  }),
  tool({
    name: "get_log_apps",
    description: "List the apps whose logs get_log can read.",
    access: "read",
    input: NoInput,
    output: Schema.Array(LogApp),
    run: () => withBridge((bridge) => bridge.GetLogApps()),
  }),
  tool({
    name: "get_updates",
    description:
      "List Home Assistant's updates: Core, the OS, the Supervisor, apps and device firmware, with installed and latest versions. available keeps those waiting.",
    access: "read",
    input: UpdatesRequest,
    output: Schema.Array(UpdateStatus),
    run: (input) => withBridge((bridge) => bridge.GetUpdates(input)),
  }),
  tool({
    name: "get_update",
    description:
      "Read one update entity in full, with its integration and release notes.",
    access: "read",
    input: UpdateRequest,
    output: UpdateDetails,
    run: (input) => withBridge((bridge) => bridge.GetUpdate(input)),
  }),
  tool({
    name: "check_updates",
    description:
      "Check for new versions, as Settings > Updates does: the Supervisor first, then each update entity or those a target matches. Install with call_action update.install.",
    access: "read",
    input: CheckUpdatesRequest,
    output: UpdatesCheck,
    run: (input) => withBridge((bridge) => bridge.CheckUpdates(input)),
  }),
  tool({
    name: "get_entity_config",
    description: "Read an automation's or script's config by its entity ID.",
    access: "read",
    input: EntityConfigRequest,
    output: EntityConfig,
    run: (input) => withBridge((bridge) => bridge.GetEntityConfig(input)),
  }),
  tool({
    name: "validate_entity_config",
    description:
      "Check an automation or script config before saving it, listing errors and unknown references.",
    access: "read",
    input: ValidateEntityConfigRequest,
    output: ConfigValidation,
    run: (input) => withBridge((bridge) => bridge.ValidateEntityConfig(input)),
  }),
  tool({
    name: "watch_entities",
    description:
      "Wait for state changes of a target's entities, returning the first count of them.",
    access: "read",
    timeout: "1 hour",
    input: Schema.Struct({ ...TargetRequest.fields, ...watchLimits }),
    output: Schema.Array(EntityUpdate),
    run: ({ count, seconds, ...request }) =>
      withBridge((bridge) =>
        collect(bridge.WatchEntities(request), { count, seconds }),
      ),
  }),
  tool({
    name: "watch_events",
    description:
      "Wait for Home Assistant events, of one type or any, returning the first count of them.",
    access: "read",
    timeout: "1 hour",
    input: Schema.Struct({
      event_type: Schema.optionalKey(Schema.String),
      ...watchLimits,
    }),
    output: Schema.Array(HomeAssistantEvent),
    run: ({ count, seconds, ...request }) =>
      withBridge((bridge) =>
        collect(bridge.WatchEvents(request), { count, seconds }),
      ),
  }),
  tool({
    name: "call_action",
    description:
      "Call a Home Assistant action, such as light.turn_on, on a target.",
    access: "write",
    resource: "action",
    input: Schema.Struct({
      action: Schema.String.annotate({
        description: "domain.action, such as light.turn_on",
      }),
      target: Schema.optionalKey(TargetRequest.fields.target),
      data: Schema.optionalKey(JsonObject),
      return_response: Schema.optionalKey(Schema.Boolean),
    }),
    output: Schema.NullOr(Schema.Json),
    run: (input) => withBridge((bridge) => bridge.CallAction(input)),
  }),
  tool({
    name: "fire_event",
    description: "Fire a Home Assistant event.",
    access: "write",
    resource: "event_type",
    input: FireEventRequest,
    output: Ok,
    run: (input) =>
      withBridge((bridge) => bridge.FireEvent(input)).pipe(Effect.as(ok)),
  }),
  tool({
    name: "create_entity_config",
    description:
      "Create an automation or script. Validate it first with validate_entity_config.",
    access: "write",
    resource: "domain",
    input: CreateEntityConfigRequest,
    output: SavedEntityConfig,
    run: (input) => withBridge((bridge) => bridge.CreateEntityConfig(input)),
  }),
  tool({
    name: "update_entity_config",
    description:
      "Replace an automation's or script's config. Validate it first with validate_entity_config.",
    access: "write",
    resource: "domain",
    input: UpdateEntityConfigRequest,
    output: SavedEntityConfig,
    run: (input) => withBridge((bridge) => bridge.UpdateEntityConfig(input)),
  }),
  tool({
    name: "delete_entity_config",
    description: "Delete an automation or script.",
    access: "write",
    resource: "domain",
    input: EntityConfigRequest,
    output: SavedEntityConfig,
    run: (input) => withBridge((bridge) => bridge.DeleteEntityConfig(input)),
  }),
];

/** The tool names `agent call` accepts. */
export const agentToolNames = agentTools.map(({ name }) => name);

/** The Code Mode manifest; `available` says whether the socket exists. */
export const manifest = (available: boolean): Manifest => ({
  available,
  tools: agentTools.map((entry) => {
    const input = isJsonObject(entry.input) ? entry.input : {};

    return {
      name: entry.name,
      argv: ["agent", "call", entry.name],
      description: entry.description,
      access: entry.access,
      alwaysAsk: false,
      pinned: entry.pinned,
      timeoutMillis: Duration.toMillis(entry.timeout),
      json: true,
      stdin: true,
      input,
      // JSON.stringify leaves it out when unset.
      resource: entry.resource,
    };
  }),
});

/** Run one tool with its JSON input and return its JSON result. */
export const callAgentTool = Effect.fn("callAgentTool")(function* (
  name: string,
  text: string,
) {
  const entry = agentTools.find((candidate) => candidate.name === name);

  if (entry === undefined) {
    return yield* new AgentError({ message: `No tool ${name}` });
  }

  return yield* entry.call(text);
});
