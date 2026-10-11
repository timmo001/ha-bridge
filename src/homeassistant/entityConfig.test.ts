import { describe, expect, test } from "bun:test";
import { configSlug } from "./entityConfig.js";

describe("configSlug", () => {
  test("makes a script key from an alias", () => {
    expect(configSlug("Lights - Office")).toBe("lights_office");
  });

  test("drops accents and trims separators", () => {
    expect(configSlug("  Café  Lights! ")).toBe("cafe_lights");
  });
});
