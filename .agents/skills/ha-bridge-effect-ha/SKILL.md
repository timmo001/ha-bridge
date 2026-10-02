---
name: ha-bridge-effect-ha
description: Change how @timmo001/effect-ha talks to Home Assistant in packages/effect-ha, including WebSocket commands, subscriptions, reconnect behaviour, REST calls, schemas and entity naming. Use when adding a Home Assistant request or response, decoding new message shapes, or porting a protocol feature from home-assistant-js-websocket.
license: Apache-2.0
compatibility: Requires the Home Assistant core and frontend checkouts beside ha-bridge for protocol research.
---

# effect-ha and the Home Assistant protocol

`packages/effect-ha` owns its own Effect WebSocket connection. Don't add `home-assistant-js-websocket` (HAWS) as a dependency; port from it only when something in ha-bridge needs the feature.

## Layout

- `Connection.ts`: `connect` runs the auth handshake, then one reader fiber decodes frames and `dispatch` routes them. `request` assigns the id, parks a `Deferred` in `pending` and races it against `closed`. `HomeAssistantCommand` lists every command the package may send.
- `Action.ts`: the `Action` schema (automation shape) and per-domain builders. `callAction` splits `action` into `domain` and `service` for `call_service`.
- `Entity.ts`, `HomeAssistantConfig.ts`, `Calendar.ts`: schemas and decoders for what ha-bridge reads.
- `Camera.ts`: REST, not WebSocket. `/api/camera_proxy/<entity_id>` with a bearer token.
- `naming.ts`: display names from the registries, ported from the frontend's `compute_entity_name.ts` and `strip_prefix_from_entity_name.ts`. Keep it in step with those files.

The bridge's `src/homeassistant/HomeAssistant.ts` drives the session: it subscribes to `state_changed` and the entity and device registry events before calling `get_states` so no change is lost, caches every state, fetches the registries for naming on a best-effort basis (again 500 ms after registry events stop) and reconnects after 5 seconds.

## Wire basics

- Handshake: Home Assistant sends `auth_required`, the client sends `auth` with `access_token`, and Home Assistant answers `auth_ok` or `auth_invalid`. Both carry `ha_version`.
- Ids must strictly increase within a connection, or Core answers `id_reuse`. A reconnect starts again from 1.
- Results are `{ id, type: "result", success, result }` or `{ ..., success: false, error: { code, message } }`. `HomeAssistantError` keeps only the message.
- Events are `{ id, type: "event", event }`, where `id` is the id of the subscribing request.
- `call_service` succeeds with `{ context, response? }`; `response` is present only when `return_response` was sent.
- `state_changed`, `entity_registry_updated` and `device_registry_updated` subscriptions, `config/entity_registry/list_for_display` and `config/device_registry/list` work for non-admin users. Other events and most registry commands need an admin token.
- Core drops a client whose outgoing queue reaches 4096 messages, so the reader must keep up. Keep `onState` and `onEvent` cheap.

## Traps in the current code

- `dispatch` ignores the event `id`. It sends `state_changed` to `onState` and only the event type of anything else to `onEvent`; a consumer that needs other event data needs events routed by subscription id.
- Frames that fail to decode are logged at debug level and dropped. A new reply type, such as `pong`, must be added to the decoded union, or the request waits until the connection closes.
- Don't send `supported_features` with `coalesce_messages` until the reader splits JSON arrays; Core then batches several messages into one frame.
- `list_for_display` uses compact keys (`ei`, `di`, `en`). `config/device_registry/list` returns full devices mixed with stripped child devices that have `parent_device_id` but no `connections`; see the frontend's `src/data/ws-device_registry.ts` before relying on fields beyond `id` and the names.

## Where to look

- Core, `homeassistant/components/websocket_api/`: `auth.py` (handshake), `messages.py` (result, error and event shapes), `connection.py` (id rules, supported features), `const.py` (error codes, queue limits), `commands.py` (`get_states`, `subscribe_events`, `call_service`, `get_config`, `ping`, `supported_features`, `subscribe_entities`).
- Core, registries: `components/config/entity_registry.py` and `device_registry.py`.
- HAWS, `lib/`: `socket.ts` (handshake), `messages.ts` (message builders), `connection.ts` (ping keepalive, reconnect and resubscribe), `entities.ts` (`subscribe_entities` and its compressed diffs).

## Making the change

- Wire fields stay as Home Assistant sends them (`call_service`, `service_data`, `entity_id`) inside `Connection.ts` and the schemas; the package's own API uses camelCase and says action.
- Add the command to `HomeAssistantCommand` and decode its result with a `Schema`. Decode only the fields ha-bridge uses, with `Schema.optionalKey` where Home Assistant may omit them.
- Fail with `HomeAssistantError` and a short context prefix, as `cameraSnapshot` and `Calendar.eventsFrom` do.
- Export new modules from `src/index.ts` and update `packages/effect-ha/README.md` when the public API changes.
- A new action builder belongs on a plain-object namespace, such as `Light`, so `mise run drift:core` finds it. Run it after adding or removing builders.
- Run `mise run build:packages` as well as the root checks; the published `dist` builds with `tsconfig.build.json`, not the root config.
