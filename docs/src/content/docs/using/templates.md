---
title: Templates
description: Render Home Assistant templates once, or watch them as what they read changes.
---

`template render` asks Home Assistant to render a [template](https://www.home-assistant.io/docs/configuration/templating/) and prints the result. `template watch` prints it straight away, then again whenever an entity or anything else the template reads changes. Both go through the bridge's connection, so they need no extra Home Assistant connection or polling.

```bash
ha-bridge template render "{{ states('sun.sun') }}"
ha-bridge template watch "{{ states.light | selectattr('state', 'eq', 'on') | list | count }} lights on"
```

Home Assistant parses results that read as numbers, lists or objects. Text prints as it is, and anything else as JSON. `--json` prints every result as JSON.

## Variables, strict mode and timeouts

`--variables` passes a JSON object that the template can read. `--strict` makes an undefined variable an error instead of an empty value, and `--timeout` sets how many seconds the first render may take:

```bash
ha-bridge template render "{{ room }} is {{ states('sensor.' ~ room ~ '_temperature') }}" \
  --variables '{"room":"office"}' --strict
```

Warnings, such as an undefined variable outside strict mode, go to stderr. `template render` exits with an error when the template fails to render. `template watch` logs render errors and keeps watching, and renders again after the bridge reconnects.

## Bar JSON

`--bar-json` prints one [bar JSON](/using/bar-json) object per result. An object result with `text`, and optionally `tooltip` and `class`, sets those fields; any other result is the text:

```bash
ha-bridge template watch --bar-json \
  "{{ {'text': states('sensor.updates'), 'tooltip': 'Pending updates', 'class': 'warning' if states('sensor.updates') | int > 0 else ''} }}"
```

```json
{"class":"warning","text":"3","tooltip":"Pending updates"}
```
