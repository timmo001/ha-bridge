---
name: ha-bridge-release
description: Version, release and package ha-bridge and its published libraries, @timmo001/effect-ha and @timmo001/effect-ha-bridge. Use when bumping versions, preparing or publishing a GitHub release, debugging the Release or Publish Arch git package workflows, or editing the PKGBUILDs, nfpm config, systemd user service or install hooks in .scripts/linux/.
license: Apache-2.0
compatibility: Requires mise, Bun and the GitHub CLI from the ha-bridge repository root.
---

# Releasing ha-bridge

One version covers the CLI and both libraries. A published, non-prerelease GitHub release runs `.github/workflows/release.yml`, which publishes `@timmo001/effect-ha` then `@timmo001/effect-ha-bridge` to npm and JSR, the Linux binaries and packages, and `ha-bridge-bin` for Arch. Prereleases publish nothing.

## Bump the version

The publish workflows fail unless the release tag exactly matches every manifest, with no `v` prefix. Set the same version in:

- `package.json` (the CLI reads `--version` from it)
- `packages/effect-ha/package.json` and `packages/effect-ha/jsr.json`
- `packages/client/package.json` and `packages/client/jsr.json`

Then run `mise run version:sync` to pin the client's `@timmo001/effect-ha` dependency to it, and `bun install` to refresh `bun.lock`; CI installs with `--frozen-lockfile`. Run `mise run check`, `mise run test`, `mise run build` and `mise run build:packages` before committing.

Releasing is a public, irreversible publish. Commit, push and create the release only when the user asks for each step, and use their chosen version.

## Packaging

- `.scripts/linux/PKGBUILD` builds `ha-bridge-git` from source; `publish-arch-git.yml` publishes it on pushes to `main` that touch the source or packaging. Its `pkgver` comes from `package.json`.
- `.scripts/linux/PKGBUILD.bin` is a template; the release renders `pkgver` and checksums from the tag. Don't edit those values by hand.
- `.scripts/linux/nfpm.yaml` builds the release's deb and rpm packages.
- A packaged file, such as a change to `ha-bridge.service` or a new installed file, must be updated in all three, and in the `extraFiles` of the `prepare-arch-bin` job when the `-bin` package needs it.
- `ha-bridge.install` enables the user service globally and starts it for the installing user. Keep upgrades to `try-restart` so a service the user stopped stays stopped.
- The Lint package configs workflow runs namcap on PKGBUILD changes, and the shellcheck job covers `.scripts/`.

## After a release

Install only published packages: upgrade from the signed `timmo` pacman repository once the release workflow succeeds, then check `pacman -Qo "$(command -v ha-bridge)"`. Never install a local build or a locally built package over the packaged one.
