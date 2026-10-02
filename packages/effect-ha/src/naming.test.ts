import { describe, expect, test } from "bun:test";
import { displayName, entityNamerFrom } from "./naming.js";

const namer = entityNamerFrom(
  {
    entities: [
      { ei: "light.office", di: "office", en: null },
      {
        ei: "sensor.office_temperature",
        di: "office",
        en: "Office temperature",
      },
      { ei: "switch.fan", di: "fan", en: "Fan" },
      { ei: "sensor.brand", di: "office", en: "Office Philips level" },
      { ei: "sensor.loose", en: "Loose sensor" },
      { ei: "switch.outlet", di: "outlet", en: "Power" },
    ],
  },
  [
    { id: "office", name: "Office" },
    { id: "fan", name: "Fan", name_by_user: "Desk fan" },
    { id: "strip", name: "Power strip" },
    { id: "outlet", name: "Outlet 1", parent_device_id: "strip" },
  ],
);

describe("displayName", () => {
  test("falls back without registry data", () => {
    expect(displayName(undefined, "light.office", "Friendly")).toBe("Friendly");
    expect(displayName(namer, "light.unknown", "Friendly")).toBe("Friendly");
  });

  test("uses the device name for the main entity", () => {
    expect(displayName(namer, "light.office", "x")).toBe("Office");
  });

  test("strips the device prefix and capitalises", () => {
    expect(displayName(namer, "sensor.office_temperature", "x")).toBe(
      "Office Temperature",
    );
  });

  test("keeps casing when the first word has capitals", () => {
    expect(displayName(namer, "sensor.brand", "x")).toBe(
      "Office Philips level",
    );
  });

  test("prefers the user's device name", () => {
    expect(displayName(namer, "switch.fan", "x")).toBe("Desk fan Fan");
  });

  test("uses the entity name without a device", () => {
    expect(displayName(namer, "sensor.loose", "x")).toBe("Loose sensor");
  });

  test("puts a child device's parent first", () => {
    expect(displayName(namer, "switch.outlet", "x")).toBe(
      "Power strip Outlet 1 Power",
    );
  });
});
