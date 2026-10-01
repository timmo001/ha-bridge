---
name: ha-bridge-docs
description: Maintain the ha-bridge docs site in docs/ (Blume and Astro, deployed to ha-bridge.timmo.dev). Use when editing docs pages, the sidebar or the docs build, and when a change to CLI commands, flags, bar JSON output, the bridge protocol, packaging or the published libraries needs the docs updating.
license: Apache-2.0
compatibility: Requires mise and Bun from the ha-bridge repository root.
---

# ha-bridge docs

The site lives in `docs/` and is its own Bun project with its own `bun.lock`. Content is in `docs/src/content/docs/`; file names map to routes, and every page must be listed in the sidebar in `docs/blume.config.ts`.

## Keep the docs in step

- After changing commands, aliases, arguments or flags in `src/index.ts`, run `mise run docs:gen`. It rewrites the pages in `docs/src/content/docs/commands/` (one per top-level command) and the `docs/commands-sidebar.json` sidebar list from the CLI's own `--help` output. Never edit those by hand; the Docs workflow fails when it is out of date.
- Hand-written pages describe behaviour, so check the source before documenting it rather than copying older docs. Go Automate's docs had claims that didn't match its code.
  - Bar JSON and watcher text: `src/cli/output.ts`.
  - Bridge protocol and RPCs: `packages/client/src/Rpcs.ts`. Confirm wire examples against a running bridge.
  - Config, setup and socket paths: `src/config/Config.ts` and `packages/client/src/socketPath.ts`.
  - Connection and reconnect behaviour: `src/homeassistant/HomeAssistant.ts`.
  - Packages and the user service: `.scripts/linux/`.
- Library usage belongs in the package READMEs (`packages/*/README.md`); `libraries.md` only summarises them and links there.
- Use plain Markdown links. The repository's markdownlint config rejects inline HTML.

## Verify

Run from the repository root:

```bash
mise run docs:gen
mise run docs:build
(cd docs && bun run check && bun run validate)
bunx markdownlint-cli2
```

`docs:build` runs Blume in strict mode; `validate` catches broken internal links.

## Deployment

Cloudflare Workers Builds deploys `main` from the `docs` root directory with `bun run build` and `bun run deploy`, as `docs/README.md` describes. Don't edit the generated `docs/.blume/` runtime.
