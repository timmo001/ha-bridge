import { describe, expect, test } from "bun:test";
import { websocketUrl } from "./Connection.js";

describe("websocketUrl", () => {
  test("uses the host's WebSocket API", () => {
    expect(websocketUrl("http://homeassistant.local:8123")).toBe(
      "ws://homeassistant.local:8123/api/websocket",
    );

    expect(websocketUrl("https://ha.example.com/")).toBe(
      "wss://ha.example.com/api/websocket",
    );
  });

  test("keeps the path, as the Supervisor's proxy for apps needs", () => {
    expect(websocketUrl("http://supervisor/core")).toBe(
      "ws://supervisor/core/api/websocket",
    );

    expect(websocketUrl("https://example.com/home-assistant/")).toBe(
      "wss://example.com/home-assistant/api/websocket",
    );
  });
});
