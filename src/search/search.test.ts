import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { entityNamerFrom, type EntityState } from "@timmo001/effect-ha";
import type { SearchRequest } from "@timmo001/effect-ha-bridge";
import { matchesFilters, searchItems, searchKeys } from "./items.js";
import {
  unavailableRegistries,
  type Registries,
} from "../homeassistant/registries.js";
import { Search, selectResults } from "./Search.js";

const entities = {
  entities: [
    { ei: "switch.outlet", di: "outlet", en: "Power" },
    { ei: "light.lamp", di: "plug", ai: "office", en: "Lamp" },
  ],
};

const devices = [
  { id: "strip", name: "Power strip", area_id: "kitchen" },
  { id: "outlet", name: "Outlet 1", parent_device_id: "strip" },
  { id: "plug", name: "Kitchen plug", area_id: "kitchen" },
  { id: "old", name: "Old plug", disabled_by: "user" },
];

const registries: Registries = {
  entities,
  devices,
  areas: [
    { area_id: "kitchen", name: "Kitchen", floor_id: "ground" },
    { area_id: "office", name: "Office" },
  ],
  floors: [{ floor_id: "ground", name: "Ground floor" }],
  labels: [],
  namer: entityNamerFrom(entities, devices),
};

const states: Array<EntityState> = [
  {
    entity_id: "switch.outlet",
    state: "on",
    attributes: { friendly_name: "Outlet power", device_class: "outlet" },
  },
  {
    entity_id: "light.lamp",
    state: "off",
    attributes: { friendly_name: "Kitchen plug Lamp" },
  },
  { entity_id: "sensor.loose", state: "1" },
];

const items = searchItems(states, registries);

const byId = (id: string) => items.find((item) => item.id === id);

const filtered = (request: Omit<SearchRequest, "query">) =>
  items
    .filter(matchesFilters({ query: "x", ...request }))
    .map((item) => item.id);

describe("searchItems", () => {
  test("names entities like dashboards and keeps every part", () => {
    expect(byId("switch.outlet")).toMatchObject({
      name: "Power strip Outlet 1 Power",
      ownName: "Power",
      device: "Outlet 1",
      parentDevice: "Power strip",
    });
  });

  test("gives a child device its parent's area", () => {
    expect(byId("switch.outlet")).toMatchObject({
      area: "Kitchen",
      floor: "Ground floor",
    });
    expect(byId("outlet")).toMatchObject({ area: "Kitchen" });
  });

  test("prefers an entity's own area over its device's", () => {
    expect(byId("light.lamp")).toMatchObject({ area: "Office" });
  });

  test("falls back to the entity ID without a registry entry or name", () => {
    expect(byId("sensor.loose")).toMatchObject({ name: "sensor.loose" });
  });

  test("leaves out disabled devices", () => {
    expect(byId("old")).toBeUndefined();
  });
});

describe("matchesFilters", () => {
  test("matches devices and areas through their entities", () => {
    expect(filtered({ domain: "switch" })).toEqual([
      "switch.outlet",
      "outlet",
      "kitchen",
    ]);
    expect(filtered({ deviceClass: "outlet", kinds: ["device"] })).toEqual([
      "outlet",
    ]);
  });

  test("matches an area by name or ID", () => {
    expect(filtered({ area: "kitchen", kinds: ["area", "device"] })).toEqual([
      "strip",
      "outlet",
      "plug",
      "kitchen",
    ]);
    expect(filtered({ area: "Office" })).toEqual(["light.lamp", "office"]);
  });
});

test("lists registries that failed to load", () => {
  expect(
    unavailableRegistries({
      ...registries,
      areas: undefined,
      floors: undefined,
    }),
  ).toEqual(["area_registry", "floor_registry"]);
});

describe("Search", () => {
  const run = (query: string, limit?: number, offset?: number) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const search = yield* Search;

        return yield* search.fuzzy({
          items: items.filter((item) => item.kind === "entity"),
          query,
          keys: searchKeys.entity,
          primary: (item) => item.name,
          overrides: { limit, offset },
        });
      }).pipe(Effect.provide(Search.layer)),
    );

  test("matches terms across fields with a typo", async () => {
    const { results } = await run("kitchn outlet");

    expect(results[0]?.item.id).toBe("switch.outlet");
  });

  test("ranks a name match above an area-only match", async () => {
    const { results } = await run("kitchen");

    expect(results.map(({ item }) => item.id)).toEqual([
      "light.lamp",
      "switch.outlet",
    ]);
  });
});

test("selectResults pages through results and keeps the total", () => {
  const scored = [90, 80, 70, 10].map((score) => ({
    item: `item ${score}`,
    score,
    matched: [],
  }));

  expect(
    selectResults(scored, (item) => item, { limit: 1, offset: 1 }),
  ).toEqual({ results: [scored[1]], total: 3 });
});
