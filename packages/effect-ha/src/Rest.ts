import { Effect, Redacted, Schema } from "effect";
import {
  HttpClient,
  HttpClientRequest,
  type HttpClientResponse,
} from "effect/http";
import { HomeAssistantError } from "./HomeAssistantError.js";

export interface RestOptions {
  readonly url: string;
  readonly token: Redacted.Redacted;
}

const decodeMessage = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ message: Schema.String })),
);

const restUrl = (options: RestOptions, path: string) =>
  `${options.url.replace(/\/$/, "")}/api/${path}`;

// A request to Home Assistant's REST API at /api/<path>, whatever its status.
export const restResponse = Effect.fnUntraced(function* (
  options: RestOptions,
  method: "GET" | "POST" | "DELETE",
  path: string,
  request: HttpClientRequest.Options.NoUrl = {},
) {
  const http = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(HttpClientRequest.bearerToken(options.token)),
  );

  return yield* http
    .execute(HttpClientRequest.make(method)(restUrl(options, path), request))
    .pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({ message: `${path}: ${error.message}` }),
      ),
    );
});

// Fails with what Home Assistant or the Supervisor said when the response
// isn't OK.
export const requireOk = Effect.fnUntraced(function* (
  path: string,
  response: HttpClientResponse.HttpClientResponse,
) {
  if (response.status >= 400) {
    const body = (yield* response.text.pipe(
      Effect.orElseSucceed(() => ""),
    )).trim();

    // Home Assistant's views answer {"message": ...}.
    const said = yield* decodeMessage(body).pipe(
      Effect.map(({ message }) => message),
      Effect.orElseSucceed(() => body),
    );

    return yield* new HomeAssistantError({
      message: `${path} answered ${response.status}${said === "" ? "" : `: ${said}`}`,
    });
  }

  return response;
});

// A request that fails unless Home Assistant answers OK.
export const restRequest = (
  options: RestOptions,
  method: "GET" | "POST" | "DELETE",
  path: string,
  request: HttpClientRequest.Options.NoUrl = {},
) =>
  Effect.flatMap(restResponse(options, method, path, request), (response) =>
    requireOk(path, response),
  );
