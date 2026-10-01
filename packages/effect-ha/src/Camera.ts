import { Effect, Redacted, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import type { EntityId } from "./Action.js";
import { HomeAssistantError } from "./HomeAssistantError.js";

export const CameraSnapshot = Schema.Struct({
  contentType: Schema.String,
  data: Schema.Uint8Array,
});

export type CameraSnapshot = typeof CameraSnapshot.Type;

// The camera's current image, from Home Assistant's REST camera proxy.
export const cameraSnapshot = Effect.fn("HomeAssistant.cameraSnapshot")(
  function* (
    options: { readonly url: string; readonly token: Redacted.Redacted },
    entityId: EntityId<"camera">,
  ) {
    const http = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest(HttpClientRequest.bearerToken(options.token)),
      HttpClient.filterStatusOk,
    );

    const response = yield* http.get(
      `${options.url.replace(/\/$/, "")}/api/camera_proxy/${encodeURIComponent(entityId)}`,
    );

    const data = yield* response.arrayBuffer;

    return {
      contentType:
        response.headers["content-type"] ?? "application/octet-stream",
      data: new Uint8Array(data),
    } satisfies CameraSnapshot;
  },
  Effect.mapError(
    (error) =>
      new HomeAssistantError({ message: `camera snapshot: ${error.message}` }),
  ),
);
