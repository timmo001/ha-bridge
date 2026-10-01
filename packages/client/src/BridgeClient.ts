import { NodeSocket } from "@effect/platform-node-shared";
import { Context, Layer } from "effect";
import { RpcClient, RpcSerialization } from "effect/rpc";
import type { RpcClientError } from "effect/rpc/RpcClientError";
import { BridgeRpcs } from "./Rpcs.js";

export class BridgeClient extends Context.Service<
  BridgeClient,
  RpcClient.FromGroup<typeof BridgeRpcs, RpcClientError>
>()("BridgeClient") {
  // Calls fail when the bridge is unreachable instead of waiting for it, so
  // watchers exit and their supervisor restarts them, as with Go Automate.
  static readonly layer = (socketPath: string) =>
    Layer.effect(BridgeClient, RpcClient.make(BridgeRpcs)).pipe(
      Layer.provide(RpcClient.layerProtocolSocket()),
      Layer.provide(RpcSerialization.layerNdjson),
      Layer.provide(NodeSocket.layerNet({ path: socketPath })),
    );
}
