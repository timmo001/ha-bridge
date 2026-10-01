import { describe, expect, test } from "bun:test";
import { stateWithUnit, type EntityState } from "@timmo001/effect-ha-bridge";
import {
  climateStateText,
  coverStateText,
  entityBar,
  stateTextBar,
} from "./output.js";

const noOptions = {
  icon: "",
  textOn: "",
  textOff: "",
  tooltipOn: "",
  tooltipOff: "",
  classOn: "",
  classOff: "",
};

const temperature: EntityState = {
  entity_id: "sensor.office_temperature",
  state: "23.3",
  attributes: { unit_of_measurement: "°C" },
};

describe("stateWithUnit", () => {
  test("appends the unit", () => {
    expect(stateWithUnit(temperature)).toBe("23.3 °C");
  });

  test("falls back to the raw state", () => {
    expect(stateWithUnit({ entity_id: "sun.sun", state: "above" })).toBe(
      "above",
    );
  });
});

describe("bar JSON", () => {
  test("keeps Go Automate's key order and includes the unit", () => {
    expect(entityBar(temperature, "Temperature", noOptions)).toBe(
      `{"class":"23.3","name":"Temperature","text":"23.3 °C","tooltip":"23.3 °C"}`,
    );
  });

  test("omits an empty name and applies on options", () => {
    const light: EntityState = { entity_id: "light.office", state: "on" };

    expect(
      entityBar(light, "", {
        ...noOptions,
        icon: "X",
        textOn: "lit",
        tooltipOn: "Office on",
        classOn: "bright",
      }),
    ).toBe(`{"class":"bright","text":"X lit","tooltip":"Office on"}`);
  });

  test("uses state text for text and tooltip", () => {
    const curtain: EntityState = { entity_id: "cover.curtain", state: "open" };

    expect(stateTextBar(curtain, "Curtains", coverStateText)).toBe(
      `{"class":"open","name":"Curtains","text":"open","tooltip":"open"}`,
    );
  });
});

describe("climateStateText", () => {
  const climate: EntityState = {
    entity_id: "climate.office",
    state: "cool",
    attributes: { fan_mode: "1", temperature: 23.8 },
  };

  test("formats mode, fan and temperature", () => {
    expect(climateStateText(climate)).toBe("Cool • Low • 23.8 °C");
  });

  test("reports unavailable", () => {
    expect(climateStateText({ ...climate, state: "unavailable" })).toBe(
      "unavailable",
    );
  });
});

describe("coverStateText", () => {
  const cover: EntityState = {
    entity_id: "cover.blind",
    state: "open",
    attributes: { current_tilt_position: 80 },
  };

  test("includes the tilt position", () => {
    expect(coverStateText(cover)).toBe("open • 80%");
  });

  test("leaves it out when missing", () => {
    expect(coverStateText({ ...cover, attributes: {} })).toBe("open");
  });

  test("reports unavailable", () => {
    expect(coverStateText({ ...cover, state: "unavailable" })).toBe(
      "unavailable",
    );
  });
});
