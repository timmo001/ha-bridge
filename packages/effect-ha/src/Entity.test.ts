import { describe, expect, test } from "bun:test";
import { Schema } from "effect";
import { EntityState } from "./Entity.js";

const decode = Schema.decodeUnknownSync(EntityState);

describe("EntityState", () => {
  test("keeps every key Home Assistant sends", () => {
    const state = {
      entity_id: "light.office",
      state: "on",
      attributes: { brightness: 128, friendly_name: "Office" },
      last_changed: "2026-10-01T20:00:00.000000+00:00",
      last_reported: "2026-10-01T20:05:00.000000+00:00",
      last_updated: "2026-10-01T20:05:00.000000+00:00",
      context: {
        id: "01J0000000000000000000000",
        parent_id: null,
        user_id: "abc123",
      },
    };

    expect(decode(state)).toEqual(state);
  });

  test("accepts a state with only an id and state", () => {
    expect(decode({ entity_id: "sun.sun", state: "above_horizon" })).toEqual({
      entity_id: "sun.sun",
      state: "above_horizon",
    });
  });
});
