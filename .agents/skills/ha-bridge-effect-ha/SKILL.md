---
name: ha-bridge-effect-ha
description: Change how @timmo001/effect-ha talks to Home Assistant in packages/effect-ha, including WebSocket commands, subscriptions, reconnect behaviour, REST calls, schemas and entity naming. Use when adding a Home Assistant request or response, decoding new message shapes, or porting a protocol feature from home-assistant-js-websocket.
license: Apache-2.0
compatibility: Requires the Home Assistant core and frontend checkouts beside ha-bridge for protocol research.
---

# effect-ha and the Home Assistant protocol

`packages/effect-ha` owns its own Effect WebSocket connection (`src/Connection.ts`). Don't add `home-assistant-js-websocket` (HAWS) as a dependency.

## Research before changing the protocol

Read Core and the frontend together; both checkouts must be fresh first.

- Core decides what is accepted: `homeassistant/components/websocket_api/commands.py` and `messages.py`, each integration's `websocket_command` handlers, and its `services.py` and `services.yaml` for action fields and responses. REST endpoints live in the integration, such as `camera/__init__.py` for `camera_proxy`.
- The frontend shows how a real client calls it: helpers in `src/data/` set message shapes and options such as `return_response`. Entity display names follow `src/common/entity/compute_entity_name.ts`, which `src/naming.ts` mirrors.
- HAWS is the reference for connection features. Port from it only when something in ha-bridge needs the feature:
  - `lib/messages.ts`: message shapes, including `supported_features` with `coalesce_messages`.
  - `lib/connection.ts`: ping keepalive, reconnecting and resubscribing afterwards.
  - `lib/entities.ts`: `subscribe_entities` and its compressed state diffs.
  - `lib/socket.ts`: the auth handshake.

## Naming

- Wire fields stay as Home Assistant expects, so `call_service`, `domain`, `service` and `service_data` remain inside `Connection.ts` while public names say action. Avoid `hass` even where Core or the frontend still use it.
- Keep Home Assistant's snake_case for wire and action data (`entity_id`, `return_response`); use camelCase for this package's own API.

## Making the change

- Add new WebSocket commands to the `HomeAssistantCommand` union and decode every reply with a `Schema`. Return failures as `HomeAssistantError` with a short context prefix, as `cameraSnapshot` and `Calendar.eventsFrom` do.
- Only decode the fields ha-bridge uses, with `Schema.optionalKey` where Home Assistant omits them, so new Home Assistant releases don't break decoding.
- Export new modules from `src/index.ts`. This is a published package with its own README; update `packages/effect-ha/README.md` when the public API changes.
- Run `mise run build:packages` as well as the root checks, since the published `dist` is built with `tsconfig.build.json` rather than the root config.
