import { describe, expect, test } from "bun:test";
import { parseInputNumberValue } from "./inputNumber.js";

describe("parseInputNumberValue", () => {
  test("accepts finite numbers", () => {
    for (const value of ["0", "23.8", "36", "-1.5"]) {
      expect(parseInputNumberValue(value)).toBe(Number(value));
    }
  });

  test("rejects anything else", () => {
    for (const value of ["", "off", "NaN", "+Inf", " 1"]) {
      expect(parseInputNumberValue(value)).toBeUndefined();
    }
  });
});
