import { describe, expect, test } from "bun:test";
import { Effect, Exit } from "effect";
import type { EntityState, Target } from "@timmo001/effect-ha";
import { emptyRegistries, type Registries } from "./registries.js";
import { resolveTarget } from "./target.js";

const registries: Registries = {
  ...emptyRegistries,
  areas: [
    { area_id: "kitchen", name: "Kitchen" },
    { area_id: "kitchen_2", name: "Kitchen" },
    { area_id: "office", name: "Office" },
  ],
  labels: [{ label_id: "lights", name: "Evening lights" }],
};

const states = new Map<string, EntityState>(
  [
    {
      entity_id: "light.desk",
      state: "on",
      attributes: { friendly_name: "Desk" },
    },
    {
      entity_id: "switch.desk",
      state: "on",
      attributes: { friendly_name: "Desk" },
    },
  ].map((state) => [state.entity_id, state]),
);

const resolve = (target: Target, domain?: string) =>
  Effect.runSyncExit(resolveTarget(target, { registries, states, domain }));

describe("resolveTarget", () => {
  test("keeps IDs and resolves names case-insensitively", () => {
    expect(
      resolve({ area_id: ["office"], label_id: "evening LIGHTS" }),
    ).toEqual(Exit.succeed({ area_id: ["office"], label_id: ["lights"] }));
  });

  test("fails when a name matches more than one", () => {
    expect(resolve({ area_id: "kitchen" })).toEqual(
      Exit.succeed({ area_id: ["kitchen"] }),
    );
    expect(Exit.isFailure(resolve({ area_id: "KITCHEN" }))).toBe(true);
  });

  test("scopes entity object IDs and names to the domain", () => {
    expect(resolve({ entity_id: ["desk"] }, "light")).toEqual(
      Exit.succeed({ entity_id: ["light.desk"] }),
    );
    expect(resolve({ entity_id: ["Desk"] }, "switch")).toEqual(
      Exit.succeed({ entity_id: ["switch.desk"] }),
    );
    expect(Exit.isFailure(resolve({ entity_id: ["Desk"] }))).toBe(true);
  });

  test("passes through all, unknown entity IDs and unloaded registries", () => {
    expect(
      resolve({ entity_id: ["all", "light.hidden"], device_id: ["Hall"] }),
    ).toEqual(
      Exit.succeed({
        entity_id: ["all", "light.hidden"],
        device_id: ["Hall"],
      }),
    );
  });
});
