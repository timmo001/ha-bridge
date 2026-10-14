import { describe, expect, test } from "bun:test";
import {
  configParts,
  configReferences,
  unknownReferences,
} from "./references.js";

describe("configReferences", () => {
  test("finds what the steps name, but not templates or disabled steps", () => {
    expect(
      configReferences({
        triggers: [
          { trigger: "state", entity_id: "binary_sensor.door" },
          { trigger: "zone", zone: "zone.home", entity_id: "person.me" },
        ],
        actions: [
          {
            action: "light.turn_on",
            target: { entity_id: "light.a, light.b", area_id: "office" },
          },
          { action: "notify.phone", data: { entity_id: "sensor.c" } },
          { action: "light.turn_off", entity_id: "{{ which }}" },
          { action: "switch.toggle", entity_id: "switch.x", enabled: false },
        ],
      }),
    ).toEqual([
      { kind: "entity", id: "binary_sensor.door" },
      { kind: "entity", id: "zone.home" },
      { kind: "entity", id: "person.me" },
      { kind: "action", id: "light.turn_on" },
      { kind: "entity", id: "light.a" },
      { kind: "entity", id: "light.b" },
      { kind: "area", id: "office" },
      { kind: "action", id: "notify.phone" },
      { kind: "entity", id: "sensor.c" },
      { kind: "action", id: "light.turn_off" },
    ]);
  });

  test("leaves event data, variables and nested action data alone", () => {
    expect(
      configReferences({
        triggers: [
          {
            trigger: "event",
            event_data: { action: "door.open", entity_id: "light.fake" },
          },
        ],
        variables: { entity_id: "light.var" },
        actions: [
          {
            action: "notify.phone",
            data: { data: { actions: [{ action: "x.y" }] } },
          },
        ],
      }),
    ).toEqual([{ kind: "action", id: "notify.phone" }]);
  });
});

describe("unknownReferences", () => {
  test("skips kinds it can't check and entities made at runtime", () => {
    expect(
      unknownReferences(
        [
          { kind: "entity", id: "light.gone" },
          { kind: "entity", id: "light.here" },
          { kind: "entity", id: "group.made_later" },
          { kind: "area", id: "nowhere" },
        ],
        { entity: new Set(["light.here"]) },
      ),
    ).toEqual([{ kind: "entity", id: "light.gone" }]);
  });
});

describe("configParts", () => {
  test("takes an automation's singular keys and reports missing parts", () => {
    expect(configParts("automation", { trigger: [], condition: [] })).toEqual({
      present: { triggers: [], conditions: [] },
      missing: ["actions"],
    });
  });

  test("checks a script's sequence as its actions", () => {
    expect(configParts("script", { sequence: [] })).toEqual({
      present: { actions: [] },
      missing: [],
    });
  });
});
