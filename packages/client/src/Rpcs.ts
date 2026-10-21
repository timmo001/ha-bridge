import { Rpc, RpcGroup } from "effect/rpc";
import { Schema } from "effect";
import {
  Action,
  CameraSnapshot,
  HomeAssistantConfig,
  HomeAssistantError,
  Target,
  TemplateRender,
  TemplateRequest,
  TemplateUpdate,
  FireEventRequest,
  HomeAssistantEvent,
  History,
  LogbookEntry,
  ConditionRequest,
  ConditionResult,
  ConditionUpdate,
  TriggerEvent,
  TriggerRequest,
  WatchConditionRequest,
  WatchEventsRequest,
  SystemLogEntry,
} from "@timmo001/effect-ha";
import { EntityUpdate } from "./Entity.js";
import {
  ConfigUnavailable,
  ConfigValidation,
  CreateEntityConfigRequest,
  EntityConfig,
  EntityConfigRequest,
  SavedEntityConfig,
  UpdateEntityConfigRequest,
  ValidateEntityConfigRequest,
} from "./EntityConfig.js";
import {
  HistoryRequest,
  LogbookRequest,
  WatchLogbookRequest,
} from "./History.js";
import {
  LogApp,
  LogBoots,
  LogRequest,
  LogSearchRequest,
  LogSearchResults,
  LogUnavailable,
  SystemLogRequest,
  WatchLogRequest,
} from "./Log.js";
import { SearchEmpty, SearchRequest, SearchResults } from "./Search.js";
import { TargetError, TargetRequest } from "./Target.js";

const TargetFailure = Schema.Union([HomeAssistantError, TargetError]);

const LogFailure = Schema.Union([HomeAssistantError, LogUnavailable]);

const ConfigFailure = Schema.Union([HomeAssistantError, ConfigUnavailable]);

