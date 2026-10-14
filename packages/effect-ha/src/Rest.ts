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

// Where Supervisor requests go: through Core's proxy at /api/hassio/ with a
// Home Assistant token, or with `direct`, straight to the Supervisor API at
// `url` (http://supervisor) with a Home Assistant app's token. Core's proxy
// refuses apps, so they need the direct route.
export interface SupervisorOptions extends RestOptions {
  readonly direct?: boolean | undefined;
}

const decodeMessage = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ message: Schema.String })),
);

const baseUrl = (options: RestOptions) => options.url.replace(/\/$/, "");

const restUrl = (options: RestOptions, path: string) =>
  `${baseUrl(options)}/api/${path}`;

const supervisorUrl = (options: SupervisorOptions, path: string) =>
  options.direct === true
    ? `${baseUrl(options)}/${path}`
    : restUrl(options, `hassio/${path}`);

const send = Effect.fnUntraced(function* (
  token: Redacted.Redacted,
  method: "GET" | "POST" | "DELETE",
  url: string,
  path: string,
  request: HttpClientRequest.Options.NoUrl,
) {
  const http = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  );

  return yield* http
    .execute(HttpClientRequest.make(method)(url, request))
    .pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({ message: `${path}: ${error.message}` }),
      ),
    );
});

// A request to Home Assistant's REST API at /api/<path>, whatever its status.
export const restResponse = (
  options: RestOptions,
  method: "GET" | "POST" | "DELETE",
  path: string,
  request: HttpClientRequest.Options.NoUrl = {},
) => send(options.token, method, restUrl(options, path), path, request);

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
      status: response.status,
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

// A GET from the Supervisor API, such as host/logs, that fails unless the
// Supervisor answers OK.
export const supervisorRequest = (
  options: SupervisorOptions,
  path: string,
  request: HttpClientRequest.Options.NoUrl = {},
) =>
  Effect.flatMap(
    send(options.token, "GET", supervisorUrl(options, path), path, request),
    (response) => requireOk(path, response),
  );
