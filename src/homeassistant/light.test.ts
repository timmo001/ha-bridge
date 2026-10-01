import { describe, expect, test } from "bun:test";
import { Option } from "effect";
import { lightData } from "./light.js";

describe("lightData", () => {
  test("parses numbers, colour lists and white", () => {
    expect(
      lightData({
        brightness_step: Option.some("-20"),
        rgb_color: Option.some("255,100,100"),
        white: Option.some("true"),
        effect: Option.some("1"),
        flash: Option.none(),
      }),
    ).toEqual({
      brightness_step: -20,
      rgb_color: [255, 100, 100],
      white: true,
      effect: "1",
    });
  });

  test("keeps values that don't parse as text", () => {
    expect(
      lightData({
        brightness: Option.some("bright"),
        xy_color: Option.some("0.5,x"),
      }),
    ).toEqual({ brightness: "bright", xy_color: [0.5, "x"] });
  });
});