export class BridgeRpcs extends RpcGroup.make(
  // Every entity the target refers to, as Home Assistant expands it. An
  // entity_id of all gives every entity the bridge knows.
  Rpc.make("GetEntities", {
    payload: TargetRequest,
    success: Schema.Array(EntityUpdate),
    error: TargetFailure,
  }),
  // Emits the current state of every matching entity, then every change. The
  // target is expanded again after reconnects and registry changes.
  Rpc.make("WatchEntities", {
    payload: TargetRequest,
    success: EntityUpdate,
    error: TargetError,
    stream: true,
  }),
  // Succeeds with the action's response when `return_response` is set. Names
  // in the target are resolved to IDs first.
  Rpc.make("CallAction", {
    payload: Action,
    success: Schema.NullOr(Schema.Json),
    error: TargetFailure,
  }),
  Rpc.make("GetConfig", {
    success: HomeAssistantConfig,
    error: HomeAssistantError,
  }),
  // The target must match exactly one camera.
  Rpc.make("CameraSnapshot", {
    payload: { target: Target },
    success: CameraSnapshot,
    error: TargetFailure,
  }),
  // The template's first render. Fails on a render error.
  Rpc.make("RenderTemplate", {
    payload: TemplateRequest,
    success: TemplateRender,
    error: HomeAssistantError,
  }),
  // Every render, including errors and warnings, as what the template
  // depends on changes. Renders again after reconnects.
  Rpc.make("WatchTemplate", {
    payload: TemplateRequest,
    success: TemplateUpdate,
    error: HomeAssistantError,
    stream: true,
  }),
  // Every event of `event_type`, or of every type, following reconnects.
  // Most types need an admin token.
  Rpc.make("WatchEvents", {
    payload: WatchEventsRequest,
    success: HomeAssistantEvent,
    error: HomeAssistantError,
    stream: true,
  }),
  // Fires an event on Home Assistant's event bus. Needs an admin token.
  Rpc.make("FireEvent", {
    payload: FireEventRequest,
    error: HomeAssistantError,
  }),
  // Each entity's recorded states, keyed by entity ID.
  Rpc.make("GetHistory", {
    payload: HistoryRequest,
    success: History,
    error: TargetFailure,
  }),
  Rpc.make("GetLogbook", {
    payload: LogbookRequest,
    success: Schema.Array(LogbookEntry),
    error: TargetFailure,
  }),
  // Each new logbook entry. After a reconnect, it carries on from then.
  Rpc.make("WatchLogbook", {
    payload: WatchLogbookRequest,
    success: LogbookEntry,
    error: TargetFailure,
    stream: true,
  }),
  // Each time the triggers fire, following reconnects. Needs an admin token.
  Rpc.make("WatchTrigger", {
    payload: TriggerRequest,
    success: TriggerEvent,
    error: HomeAssistantError,
    stream: true,
  }),
  // Whether the conditions pass. Needs an admin token.
  Rpc.make("TestCondition", {
    payload: ConditionRequest,
    success: ConditionResult,
    error: HomeAssistantError,
  }),
  // Whether the conditions pass, then each change, following reconnects.
  Rpc.make("WatchCondition", {
    payload: WatchConditionRequest,
    success: ConditionUpdate,
    error: HomeAssistantError,
    stream: true,
  }),
  // Core's logged errors and warnings, newest first. Needs an admin token.
  Rpc.make("GetSystemLog", {
    payload: SystemLogRequest,
    success: Schema.Array(SystemLogEntry),
    error: LogFailure,
  }),
  // Each new error or warning, and each repeat of an earlier one, following
  // reconnects. Needs an admin token.
  Rpc.make("WatchSystemLog", {
    payload: SystemLogRequest,
    success: SystemLogEntry,
    error: LogFailure,
    stream: true,
  }),
  // A log's latest records, oldest first: Core's, the Supervisor's, the
  // host's, a plugin's or an app's. Needs an admin token, and a Supervisor
  // for every log but Core's.
  Rpc.make("GetLog", {
    payload: LogRequest,
    success: Schema.Array(Schema.String),
    error: LogFailure,
  }),
  // A log's latest records, then each new one, following reconnects. Core's
  // needs Core 2026.11 or newer.
  Rpc.make("WatchLog", {
    payload: WatchLogRequest,
    success: Schema.String,
    error: LogFailure,
    stream: true,
  }),
  // The host's boots, for reading an earlier boot's logs.
  Rpc.make("GetLogBoots", {
    success: LogBoots,
    error: LogFailure,
  }),
  // The installed apps, whose slugs read their logs.
  Rpc.make("GetLogApps", {
    success: Schema.Array(LogApp),
    error: LogFailure,
  }),
  // Fuzzy search across Core's errors and logs, best match first.
  Rpc.make("SearchLogs", {
    payload: LogSearchRequest,
    success: LogSearchResults,
    error: LogFailure,
  }),
  // An automation's or script's config, wherever it's defined. Needs an
  // admin token.
  Rpc.make("GetEntityConfig", {
    payload: EntityConfigRequest,
    success: EntityConfig,
    error: ConfigFailure,
  }),
  // Adds an automation or script to automations.yaml or scripts.yaml, once
  // Home Assistant has validated it. Needs an admin token.
  Rpc.make("CreateEntityConfig", {
    payload: CreateEntityConfigRequest,
    success: SavedEntityConfig,
    error: ConfigFailure,
  }),
  // Replaces an editable automation's or script's config, once Home
  // Assistant has validated it. Needs an admin token.
  Rpc.make("UpdateEntityConfig", {
    payload: UpdateEntityConfigRequest,
    success: SavedEntityConfig,
    error: ConfigFailure,
  }),
  // Removes an editable automation or script, and its entity. Needs an
  // admin token.
  Rpc.make("DeleteEntityConfig", {
    payload: EntityConfigRequest,
    success: SavedEntityConfig,
    error: ConfigFailure,
  }),
  // Checks an automation or script config without saving it: whether Home
  // Assistant accepts its triggers, conditions and actions, and what it
  // names that Home Assistant doesn't have.
  Rpc.make("ValidateEntityConfig", {
    payload: ValidateEntityConfigRequest,
    success: ConfigValidation,
    error: HomeAssistantError,
  }),
  // Fuzzy search over cached entities, devices and areas, or a list of
  // them without a query. Only a target needs Home Assistant.
  Rpc.make("Search", {
    payload: SearchRequest,
    success: SearchResults,
    error: Schema.Union([SearchEmpty, HomeAssistantError, TargetError]),
  }),
) {}
