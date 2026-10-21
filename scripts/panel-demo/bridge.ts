import { BunSocketServer } from "@effect/platform-bun";
import type { Target } from "@timmo001/effect-ha";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import {
  Effect,
  FileSystem,
  Layer,
  Predicate,
  PubSub,
  type Schema,
  Stream,
} from "effect";
import { RpcSerialization, RpcServer } from "effect/rpc";
import { PanelBridgeRpcs } from "../../src/panel/Rpcs.js";
import { entityUpdates } from "./fixtures.js";

type Attributes = Readonly<Record<string, Schema.Json>>;

const idsOf = (target: Target) => {
  const value = target.entity_id;

  return value === undefined ? [] : Predicate.isString(value) ? [value] : value;
};

// Varies a value over the last day, as a sensor might.
const historyFor = (update: EntityUpdate, now: number) => {
  const base = Number(update.state.state);

  return Array.from({ length: 96 }, (_, index) => {
    const time = new Date(now - (96 - index) * 15 * 60_000).toISOString();
    const wave = Math.sin(index / 9) * 0.25 + Math.sin(index / 3.1) * 0.06;

    return {
      state: (base * (1 + wave)).toFixed(2),
      last_changed: time,
      last_updated: time,
    };
  });
};

// A stand-in for `ha-bridge serve` that answers the panel's bridge calls from
// fixtures, so the panel can be run, demonstrated and screenshotted without
// Home Assistant. Actions change the fixtures, so tiles respond.
const Handlers = PanelBridgeRpcs.toLayer(
  Effect.gen(function* () {
    const now = Date.now();

    const states = new Map(
      entityUpdates(now).map((update) => [update.state.entity_id, update]),
    );

    const changes = yield* PubSub.unbounded<EntityUpdate>();

    const matching = (target: Target) => {
      const wanted = idsOf(target);

      return wanted.includes("all")
        ? [...states.values()]
        : wanted.flatMap((id) => states.get(id) ?? []);
    };

    const set = (
      entityId: string,
      state: string,
      attributes: Attributes = {},
    ) => {
      const current = states.get(entityId);

      if (current === undefined) {
        return Effect.void;
      }

      const changed = new Date().toISOString();

      const next: EntityUpdate = {
        ...current,
        state: {
          ...current.state,
          state,
          attributes: { ...current.state.attributes, ...attributes },
          last_changed: changed,
          last_updated: changed,
        },
      };

      states.set(entityId, next);

      return PubSub.publish(changes, next);
    };

    const number = (data: Attributes, name: string) => {
      const value = data[name];

      return Predicate.isNumber(value) ? value : undefined;
    };

    const act = (action: string, entityId: string, data: Attributes) => {
      const current = states.get(entityId)?.state.state;
      const brightness = number(data, "brightness_pct");
      const kelvin = number(data, "color_temp_kelvin");

      switch (action) {
        case "homeassistant.toggle":
          return current === "on"
            ? set(entityId, "off")
            : set(entityId, "on", { brightness: 200 });
        case "light.turn_on": {
          const attributes: Record<string, Schema.Json> = {};

          if (brightness !== undefined) {
            attributes.brightness = Math.round(brightness * 2.55);
          }

          if (kelvin !== undefined) {
            attributes.color_temp_kelvin = kelvin;
          }

          return set(entityId, "on", attributes);
        }

        case "light.turn_off":
          return set(entityId, "off");
        case "lock.lock":
          return set(entityId, "locked");
        case "lock.unlock":
          return set(entityId, "unlocked");
        case "cover.toggle":
          return current === "open"
            ? set(entityId, "closed", { current_position: 0 })
            : set(entityId, "open", { current_position: 100 });
        case "cover.open_cover":
          return set(entityId, "open", { current_position: 100 });
        case "cover.close_cover":
          return set(entityId, "closed", { current_position: 0 });
        case "cover.set_cover_position": {
          const position = number(data, "position") ?? 0;

          return set(entityId, position === 0 ? "closed" : "open", {
            current_position: position,
          });
        }

        case "media_player.media_play_pause":
          return set(entityId, current === "playing" ? "paused" : "playing");
        case "media_player.volume_set":
          return set(entityId, current ?? "idle", {
            volume_level: number(data, "volume_level") ?? 0,
          });
        case "climate.set_temperature":
          return set(entityId, current ?? "heat", {
            temperature: number(data, "temperature") ?? 20,
          });
        case "climate.set_hvac_mode": {
          const mode = data.hvac_mode;

          return set(entityId, Predicate.isString(mode) ? mode : "off");
        }

        case "fan.set_percentage":
          return set(entityId, "on", {
            percentage: number(data, "percentage") ?? 0,
          });
        case "vacuum.start":
          return set(entityId, "cleaning");
        case "vacuum.return_to_base":
          return set(entityId, "returning");
        default:
          return Effect.void;
      }
    };

    return PanelBridgeRpcs.of({
      GetEntities: ({ target }) => Effect.succeed(matching(target)),
      WatchEntities: ({ target }) => {
        const wanted = new Set(idsOf(target));

        return Stream.concat(
          Stream.fromIterable(matching(target)),
          Stream.fromPubSub(changes).pipe(
            Stream.filter((update) => wanted.has(update.state.entity_id)),
          ),
        );
      },
      CallAction: (action) =>
        Effect.forEach(
          action.target === undefined ? [] : idsOf(action.target),
          (entityId) => act(action.action, entityId, action.data ?? {}),
          { discard: true },
        ).pipe(
          Effect.andThen(Effect.logInfo("Demo action", action.action)),
          Effect.as(null),
        ),
      GetConfig: () =>
        Effect.succeed({
          location_name: "Home",
          time_zone: "Europe/London",
          language: "en",
          country: "GB",
          currency: "GBP",
          version: "2026.10.1",
          unit_system: { temperature: "°C" },
        }),
      // Only `states('entity_id')` is filled in, which the demo's notes use.
      WatchTemplate: ({ template }) =>
        Stream.make({
          result: template.replace(
            /\{\{\s*states\('([^']+)'\)\s*\}\}/g,
            (_, id: string) => states.get(id)?.state.state ?? "unknown",
          ),
        }),
      GetHistory: ({ target }) =>
        Effect.succeed(
          Object.fromEntries(
            matching(target).map((update) => [
              update.state.entity_id,
              historyFor(update, now),
            ]),
          ),
        ),
      Search: () => Effect.succeed({ results: [], total: 0, unavailable: [] }),
    });
  }),
);

// The demo bridge, listening on `socketPath`. A socket left by an earlier
// run is removed first.
export const layer = (socketPath: string) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      yield* fs.remove(socketPath, { force: true });

      return RpcServer.layer(PanelBridgeRpcs).pipe(
        Layer.provide(Handlers),
        Layer.provide(RpcServer.layerProtocolSocketServer),
        Layer.provide(RpcSerialization.layerNdjson),
        Layer.provide(BunSocketServer.layer({ path: socketPath })),
      );
    }),
  );
