---
title: Events, triggers and conditions
description: Watch and fire events, listen for automation triggers and check conditions.
---

These commands use Home Assistant's event bus and automation engine through the bridge's connection. Watchers print straight away, then follow the bridge through reconnects.

## Events

`event watch` prints each event as a line of JSON. Give an event type to watch only that type; without one, it prints every event:

```bash
ha-bridge event watch call_service
ha-bridge event watch | jq -r .event_type
```

Each line has `event_type`, `data`, `origin`, `time_fired` and `context`. Non-admin tokens can only watch a few types, such as `state_changed` and the registry updates.

`event fire` fires an event, with `--data` as a JSON object. It needs an admin token:

```bash
ha-bridge event fire doorbell_pressed --data '{"door":"front"}'
```

## Triggers

`trigger watch` listens for automation triggers and prints a line of JSON each time one fires. Write the trigger as YAML or JSON, the same as in an automation, and give a list for several:

```bash
ha-bridge trigger watch "{trigger: state, entity_id: binary_sensor.front_door, to: 'on'}"
ha-bridge trigger watch "[{trigger: event, event_type: doorbell_pressed}, {trigger: time, at: '07:00'}]"
```

Each line has `variables`, holding the `trigger` variable an automation would see, and the `context` that caused it. `--variables` passes variables the trigger's templates read. It needs an admin token.

## Conditions

`condition test` prints whether a condition passes, as `true` or `false`. It needs an admin token, and takes `--variables` for templates:

```bash
ha-bridge condition test "{condition: state, entity_id: sun.sun, state: below_horizon}"
ha-bridge condition test "{condition: template, value_template: '{{ x > 1 }}'}" --variables '{"x":3}'
```

`condition watch` prints the result, then again each time it changes. Home Assistant checks it every second.

Both take one condition. Combine several with an `and`, `or` or `not` condition:

```bash
ha-bridge condition watch "{condition: and, conditions: [{condition: sun, after: sunset}, {condition: state, entity_id: input_boolean.guest_mode, state: 'off'}]}"
```

Template errors, such as an undefined variable, are printed as warnings on stderr.
