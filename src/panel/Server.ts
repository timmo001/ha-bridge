import { BunHttpServer, BunSocket } from "@effect/platform-bun";
import {
  BridgeClient,
  BridgeRpcs,
  TargetError,
} from "@timmo001/effect-ha-bridge";
import { HomeAssistantError } from "@timmo001/effect-ha";
import { Effect, Layer, Stream } from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { RpcClient, RpcSerialization, RpcServer } from "effect/rpc";
import { RpcClientError } from "effect/rpc/RpcClientError";
import { PanelRpcs } from "./Rpcs.js";
import { PanelStore } from "./Store.js";
import { bundleWeb } from "./webBundle.js" with { type: "macro" };

const rpcPath = "/rpc";

const unreachable = (error: RpcClientError) =>
  new HomeAssistantError({
    message: `could not reach the bridge: ${error.message}`,
  });

// Calls fail as Home Assistant errors while the bridge is unreachable.
const fromBridge = <A, E>(effect: Effect.Effect<A, E | RpcClientError>) =>
  Effect.catchIf(
    effect,
    (error: E | RpcClientError) => error instanceof RpcClientError,
    (error) => Effect.fail(unreachable(error)),
  );

const streamFromBridge = <A, E>(stream: Stream.Stream<A, E | RpcClientError>) =>
  Stream.catchIf(
    stream,
    (error: E | RpcClientError) => error instanceof RpcClientError,
    (error) => Stream.fail(unreachable(error)),
  );

// Each browser call goes on to the bridge socket as it is.
const Handlers = PanelRpcs.toLayer(
  Effect.gen(function* () {
    const client = yield* BridgeClient;
    const store = yield* PanelStore;

    return PanelRpcs.of({
      GetEntities: (request) => client.GetEntities(request).pipe(fromBridge),
      WatchEntities: (request) =>
        client
          .WatchEntities(request)
          .pipe(
            Stream.mapError((error) =>
              error instanceof RpcClientError
                ? new TargetError({ message: unreachable(error).message })
                : error,
            ),
          ),
      CallAction: (action) => client.CallAction(action).pipe(fromBridge),
      GetConfig: () => client.GetConfig().pipe(fromBridge),
      WatchTemplate: (request) =>
        client.WatchTemplate(request).pipe(streamFromBridge),
      GetHistory: (request) => client.GetHistory(request).pipe(fromBridge),
      Search: (request) => client.Search(request).pipe(fromBridge),
      WatchPanel: () => store.changes,
      SaveDashboard: (dashboard) => store.saveDashboard(dashboard),
      DeleteDashboard: ({ id }) => store.deleteDashboard(id),
      OrderDashboards: ({ ids }) => store.orderDashboards(ids),
      SaveSettings: (settings) => store.saveSettings(settings),
    });
  }),
);

// Unlike the CLI's client, the panel waits out bridge restarts.
const bridgeClient = (socketPath: string) =>
  Layer.effect(BridgeClient, RpcClient.make(BridgeRpcs)).pipe(
    Layer.provide(
      RpcClient.layerProtocolSocket({
        pingInterval: "5 seconds",
        pingTimeout: "15 seconds",
        retryTransientErrors: true,
      }),
    ),
    Layer.provide(RpcSerialization.layerNdjson),
    Layer.provide(BunSocket.layerNet({ path: socketPath })),
  );

const contentTypes = new Map([
  ["html", "text/html; charset=utf-8"],
  ["js", "text/javascript; charset=utf-8"],
  ["css", "text/css; charset=utf-8"],
  ["svg", "image/svg+xml"],
  ["png", "image/png"],
]);

const { "index.html": indexFile, ...assets } = bundleWeb();

const compressFrom = 1024;

const assetHeaders = {
  "cache-control": "public, max-age=31536000, immutable",
  vary: "accept-encoding",
};

// The UI's assets, built into the binary. Their names carry a content hash,
// so they never change. Bigger text files are gzipped once here; images are
// compressed already.
const webFiles = new Map(
  Object.entries(assets).map(([name, file]) => {
    const contentType = contentTypes.get(name.split(".").pop() ?? "");

    const bytes = file.base64
      ? Uint8Array.fromBase64(file.body)
      : new TextEncoder().encode(file.body);

    const plain = HttpServerResponse.uint8Array(bytes, {
      contentType,
      headers: assetHeaders,
    });

    return [
      name,
      {
        plain,
        gzipped:
          file.base64 || bytes.length < compressFrom
            ? plain
            : HttpServerResponse.uint8Array(Bun.gzipSync(bytes), {
                contentType,
                headers: { ...assetHeaders, "content-encoding": "gzip" },
              }),
      },
    ];
  }),
);

const acceptsGzip = (request: HttpServerRequest.HttpServerRequest) =>
  /(?:^|,)\s*gzip\s*(?:;|,|$)/.test(request.headers["accept-encoding"] ?? "");

const page = HttpServerResponse.text(indexFile?.body ?? "", {
  contentType: contentTypes.get("html"),
  headers: { "cache-control": "no-cache" },
});

const notFound = HttpServerResponse.empty({ status: 404 });

// Asset files are served as they are, and every other path gets the page,
// which routes in the browser.
const web = HttpRouter.add("GET", "/*", (request) => {
  const path = new URL(request.url, "http://panel").pathname.slice(1);
  const file = webFiles.get(path);

  if (file !== undefined) {
    return Effect.succeed(acceptsGzip(request) ? file.gzipped : file.plain);
  }

  return Effect.succeed(
    path.includes(".") && path !== "index.html" ? notFound : page,
  );
});

// Browsers let any page open a WebSocket to any address, so a site someone
// visits could otherwise reach the panel on their machine and control Home
// Assistant through it. The RPC socket only answers pages the panel served.
const sameOrigin = <E, R>(
  httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
) =>
  Effect.flatMap(HttpServerRequest.HttpServerRequest, (request) => {
    const pathname = new URL(request.url, "http://panel").pathname;
    const origin = request.headers.origin;

    if (pathname !== rpcPath || origin === undefined) {
      return httpEffect;
    }

    const host = URL.canParse(origin) ? new URL(origin).host : "";

    // A reverse proxy, such as Pitchfork's, forwards the page's own host here
    const forwardedHost = request.headers["x-forwarded-host"];

    return host !== "" &&
      (host === request.headers.host || host === forwardedHost)
      ? httpEffect
      : Effect.logWarning(`Refused the panel socket to ${origin}`).pipe(
          Effect.as(HttpServerResponse.empty({ status: 403 })),
        );
  });

export interface PanelOptions {
  readonly socketPath: string;
  readonly hostname: string;
  readonly port: number;
  readonly dataPath: string;
}

export const layer = (options: PanelOptions) =>
  HttpRouter.serve(
    Layer.mergeAll(
      RpcServer.layerHttp({
        group: PanelRpcs,
        path: rpcPath,
        protocol: "websocket",
      }).pipe(
        Layer.provide(Handlers),
        Layer.provide(RpcSerialization.layerJson),
      ),
      web,
    ),
    { middleware: sameOrigin },
  ).pipe(
    Layer.provide(
      BunHttpServer.layer({
        hostname: options.hostname,
        port: options.port,
        // Open pages hold their socket until they close, so waiting for
        // them would hold up every restart; they reconnect on their own.
        gracefulShutdownTimeout: "2 seconds",
      }),
    ),
    Layer.provide(bridgeClient(options.socketPath)),
    Layer.provide(PanelStore.layer(options.dataPath)),
  );
