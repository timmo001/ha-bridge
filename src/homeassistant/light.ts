import { Option, type Schema } from "effect";
import { parseInputNumberValue } from "./inputNumber.js";

const listFields = new Set([
  "hs_color",
  "rgb_color",
  "rgbw_color",
  "rgbww_color",
  "xy_color",
]);

const textFields = new Set(["flash", "profile", "color_name", "effect"]);

const numberOrText = (value: string) => parseInputNumberValue(value) ?? value;

const parseField = (key: string, value: string): Schema.Json => {
  if (listFields.has(key)) {
    return value.split(",").map(numberOrText);
  }

  if (key === "white") {
    return value === "true" ? true : numberOrText(value);
  }

  return textFields.has(key) ? value : numberOrText(value);
};

// Turns light flags into action data. Values that don't parse are kept as
// text so the light data schemas report them.
export const lightData = (
  flags: Readonly<Record<string, Option.Option<string>>>,
) => {
  const data: Record<string, Schema.Json> = {};

  for (const [key, value] of Object.entries(flags)) {
    if (Option.isSome(value)) {
      data[key] = parseField(key, value.value);
    }
  }

  return data;
};
