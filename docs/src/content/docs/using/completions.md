---
title: Shell completions
description: Tab completion for ha-bridge commands, aliases and flags in bash, zsh and fish.
---

Every package installs completions for bash, zsh and fish, so Tab completes commands, aliases and flags in a new shell.

When you install the binary yourself, generate the script for your shell:

```bash
# bash
ha-bridge --completions bash > ~/.local/share/bash-completion/completions/ha-bridge

# zsh: any directory on your $fpath
ha-bridge --completions zsh > "${fpath[1]}/_ha-bridge"

# fish
ha-bridge --completions fish > ~/.config/fish/completions/ha-bridge.fish
```

Completion never contacts the bridge or Home Assistant, and works before you've run setup. It doesn't suggest entity names.
