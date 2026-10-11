# Home Assistant Bridge

![Home Assistant Bridge](.github/assets/banner.png)

One shared Home Assistant connection for your machine, served to local apps over a single socket.

See the [documentation](https://ha-bridge.timmo.dev) to install, configure and use it.

## Agent skill

The `ha-bridge-cli` skill teaches coding agents to use the CLI. Install it with the [Skills CLI](https://skills.sh):

```bash
npx skills add timmo001/ha-bridge --skill ha-bridge-cli
```

Or in Claude Code:

```text
/plugin install ha-bridge --marketplace timmo001/ha-bridge
```
