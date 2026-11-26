import { describe, expect, test } from "bun:test";
import {
  movingMemoryMillis,
  nextValue,
  startValue,
  stepMemoryMillis,
  stepSpecs,
} from "./stepValue.js";

describe("nextValue", () => {
  const percent = { min: 0, max: 100 };

  test("keeps the result within the range", () => {
    expect(
      nextValue({
        start: 97,
        step: 5,
        direction: "increase",
        range: percent,
        whole: true,
      }),
    ).toBe(100);
    expect(
      nextValue({
        start: 3,
        step: 5,
        direction: "decrease",
        range: percent,
        whole: true,
      }),
    ).toBe(0);
  });

  test("rounds away floating point noise", () => {
    expect(
      nextValue({
        start: 0.1,
        step: 0.2,
        direction: "increase",
        range: { min: 0, max: 1 },
        whole: false,
      }),
    ).toBe(0.3);
    expect(
      nextValue({
        start: 20.25,
        step: 0.5,
        direction: "decrease",
        range: { min: 7, max: 35 },
        whole: false,
      }),
    ).toBe(19.75);
  });

  test("sends whole numbers where Home Assistant needs them", () => {
    expect(
      nextValue({
        start: 50.19,
        step: 10,
        direction: "increase",
        range: percent,
        whole: true,
      }),
    ).toBe(60);
  });
});

describe("startValue", () => {
  const remembered = { value: 40, at: 1_000 };

  test("builds on the last step while it's recent", () => {
    expect(
      startValue(30, remembered, 1_000 + stepMemoryMillis - 1, false),
    ).toBe(40);
  });

  test("goes back to the reported value once the step is old", () => {
    expect(startValue(30, remembered, 1_000 + stepMemoryMillis, false)).toBe(
      30,
    );
  });

  test("keeps building on it while the entity is still moving", () => {
    expect(startValue(30, remembered, 1_000 + stepMemoryMillis, true)).toBe(40);
    expect(startValue(30, remembered, 1_000 + movingMemoryMillis, true)).toBe(
      30,
    );
  });
});

describe("light brightness", () => {
  const { current } = stepSpecs["light.brightness"];
  const dimmable = { supported_color_modes: ["brightness"] };

  test("is 0 while the light is off", () => {
    expect(
      current({ entity_id: "light.desk", state: "off", attributes: dimmable }),
    ).toBe(0);
  });

  test("is a percentage of 255", () => {
    expect(
      current({
        entity_id: "light.desk",
        state: "on",
        attributes: { ...dimmable, brightness: 255 },
      }),
    ).toBe(100);
  });

  test("is missing for a light that only turns on and off", () => {
    expect(
      current({
        entity_id: "light.desk",
        state: "on",
        attributes: { supported_color_modes: ["onoff"] },
      }),
    ).toBeUndefined();
  });
});
