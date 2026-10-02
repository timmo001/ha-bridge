---
title: Bridge protocol
description: The RPCs the bridge serves on its Unix socket, and their wire format.
---

The bridge serves [Effect](https://effect.website) RPCs as newline-delimited JSON on a Unix socket. From TypeScript, use [`@timmo001/effect-ha-bridge`](/libraries), which handles the framing for you. This page is for other languages and for debugging.

The socket is at the [socket path](/configuration#socket-path), in a directory only you can open (`0700`), and is itself only accessible by you (`0600`).

## RPCs

| RPC | Payload | Result |
| --- | --- | --- |
| `GetEntity` | `{ "entityId": string }` | An entity update, or `null` when the bridge has no state for it |
| `WatchEntity` | `{ "entityId": string }` | A stream of entity updates: the current state, if any, then every change |
| `CallAction` | `{ "action": string, "data"?: object, "target"?: object, "return_response"?: boolean }` | The action's response when `return_response` is `true`, otherwise `null` |
| `GetConfig` | `null` | Home Assistant's config, such as `time_zone`, `location_name` and `version` |
| `CameraSnapshot` | `{ "entityId": "camera.<name>" }` | `{ "contentType": string, "data": string }`, with the image bytes base64-encoded in `data` |
| `Search` | `{ "query": string, "kinds"?: ("entity" \| "device" \| "area")[], "domain"?: string, "area"?: string, "deviceClass"?: string, "limit"?: number, "offset"?: number }` | `{ "results": SearchMatch[], "total": number, "unavailable": string[] }` |

An entity update is `{ "state": EntityState, "name": string }`. `state` is the state object Home Assistant sends, with `entity_id`, `state`, `attributes`, `last_changed`, `last_reported`, `last_updated` and `context` (`id`, `parent_id`, `user_id`); everything past `state` can be missing. `name` is the display name described in [Bar JSON](/using/bar-json#output). `WatchEntity` sends the current state again when the entity's display name changes.

A search match is `{ "kind", "id", "name", "score", "matched" }` plus `domain`, `deviceClass`, `device`, `parentDevice`, `area` and `floor` when they're known. `total` counts every close match before `offset` and `limit` (default 20) are applied, and `unavailable` lists any registries the bridge couldn't load, such as `area_registry`. `Search` reads only the bridge's cache, and fails with `SearchQueryEmpty` (`{ "_tag": "SearchQueryEmpty" }`) when the query has no words. [Searching](/using/search) describes the matching.

`CallAction`, `GetConfig` and `CameraSnapshot` fail with `HomeAssistantError` (`{ "_tag": "HomeAssistantError", "message": string }`) when Home Assistant rejects the request or the bridge isn't connected to it. `CallAction` takes the same `action`, `data` and `target` keys as actions in Home Assistant automations.

## Messages

Each line is one JSON message. Send a request:

```json
{"_tag":"Request","id":"1","tag":"GetEntity","payload":{"entityId":"sun.sun"},"headers":[]}
```

A single result comes back as an `Exit` with the same ID:

```json
{"_tag":"Exit","requestId":"1","exit":{"_tag":"Success","value":{"state":{"entity_id":"sun.sun","state":"above_horizon","attributes":{}},"name":"Sun"}}}
```

A failure has `"_tag":"Failure"` and a `cause` list instead of `value`. An RPC's own error is a `Fail` entry:

```json
{"_tag":"Exit","requestId":"2","exit":{"_tag":"Failure","cause":[{"_tag":"Fail","error":{"_tag":"HomeAssistantError","message":"camera snapshot: StatusCode: non 2xx status code (404 GET ...)"}}]}}
```

A malformed request comes back as a `Die` entry, such as `{"_tag":"Die","defect":"Expected null"}` when `GetConfig` has no `payload`.

Keep the connection open until the reply arrives. When the client closes its side, the bridge ends that client's requests that are still running.

Streams send `Chunk` messages, each with one or more values:

```json
{"_tag":"Chunk","requestId":"1","values":[{"state":{"entity_id":"sun.sun","state":"above_horizon","attributes":{}},"name":"Sun"}]}
```

After each chunk, the bridge waits for an `Ack` before sending the next one:

```json
{"_tag":"Ack","requestId":"1"}
```

To stop a stream, send `{"_tag":"Interrupt","requestId":"1"}` or close the connection.

## Try it

```bash
socket="$XDG_RUNTIME_DIR/ha-bridge/ha-bridge.sock"

{
  echo '{"_tag":"Request","id":"1","tag":"GetConfig","payload":null,"headers":[]}'
  sleep 1
} | socat - "UNIX-CONNECT:$socket"
```
