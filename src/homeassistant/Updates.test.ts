import { describe, expect, test } from "bun:test";
import { Effect, Layer, Redacted, Stream } from "effect";
import { FetchHttpClient } from "effect/http";
import {
  HomeAssistantError,
  type HomeAssistantSession,
} from "@timmo001/effect-ha";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { BridgeConfig } from "../config/Config.js";
import { HomeAssistant, type HomeAssistantService } from "./HomeAssistant.js";
import { Updates } from "./Updates.js";

const firmware: EntityUpdate = {
  name: "Kitchen firmware",
  state: {
    entity_id: "update.kitchen_firmware",
    state: "unavailable",
    attributes: {
      installed_version: "1.0.0",
      latest_version: "1.1.0",
      supported_features: 16,
    },
  },
};

const session = (
  notes: Effect.Effect<string | null, HomeAssistantError>,
): HomeAssistantSession => ({
  request: (command) => {
    if (command.type === "config/entity_registry/get") {
      return Effect.succeed({ platform: "esphome" });
    }

    if (command.type === "update/release_notes") {
      return notes;
    }

    return Effect.die(`unexpected command ${command.type}`);
  },
  callAction: () => Effect.die("unused"),
  getConfig: Effect.die("unused"),
  extractTarget: () => Effect.die("unused"),
  subscribe: () => Effect.die("unused"),
  closed: Effect.never,
});

const homeAssistant = (
  notes: Effect.Effect<string | null, HomeAssistantError>,
): HomeAssistantService => ({
  getEntities: () => Effect.succeed([firmware]),
  watchEntities: () => Stream.die("unused"),
  domainEntities: () => Effect.die("unused"),
  callAction: () => Effect.die("unused"),
  getConfig: Effect.die("unused"),
  cameraSnapshot: () => Effect.die("unused"),
  renderTemplate: () => Effect.die("unused"),
  watchTemplate: () => Stream.die("unused"),
  watchEvents: () => Stream.die("unused"),
  fireEvent: () => Effect.die("unused"),
  getHistory: () => Effect.die("unused"),
  getLogbook: () => Effect.die("unused"),
  watchLogbook: () => Stream.die("unused"),
  watchTrigger: () => Stream.die("unused"),
  testCondition: () => Effect.die("unused"),
  watchCondition: () => Stream.die("unused"),
  validateConfig: () => Effect.die("unused"),
  search: () => Effect.die("unused"),
  session: Effect.succeed(session(notes)),
  sessions: Stream.die("unused"),
  currentUser: Effect.die("unused"),
});

const runGet = (notes: Effect.Effect<string | null, HomeAssistantError>) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const updates = yield* Updates;

      return yield* updates.get({
        target: { entity_id: "update.kitchen_firmware" },
      });
    }).pipe(
      Effect.provide(
        Updates.layer.pipe(
          Layer.provide(
            Layer.mergeAll(
              Layer.succeed(
                HomeAssistant,
                HomeAssistant.of(homeAssistant(notes)),
              ),
              Layer.succeed(
                BridgeConfig,
                BridgeConfig.of({
                  path: "/tmp/ha-bridge-updates-test",
                  load: Effect.succeed({
                    url: "http://homeassistant.local",
                    token: Redacted.make("token"),
                  }),
                  setup: Effect.die("unused"),
                }),
              ),
              FetchHttpClient.layer,
            ),
          ),
        ),
      ),
    ),
  );

describe("Updates.get", () => {
  test("keeps the update when release notes are refused", async () => {
    const details = await runGet(
      Effect.fail(new HomeAssistantError({ message: "Unauthorized" })),
    );

    expect(details.entity_id).toBe("update.kitchen_firmware");
    expect(details.installed_version).toBe("1.0.0");
    expect(details.integration).toBe("esphome");
    expect(details.release_notes).toBeNull();
    expect(details.features).toEqual(["release_notes"]);
  });

  test("returns release notes when Home Assistant has them", async () => {
    const details = await runGet(Effect.succeed("Fixed the kitchen."));

    expect(details.release_notes).toBe("Fixed the kitchen.");
  });
});
