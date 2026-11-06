import { describe, expect, test } from "bun:test";
import { toTarget, type TargetInput } from "./target.js";

const input = (overrides: Partial<TargetInput> = {}): TargetInput => ({
  entities: [],
  entity: [],
  device: [],
  area: [],
  floor: [],
  label: [],
  excludeEntity: [],
  excludeDevice: [],
  excludeArea: [],
  excludeFloor: [],
  excludeLabel: [],
  ...overrides,
});

describe("toTarget", () => {
  test("prefixes a positional entity id that has no domain", () => {
    expect(toTarget("light", input({ entities: ["desk"] }))).toEqual({
      entity_id: ["light.desk"],
    });
  });

  test("keeps an excluded name so it can be resolved", () => {
    expect(
      toTarget("light", input({ area: ["house"], excludeEntity: ["Nursery"] })),
    ).toEqual({
      area_id: ["house"],
      exclude: { entity_id: ["Nursery"] },
    });
  });

  test("keeps an excluded object id for the resolver to prefix", () => {
    expect(toTarget("light", input({ excludeEntity: ["desk"] }))).toEqual({
      exclude: { entity_id: ["desk"] },
    });
  });
});
