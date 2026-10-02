---
title: Shell, REST and Python commands
description: Run shell commands, REST commands and Python scripts configured in Home Assistant.
---

`shell_command`, `rest_command` and `python_script` each run something configured in Home Assistant, by name without the domain:

```bash
ha-bridge shell_command run restart_kiosk
ha-bridge rest_command run notify_nas --data '{"message":"Backup done"}'
ha-bridge python_script run tidy_states
```

`--data` passes a JSON object. Shell and REST commands read its keys in their templates; Python scripts get it as `data`.

`--response` waits for the result and prints it as JSON:

```bash
ha-bridge shell_command run disk_usage --response
```

```json
{"stdout":"42%","stderr":"","returncode":0}
```

A REST command's result has the HTTP `status`, the `content` (parsed JSON for JSON responses, otherwise text) and the `headers`. A Python script's result is whatever it puts in `output`.

Each also has `reload`, which picks up YAML changes:

```bash
ha-bridge shell_command reload
```

| Command | Home Assistant action |
| --- | --- |
| `shell_command run NAME` | `shell_command.NAME` |
| `rest_command run NAME` | `rest_command.NAME` |
| `python_script run NAME` | `python_script.NAME` |
| `shell_command reload`, `rest_command reload`, `python_script reload` | `shell_command.reload`, `rest_command.reload`, `python_script.reload` |
