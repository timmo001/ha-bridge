import type { Action } from "@timmo001/effect-ha";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { Context, Effect, Layer, Predicate, Schedule, Stream } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";
import { RpcClient, RpcSerialization } from "effect/rpc";
import type { RpcClientError } from "effect/rpc/RpcClientError";
import { Socket } from "effect/socket";
import {
  type Dashboard,
  defaultSettings,
  type PanelState,
  type Settings,
} from "../../src/panel/Panel.js";
import { PanelRpcs } from "../../src/panel/Rpcs.js";
import { registry } from "./AtomController.js";

// The panel's RPC socket, next to the page so it works under a path prefix.
const socketUrl = () => {
  const url = new URL("rpc", document.baseURI);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return url.href;
};

// Whether the socket to the panel is open. Starts true, so the page doesn't
// flash a warning while it first connects.
export const connected = Atom.make(true).pipe(Atom.keepAlive);

const connectionHooks = Layer.succeed(RpcClient.ConnectionHooks, {
  onConnect: Effect.sync(() => registry.set(connected, true)),
  onDisconnect: Effect.sync(() => registry.set(connected, false)),
});

export class PanelClient extends Context.Service<
  PanelClient,
  RpcClient.FromGroup<typeof PanelRpcs, RpcClientError>
>()("PanelClient") {
  static readonly layer = Layer.effect(
    PanelClient,
    RpcClient.make(PanelRpcs),
  ).pipe(
    Layer.provide(
      RpcClient.layerProtocolSocket({
        pingInterval: "5 seconds",
        pingTimeout: "15 seconds",
        retryTransientErrors: true,
      }),
    ),
    Layer.provide(connectionHooks),
    Layer.provide(RpcSerialization.layerJson),
    Layer.provide(Socket.layerWebSocket(socketUrl())),
    Layer.provide(Socket.layerWebSocketConstructorGlobal),
  );
}

const runtime = Atom.runtime(PanelClient.layer);

// One of the client's streams, opened when the atom is first read. A watch
// ends when the socket drops or the panel restarts: failing, or interrupted
// by the server shutting down. Whichever it is, it opens again two seconds
// later, and the atom keeps its last value meanwhile, so tiles don't blank
// out while the panel reconnects.
const watch = <A, E>(
  open: (client: PanelClient["Service"]) => Stream.Stream<A, E>,
) =>
  Stream.unwrap(PanelClient.use((client) => Effect.succeed(open(client)))).pipe(
    Stream.catchCause(() => Stream.empty),
    Stream.repeat(Schedule.spaced("2 seconds")),
  );

// The saved dashboards and settings, kept current from every browser.
export const panel = runtime
  .atom(watch((client) => client.WatchPanel()))
  .pipe(Atom.keepAlive);

export const settings = Atom.make((get): Settings => {
  const result = get(panel);

  return AsyncResult.isSuccess(result)
    ? result.value.settings
    : defaultSettings;
});

export const dashboards = Atom.make(
  (get): ReadonlyArray<Dashboard> | undefined => {
    const result = get(panel);

    return AsyncResult.isSuccess(result) ? result.value.dashboards : undefined;
  },
);

export type EntityMap = ReadonlyMap<string, EntityUpdate>;

// One entity's latest update. Each has its own watch, so an entity that's
// gone or failing never holds up the others.
export const entity = Atom.family((entityId: string) =>
  runtime.atom(
    watch((client) =>
      client.WatchEntities({ target: { entity_id: entityId } }),
    ),
  ),
);

// The latest update for each entity, keyed by the entity IDs joined with
// commas. Entities still loading, or failing, are left out.
export const entities = Atom.family((key: string) =>
  Atom.make(
    (get): EntityMap =>
      new Map(
        key === ""
          ? []
          : key.split(",").flatMap((entityId) => {
              const result = get(entity(entityId));

              return AsyncResult.isSuccess(result)
                ? [[entityId, result.value] as const]
                : [];
            }),
      ),
  ),
);

// Every entity, for picking one.
export const allEntities = runtime.atom(
  PanelClient.use((client) =>
    client.GetEntities({ target: { entity_id: "all" } }),
  ),
);

// A template's latest render, as text.
export const template = Atom.family((source: string) =>
  runtime.atom(
    watch((client) => client.WatchTemplate({ template: source })).pipe(
      Stream.map((update) =>
        "result" in update
          ? {
              text: Predicate.isString(update.result)
                ? update.result
                : JSON.stringify(update.result),
            }
          : { error: update.error },
      ),
    ),
  ),
);

export interface HistoryPoint {
  readonly time: number;
  readonly value: number;
}

// A numeric entity's states over the last hours, refreshed every five
// minutes. The key is the entity ID and the hours, joined with a bar.
export const history = Atom.family((key: string) => {
  const [entityId = "", hours = "24"] = key.split("|");

  return runtime.atom(
    Stream.fromEffectSchedule(
      PanelClient.use((client) =>
        client.GetHistory({
          target: { entity_id: entityId },
          start_time: new Date(
            Date.now() - Number(hours) * 3_600_000,
          ).toISOString(),
          no_attributes: true,
        }),
      ).pipe(
        Effect.map((states): ReadonlyArray<HistoryPoint> =>
          (states[entityId] ?? []).flatMap((state) => {
            const value = Number.parseFloat(state.state);

            return Number.isFinite(value)
              ? [{ time: Date.parse(state.last_changed), value }]
              : [];
          }),
        ),
        // Waits out the panel restarting rather than showing an error.
        Effect.retry(Schedule.spaced("5 seconds")),
      ),
      Schedule.spaced("5 minutes"),
    ),
  );
});

// Mutations stay mounted, so one set from an event handler runs to the end.
export const callAction = runtime
  .fn(
    (action: Action) => PanelClient.use((client) => client.CallAction(action)),
    { concurrent: true },
  )
  .pipe(Atom.keepAlive);

export const saveDashboard = runtime
  .fn(
    (dashboard: Dashboard) =>
      PanelClient.use((client) => client.SaveDashboard(dashboard)),
    { concurrent: true },
  )
  .pipe(Atom.keepAlive);

export const deleteDashboard = runtime
  .fn(
    (id: string) => PanelClient.use((client) => client.DeleteDashboard({ id })),
    { concurrent: true },
  )
  .pipe(Atom.keepAlive);

export const orderDashboards = runtime
  .fn(
    (ids: ReadonlyArray<string>) =>
      PanelClient.use((client) => client.OrderDashboards({ ids })),
    { concurrent: true },
  )
  .pipe(Atom.keepAlive);

export const saveSettings = runtime
  .fn(
    (next: Settings) => PanelClient.use((client) => client.SaveSettings(next)),
    { concurrent: true },
  )
  .pipe(Atom.keepAlive);

export type { PanelState };
