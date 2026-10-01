import { describe, expect, test } from "bun:test";
import { parseAnswerOptions } from "./assistSatellite.js";

describe("parseAnswerOptions", () => {
  test("splits the ID from comma-separated sentences", () => {
    expect(parseAnswerOptions(["rock=rock, play {genre}", "no=no"])).toEqual([
      { id: "rock", sentences: ["rock", "play {genre}"] },
      { id: "no", sentences: ["no"] },
    ]);
  });

  test("rejects answers without an ID", () => {
    for (const value of ["rock", "=rock"]) {
      expect(parseAnswerOptions(["no=no", value])).toBeUndefined();
    }
  });
});
