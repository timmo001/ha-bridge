import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";
import { BridgeRpcs } from "@timmo001/effect-ha-bridge";
import { Dashboard, PanelError, PanelState, Settings } from "./Panel.js";

// What the panel saves: its dashboards and settings.
export class PanelStoreRpcs extends RpcGroup.make(
  // The saved dashboards and settings, then each change from any browser.
  Rpc.make("WatchPanel", {
    success: PanelState,
    stream: true,
  }),
  // Adds the dashboard, or replaces the one with its ID.
  Rpc.make("SaveDashboard", {
    payload: Dashboard,
    error: PanelError,
  }),
  Rpc.make("DeleteDashboard", {
    payload: { id: Schema.String },
    error: PanelError,
  }),
  // Puts the dashboards in this order. Every dashboard must be named once.
  Rpc.make("OrderDashboards", {
    payload: { ids: Schema.Array(Schema.String) },
    error: PanelError,
  }),
  Rpc.make("SaveSettings", {
    payload: Settings,
    error: PanelError,
  }),
) {}

// The bridge operations the panel's browser can reach. Logs, automation
// configs, events and triggers stay on the socket.
export const PanelBridgeRpcs = BridgeRpcs.omit(
  "CameraSnapshot",
  "RenderTemplate",
  "WatchEvents",
  "FireEvent",
  "GetLogbook",
  "WatchLogbook",
  "WatchTrigger",
  "TestCondition",
  "WatchCondition",
  "GetSystemLog",
  "WatchSystemLog",
  "GetLog",
  "WatchLog",
  "GetLogBoots",
  "GetLogApps",
  "SearchLogs",
  "GetEntityConfig",
  "CreateEntityConfig",
  "UpdateEntityConfig",
  "DeleteEntityConfig",
  "ValidateEntityConfig",
);

export const PanelRpcs = PanelBridgeRpcs.merge(PanelStoreRpcs);
