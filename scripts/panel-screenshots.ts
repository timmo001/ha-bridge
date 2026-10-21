// Screenshots the demo panel (mise run panel:demo) in a spread of themes and
// views, for the docs and pull requests. Each shot sets the panel's settings
// over its socket first; the settings it started with are put back at the
// end. Needs Playwright's Chromium: bunx playwright install chromium.
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { Effect, FileSystem, Layer, Path, Stream } from "effect";
import { Command, Flag } from "effect/cli";
import { RpcClient, RpcSerialization } from "effect/rpc";
import { Socket } from "effect/socket";
import { chromium, type Page } from "playwright";
import type { Background, Settings } from "../src/panel/Panel.js";
import { PanelRpcs } from "../src/panel/Rpcs.js";

// A soft, blurred Rosé Pine wash, so the image background needs no network.
const wash = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><defs><filter id="b"><feGaussianBlur stdDeviation="90"/></filter></defs><rect width="1600" height="1000" fill="#191724"/><g filter="url(#b)"><circle cx="300" cy="250" r="320" fill="#eb6f92"/><circle cx="1250" cy="200" r="300" fill="#c4a7e7"/><circle cx="900" cy="850" r="380" fill="#31748f"/><circle cx="150" cy="900" r="250" fill="#f6c177"/></g></svg>`;

const washBackground: Background = {
  kind: "image",
  image: `data:image/svg+xml;base64,${Buffer.from(wash).toString("base64")}`,
  blur: 0,
  dim: 35,
};

interface Shot {
  readonly name: string;
  readonly settings: Partial<Settings>;
  readonly path?: string;
  readonly phone?: boolean;
  readonly fullPage?: boolean;
  readonly act?: (page: Page) => Promise<void>;
}

const shots: ReadonlyArray<Shot> = [
  { name: "panel-dark", settings: { theme: "panel", mode: "dark" } },
  { name: "catppuccin-mocha", settings: { theme: "catppuccin-mocha" } },
  { name: "tokyo-night-storm", settings: { theme: "tokyo-night-storm" } },
  {
    name: "home-assistant-light",
    settings: { theme: "home-assistant", mode: "light" },
  },
  {
    name: "rose-pine-image",
    settings: { theme: "rose-pine", mode: "dark", background: washBackground },
  },
  {
    name: "edit-mode",
    settings: { theme: "nord", mode: "dark" },
    act: async (page) => {
      await page.getByRole("button", { name: "Edit", exact: true }).click();
    },
  },
  {
    name: "light-details",
    settings: { theme: "tokyo-night", mode: "dark" },
    act: async (page) => {
      await page
        .getByRole("button", { name: /^Living room, / })
        .click({ button: "right" });
    },
  },
  {
    name: "entity-picker",
    settings: { theme: "dracula" },
    act: async (page) => {
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await page
        .getByRole("button", { name: "Add tile", exact: true })
        .first()
        .click();
      await page.getByRole("menuitem", { name: /^Entity/ }).click();
    },
  },
  {
    name: "add-tile-menu",
    settings: { theme: "catppuccin-macchiato" },
    act: async (page) => {
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await page
        .getByRole("button", { name: "Add tile", exact: true })
        .first()
        .click();
    },
  },
  {
    name: "command-menu",
    settings: { theme: "tokyo-night-moon" },
    act: async (page) => {
      await page.keyboard.press("Control+k");
      await page.waitForTimeout(500);
      await page.keyboard.type("light");
    },
  },
  {
    name: "settings-appearance",
    settings: { theme: "catppuccin-frappe" },
    path: "settings/appearance",
  },
  {
    name: "settings-themes",
    settings: { theme: "catppuccin-frappe" },
    path: "settings/themes",
    fullPage: true,
  },
  {
    name: "settings-dashboard",
    settings: { theme: "rose-pine-moon" },
    path: "settings/dashboards/home",
  },
  {
    name: "custom-theme",
    settings: { theme: "ocean" },
    path: "settings/themes/ocean",
  },
  {
    name: "phone",
    settings: { theme: "catppuccin-latte", mode: "light" },
    phone: true,
  },
  {
    name: "gruvbox-compact",
    settings: { theme: "gruvbox", mode: "light", density: "compact" },
  },
];

const screenshots = Command.make(
  "panel-screenshots",
  {
    url: Flag.String("url").pipe(
      Flag.withDescription("The demo panel"),
      Flag.withDefault("http://127.0.0.1:7320"),
    ),
    out: Flag.String("out").pipe(
      Flag.withDescription("Directory the screenshots are written to"),
      Flag.withDefault("docs/src/assets/panel"),
    ),
  },
  (input) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const client = yield* RpcClient.make(PanelRpcs);

      const current = Effect.map(
        client.WatchPanel().pipe(Stream.take(1), Stream.runCollect),
        (states) => states[0],
      );

      const initial = yield* current;

      if (initial === undefined) {
        return yield* Effect.die("the panel sent no state");
      }

      // Each shot starts from what the panel had, with its own changes.
      const base: Settings = {
        ...initial.settings,
        accent: "theme",
        density: "comfortable",
        background: { kind: "theme", blur: 0, dim: 30 },
      };

      yield* fs.makeDirectory(input.out, { recursive: true });

      const browser = yield* Effect.acquireRelease(
        Effect.promise(() => chromium.launch()),
        (opened) => Effect.promise(() => opened.close()),
      );

      yield* Effect.forEach(
        shots,
        (shot) =>
          Effect.gen(function* () {
            yield* client.SaveSettings({ ...base, ...shot.settings });

            const file = path.join(input.out, `${shot.name}.jpg`);

            yield* Effect.promise(async () => {
              const page = await browser.newPage({
                viewport: shot.phone
                  ? { width: 390, height: 844 }
                  : { width: 1440, height: 900 },
                deviceScaleFactor: 2,
              });

              await page.goto(new URL(shot.path ?? "", `${input.url}/`).href);
              await page.waitForTimeout(1500);
              await shot.act?.(page);
              await page.waitForTimeout(900);
              await page.screenshot({
                path: file,
                type: "jpeg",
                quality: 88,
                fullPage: shot.fullPage ?? false,
              });
              await page.close();
            });

            yield* Effect.logInfo("Saved", file);
          }),
        { discard: true },
      );

      yield* client.SaveSettings(initial.settings);
    }).pipe(
      Effect.scoped,
      Effect.provide(
        RpcClient.layerProtocolSocket().pipe(
          Layer.provide(RpcSerialization.layerJson),
          Layer.provide(
            Socket.layerWebSocket(
              new URL("rpc", `${input.url.replace(/^http/, "ws")}/`).href,
            ),
          ),
          Layer.provide(Socket.layerWebSocketConstructorGlobal),
        ),
      ),
    ),
);

screenshots.pipe(
  Command.run({ version: "0.0.0" }),
  Effect.provide(BunServices.layer),
  BunRuntime.runMain,
);
