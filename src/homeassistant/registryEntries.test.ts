import { describe, expect, test } from "bun:test";
import {
  defaultCategoryScope,
  entityRegistryEntry,
  nextLabels,
  registryNames,
  sameLabels,
} from "./registryEntries.js";

describe("nextLabels", () => {
  test("keeps the labels it isn't told to change", () => {
    expect(nextLabels(["kitchen", "lighting"], ["morning"], [])).toEqual([
      "kitchen",
      "lighting",
      "morning",
    ]);
  });

  test("removes only the labels named", () => {
    expect(nextLabels(["kitchen", "lighting"], [], ["lighting"])).toEqual([
      "kitchen",
    ]);
  });

  test("doesn't add a label twice", () => {
    expect(nextLabels(["kitchen"], ["kitchen"], [])).toEqual(["kitchen"]);
  });
});

test("sameLabels ignores order", () => {
  expect(sameLabels(["a", "b"], ["b", "a"])).toBe(true);
  expect(sameLabels(["a"], ["a", "b"])).toBe(false);
});

test("defaultCategoryScope only covers domains with their own page", () => {
  expect(defaultCategoryScope("automation.morning")).toBe("automation");
  expect(defaultCategoryScope("scene.evening")).toBe("scene");
  expect(defaultCategoryScope("input_boolean.guest")).toBeUndefined();
});

test("entityRegistryEntry names its labels, area and categories", () => {
  const names = registryNames(
    [
      {
        label_id: "lighting",
        name: "Lighting",
        icon: null,
        color: null,
        description: null,
      },
    ],
    [{ area_id: "kitchen", name: "Kitchen", labels: [] }],
    [["automation", [{ category_id: "01J", name: "Lights", icon: null }]]],
  );

  expect(
    entityRegistryEntry(
      {
        entity_id: "automation.morning",
        name: null,
        original_name: "Morning",
        device_id: null,
        area_id: "kitchen",
        labels: ["lighting", "gone"],
        categories: { automation: "01J" },
      },
      names,
    ),
  ).toEqual({
    kind: "entity",
    id: "automation.morning",
    name: "Morning",
    area: { area_id: "kitchen", name: "Kitchen" },
    device_id: null,
    labels: [
      { label_id: "lighting", name: "Lighting" },
      { label_id: "gone", name: null },
    ],
    categories: [{ scope: "automation", category_id: "01J", name: "Lights" }],
  });
});
