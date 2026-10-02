import { describe, expect, test } from "bun:test";
import { stateWithUnit, type EntityState } from "@timmo001/effect-ha";
import {
  climateStateText,
  coverStateText,
  entityBar,
  entityField,
  entityFieldValues,
  stateTextBar,
  templateBar,
} from "./output.js";

const noOptions = {
  icon: "",
  text: "",
  textOn: "",
  textOff: "",
  tooltip: "",
  tooltipOn: "",
  tooltipOff: "",
  className: "",
  classOn: "",
  classOff: "",
  onStates: [],
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

  test("renders templates, leaving missing paths empty", () => {
    const light: EntityState = {
      entity_id: "light.office",
      state: "on",
      attributes: { brightness: 128 },
    };

    expect(
      entityBar(light, "Office", {
        ...noOptions,
        text: "{attributes.brightness}%",
        tooltip: "{name}: {attributes.color_mode}",
      }),
    ).toBe(`{"class":"on","name":"Office","text":"128%","tooltip":"Office: "}`);
  });

  test("keeps a set template that renders empty", () => {
    const player: EntityState = { entity_id: "media_player.tv", state: "off" };

    expect(
      entityBar(player, "", {
        ...noOptions,
        text: "{attributes.media_title}",
      }),
    ).toBe(`{"class":"off","text":"","tooltip":"off"}`);
  });

  test("uses --on-state to choose the on flags", () => {
    const curtain: EntityState = { entity_id: "cover.curtain", state: "open" };

    expect(
      entityBar(curtain, "", {
        ...noOptions,
        classOn: "opened",
        classOff: "shut",
        onStates: ["open"],
      }),
    ).toBe(`{"class":"opened","text":"open","tooltip":"open"}`);
  });
});

describe("entity fields", () => {
  const light: EntityState = {
    entity_id: "light.office",
    state: "on",
    attributes: { brightness: 128, hs_color: [30, 50] },
  };

  test("prints a string field raw", () => {
    expect(entityField(light, "Office", "state")).toBe("on");
  });

  test("prints an object field as JSON", () => {
    expect(entityField(light, "Office", "attributes.hs_color")).toBe("[30,50]");
  });

  test("collects several fields with null for missing", () => {
    expect(
      entityFieldValues(light, "Office", [
        "state",
        "attributes.hs_color.0",
        "attributes.missing",
      ]),
    ).toEqual({
      state: "on",
      "attributes.hs_color.0": 30,
      "attributes.missing": null,
    });
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

describe("templateBar", () => {
  test("uses a text result as the text", () => {
    expect(templateBar("21 °C")).toBe(
      '{"class":"","text":"21 °C","tooltip":""}',
    );
  });

  test("takes text, tooltip and class from an object result", () => {
    expect(
      templateBar({ text: "3", tooltip: "3 updates", class: "warning" }),
    ).toBe('{"class":"warning","text":"3","tooltip":"3 updates"}');
  });

  test("prints other results as JSON text", () => {
    expect(templateBar({ count: 3 })).toBe(
      '{"class":"","text":"{\\"count\\":3}","tooltip":""}',
    );
  });
});
