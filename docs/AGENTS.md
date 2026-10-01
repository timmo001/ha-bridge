# Docs agents

This directory is the Blume and Astro documentation site for ha-bridge, deployed to `ha-bridge.timmo.dev` by Cloudflare Workers Builds.

- Run tasks through mise from the repository root: `mise run docs:dev`, `docs:build`, `docs:preview` and `docs:gen`.
- Content lives in `src/content/docs/`; file names map to routes. Add new pages to the sidebar in `blume.config.ts`.
- `src/content/docs/reference/commands.md` is generated from the CLI's help by `mise run docs:gen`. Don't edit it by hand; regenerate it after changing commands in `src/index.ts`.
- Check behaviour against the source before documenting it, and keep pages in step with the CLI, the protocol in `packages/client/src/Rpcs.ts` and the package READMEs.
- Don't edit the generated `.blume/` runtime.
