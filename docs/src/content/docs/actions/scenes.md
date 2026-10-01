---
title: Scenes
description: Activate scenes, apply entity states, and create or delete scenes on the fly.
---

`scene turn-on` (`on`) activates a scene. `--transition` fades over that many seconds, for entities that support it:

```bash
ha-bridge scene turn-on movie_night
ha-bridge scene turn-on movie_night --transition 3
```

## Applying states

`apply` sets entity states without making a scene. Pass the states as a JSON object keyed by entity ID, each a state or an object with `state` and attributes:

```bash
ha-bridge scene apply '{"light.desk":{"state":"on","brightness":80},"switch.fan":"off"}'
```

## Creating and deleting scenes

`create` makes a scene that lasts until Home Assistant restarts. Give it states with `--entities`, capture the current state of entities with `--snapshot-entity`, or both:

```bash
ha-bridge scene create before_movie --snapshot-entity light.lounge --snapshot-entity light.lamp
ha-bridge scene turn-on before_movie
ha-bridge scene delete before_movie
```

The scene ID uses lowercase letters, digits and `_`. `delete` only removes scenes made with `create`. `scene reload` reloads scenes from YAML.

| Command | Home Assistant action |
| --- | --- |
| `scene turn-on` | `scene.turn_on` |
| `scene apply` | `scene.apply` |
| `scene create` | `scene.create` |
| `scene delete` | `scene.delete` |
| `scene reload` | `scene.reload` |

See [`ha-bridge scene`](/commands/scene) for every argument and flag.
