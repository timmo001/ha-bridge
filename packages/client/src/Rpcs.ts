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
} from "@timmo001/effect-ha";
import { EntityUpdate } from "./Entity.js";
import { SearchEmpty, SearchRequest, SearchResults } from "./Search.js";
import { TargetError, TargetRequest } from "./Target.js";

const TargetFailure = Schema.Union([HomeAssistantError, TargetError]);

export class BridgeRpcs extends RpcGroup.make(
  // Every entity the target refers to, as Home Assistant expands it.
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
  // Fuzzy search over cached entities, devices and areas, or a list of
  // them without a query. Only a target needs Home Assistant.
  Rpc.make("Search", {
    payload: SearchRequest,
    success: SearchResults,
    error: Schema.Union([SearchEmpty, HomeAssistantError, TargetError]),
  }),
) {}
