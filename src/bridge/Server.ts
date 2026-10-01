import { BunSocketServer } from "@effect/platform-bun";
import { Cause, Effect, FileSystem, Layer, Path, Predicate } from "effect";
import { FetchHttpClient } from "effect/http";
import { RpcSerialization, RpcServer } from "effect/rpc";
import { Socket, SocketServer } from "effect/socket";
import { HomeAssistant } from "../homeassistant/HomeAssistant.js";
import { BridgeRpcs } from "@timmo001/effect-ha-bridge";

const Handlers = BridgeRpcs.toLayer(
  Effect.gen(function* () {
    const homeAssistant = yield* HomeAssistant;

    return BridgeRpcs.of({
      GetEntity: ({ entityId }) => homeAssistant.getEntity(entityId),
      WatchEntity: ({ entityId }) => homeAssistant.watchEntity(entityId),
      CallAction: (action) => homeAssistant.callAction(action),
      GetConfig: () => homeAssistant.getConfig,
      CameraSnapshot: ({ entityId }) => homeAssistant.cameraSnapshot(entityId),
    });
  }),
);

const prepareSocket = Effect.fn("prepareSocket")(function* (
  socketPath: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(socketPath), {
    recursive: true,
    mode: 0o700,
  });
  yield* fs.remove(socketPath, { force: true });
});

const disconnectCodes = new Set(["ECONNRESET", "EPIPE"]);

const isDisconnect = (error: unknown): error is Socket.SocketError => {
  if (!Socket.isSocketError(error)) {
    return false;
  }

  const { reason } = error;

  if (Predicate.isTagged(reason, "SocketCloseError")) {
    return true;
  }

  return (
    (Predicate.isTagged(reason, "SocketReadError") ||
      Predicate.isTagged(reason, "SocketWriteError")) &&
    Predicate.hasProperty(reason.cause, "code") &&
    disconnectCodes.has(String(reason.cause.code))
  );
};

// Clients come and go (bars restart watchers), so a dropped connection is
// logged at debug level instead of as an unhandled server error.
const quietSocketServer = (socketPath: string) =>
  Layer.effect(
    SocketServer.SocketServer,
    Effect.gen(function* () {
      const server = yield* SocketServer.SocketServer;

      return SocketServer.SocketServer.of({
        address: server.address,
        run: (handler) =>
          server.run((socket) =>
            handler(socket).pipe(
              // The RPC protocol turns read errors into defects.
              Effect.catchCauseIf(
                (cause) => isDisconnect(Cause.squash(cause)),
                () => Effect.logDebug("Client disconnected"),
              ),
            ),
          ),
      });
    }),
  ).pipe(Layer.provide(BunSocketServer.layer({ path: socketPath })));

// Requiring SocketServer orders this after the socket is listening.
const secureSocket = (socketPath: string) =>
  Layer.effectDiscard(
    Effect.gen(function* () {
      yield* SocketServer.SocketServer;
      const fs = yield* FileSystem.FileSystem;
      yield* fs.chmod(socketPath, 0o600);
      yield* Effect.addFinalizer(() =>
        fs.remove(socketPath, { force: true }).pipe(Effect.ignore),
      );
      yield* Effect.logInfo("Bridge listening", socketPath);
    }),
  );

export const serve = (socketPath: string) =>
  prepareSocket(socketPath).pipe(
    Effect.andThen(
      Layer.launch(
        Layer.mergeAll(
          RpcServer.layer(BridgeRpcs),
          secureSocket(socketPath),
        ).pipe(
          Layer.provide(Handlers),
          Layer.provide(RpcServer.layerProtocolSocketServer),
          Layer.provide(RpcSerialization.layerNdjson),
          Layer.provide(quietSocketServer(socketPath)),
          Layer.provide(
            HomeAssistant.layer.pipe(Layer.provide(FetchHttpClient.layer)),
          ),
        ),
      ),
    ),
  );
