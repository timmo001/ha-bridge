// Renders theme.json as Blume's tokens into theme.css, between the theme
// markers, failing on any contrast miss. Runs before dev, build and check.
import { readFile, writeFile } from "node:fs/promises";

import {
  blumeThemeCss,
  parseTheme,
  runtimeTheme,
} from "@timmo001/groundwork-tokens/runtime";

const start = "/* theme.json, rendered by scripts/theme.ts: start */";
const end = "/* theme.json, rendered by scripts/theme.ts: end */";

const parsed = parseTheme(await readFile("theme.json", "utf8"));

if (parsed._tag === "Failure") throw new Error(String(parsed.failure));

const { theme, checks } = runtimeTheme(parsed.success);
const misses = checks.filter((check) => !check.passes);

if (misses.length > 0) {
  const lines = misses.map(
    ({ mode, role, ratio, target }) =>
      `  ${mode} ${role}: ${ratio.toFixed(2)} (needs ${target})`,
  );

  throw new Error(`theme.json misses contrast:\n${lines.join("\n")}`);
}

const css = await readFile("theme.css", "utf8");
const from = css.indexOf(start);
const to = css.indexOf(end);

if (from === -1 || to < from) {
  throw new Error("theme.css is missing the theme markers");
}

const rendered = `${css.slice(0, from + start.length)}\n${blumeThemeCss(theme)}\n${css.slice(to)}`;

if (rendered !== css) await writeFile("theme.css", rendered);
