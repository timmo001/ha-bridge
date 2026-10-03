---
name: ha-bridge-review
description: Review, clean up and test a changeset in ha-bridge, whether a pull request, a branch, recent commits or uncommitted changes. Use when asked to review changes, clean up what goes against the repository's rules, check whether review comments are valid, judge whether tests are needed, or test changes for real against Home Assistant.
license: Apache-2.0
compatibility: Requires mise, Bun and Pitchfork from the ha-bridge repository root, a configured Home Assistant connection, and a Home Assistant Core checkout for checking claims. Pull request steps also need gh.
---

# ha-bridge review

Work through these steps in order, skipping those that don't apply, and report after each one the user asks about. Never merge, comment on, or resolve review threads without the user's say so for that change.

## 1. Find the changeset

The changeset is the scope: review and change only what it introduces or makes worse, and read other code only as context. Work out what it is from the request:

- A pull request or branch: `git fetch origin` and check it out. Find a PR's number with `gh pr list --head <branch>`. The changeset is `git diff origin/main...HEAD`, with commits from `git log origin/main..HEAD`.
- Recent commits: the range the user names, such as `git diff <base>..HEAD`.
- Uncommitted work: `git diff` and `git diff --staged`, plus new files from `git status`.

Once the changed files are known, load every other skill that matches them or the work, and apply it within the changeset. That includes this repository's skills, such as `ha-bridge-commands`, `ha-bridge-effect-ha`, `ha-bridge-docs` and `ha-bridge-release`, and any available skills for the languages, frameworks, testing, writing or commits involved. This skill sets the review process; the others set the rules for what's being reviewed.

## 2. Check claims against Home Assistant

Changes often describe Home Assistant behaviour in code comments, schemas and docs. Check each claim against Core before trusting it.

- Read the latest Core, not a stale checkout. Don't pull or switch branches in someone's checkout; `git fetch upstream` (or `origin`) and read from the ref with `git show upstream/dev:<path>` and `git grep <pattern> upstream/dev -- <path>`.
- For action responses, follow the response builder (often in the integration's `services.py` or `helper.py`) and its field lists, not just the dataclass. For new schema literals, confirm the full set of values Core can send, since an unknown value fails the whole decode.
- `git tag --contains <commit>` gives the first Home Assistant release with a change.

## 3. Clean up against the repository's rules

Fix only what the changeset introduces:

- Tests that don't catch a meaningful failure nothing else covers: schema-decoding checks, unit tests that repeat an end-to-end test, tests tied to logic the change removes.
- Unused fields, options or exports the change adds.
- Comments heavier than the surrounding code, and writing that doesn't match the repository's voice.
- Imperative loops where a short expression reads better, and anything that breaks `AGENTS.md`.

Run `mise run check`, `mise run test` and `mise run build`. Commit one coherent change at a time, and commit or push only when the user asked.

## 4. Validate review comments

Review feedback can come from a pull request, or be pasted by the user. On a pull request, read every source, from people and bots alike: review bodies with `gh api repos/timmo001/ha-bridge/pulls/<n>/reviews`, inline comments with `.../pulls/<n>/comments`, and PR comments with `.../issues/<n>/comments`. Skip deploy and status bots. Some bot bodies hold HTML comments; cut at the first `<!--`.

Don't take any review at face value. For each finding, trace the path in the current code and compare with `main`. Say whether it is valid, why, and the smallest fix. Fix only when asked, then rerun the checks above.

## 5. Judge the tests

For every test the changeset adds or keeps, state the failure it catches and whether anything else covers it. To prove a test catches the bug, run it against `main`'s code in a throwaway worktree:

```bash
dir="$(mktemp -d)/main"
git worktree add "$dir" origin/main
cp <test file> "$dir/<same path>"
ln -s "$PWD/node_modules" "$dir/node_modules"
(cd "$dir" && bun test <test file> -t "<name>")
git worktree remove --force "$dir"
```

## 6. Test for real

Unit tests aren't real testing. Run the changes against the user's Home Assistant without touching the installed service:

- `mise run serve:bridge` starts a watch-mode bridge on `$XDG_RUNTIME_DIR/ha-bridge/dev.sock`. Check it connected with `mise run serve:bridge:logs`.
- Point the CLI at it with `HA_BRIDGE_SOCK="$XDG_RUNTIME_DIR/ha-bridge/dev.sock" bun run src/index.ts <command>`.
- Exercise the changed behaviour with real data. Find entity IDs with `search`; targeted commands need an entity, device, area, floor or label.
- Prefer reads. Writes that leave a trace in Home Assistant (logbook entries, events, state changes) need a reason, and the report must say what was left behind. Ask before anything disruptive, such as restarting Home Assistant.
- Stop with `mise run serve:bridge:stop`. If the installed service runs, confirm `systemctl --user is-active ha-bridge` is still `active`.

Report what was exercised, the results, and what couldn't be tested live and why.

## 7. Finish

For a pull request, report CI state (`gh pr view <n> --json mergeable,mergeStateStatus,statusCheckRollup`) and wait. Merge only when the user says so: squash is the only allowed method, with `gh pr merge <n> --squash --delete-branch`.

After a merge, switch to `main`, pull, and delete local branches whose upstream is gone or whose commits are merged. Leave branches checked out in another worktree alone.
