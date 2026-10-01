import { Rpc, RpcGroup } from "effect/rpc";
import { Schema } from "effect";
import {
  Action,
  CameraSnapshot,
  HomeAssistantConfig,
  HomeAssistantError,
} from "@timmo001/effect-ha";
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
    payload: {
      entityId: Schema.TemplateLiteral(["camera.", Schema.String]),
    },
    success: CameraSnapshot,
    error: HomeAssistantError,
  }),
) {}
