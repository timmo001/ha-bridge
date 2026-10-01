import { Rpc, RpcGroup } from "effect/rpc";
import { Schema } from "effect";
import { Action } from "./Action.js";
import { CameraSnapshot } from "./Camera.js";
import { HomeAssistantError } from "./HomeAssistantError.js";
import { HomeAssistantConfig } from "./HomeAssistantConfig.js";
import { EntityUpdate } from "./Entity.js";

const EntityPayload = { entityId: Schema.String };

export class BridgeRpcs extends RpcGroup.make(
  Rpc.make("GetEntity", {
    payload: EntityPayload,
    success: Schema.NullOr(EntityUpdate),
  }),
  Rpc.make("WatchEntity", {
    payload: EntityPayload,
    success: EntityUpdate,
    stream: true,
  }),
  // Succeeds with the action's response when `return_response` is set.
  Rpc.make("CallAction", {
    payload: Action,
    success: Schema.NullOr(Schema.Json),
    error: HomeAssistantError,
  }),
  Rpc.make("GetConfig", {
    success: HomeAssistantConfig,
    error: HomeAssistantError,
  }),
  Rpc.make("CameraSnapshot", {
    payload: EntityPayload,
    success: CameraSnapshot,
    error: HomeAssistantError,
  }),
) {}
