import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import type {
  Background,
  Density,
  Mode,
  Settings,
} from "../../../src/panel/Panel.js";
import { AtomController, registry } from "../AtomController.js";
import { saveSettings, settings } from "../client.js";
import { icon } from "../icons.js";
import "../panel-background-editor.js";
import { href, navigate } from "../state.js";
import { accents, hasBothSchemes, themes } from "../themes.js";
import { controls } from "../ui.js";
import { item, settingsStyles, toggle } from "./parts.js";

const modes: ReadonlyArray<readonly [Mode, string, string]> = [
  ["system", "System", "monitor"],
  ["light", "Light", "sun"],
  ["dark", "Dark", "moon"],
];

const densities: ReadonlyArray<readonly [Density, string]> = [
  ["comfortable", "Comfortable"],
  ["compact", "Compact"],
];

// How the panel looks and behaves, apart from the theme itself.
@customElement("settings-appearance")
export class SettingsAppearance extends LitElement {
  static override styles = [
    controls,
    settingsStyles,
    css`
      .swatches {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pn-space-2);
      }

      .swatch {
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: 2px solid transparent;
        border-radius: 50%;
        background-clip: padding-box;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 10%);
        transition: transform var(--pn-fast) var(--pn-ease);
      }

      .swatch:hover {
        transform: scale(1.1);
      }

      .swatch[aria-pressed="true"] {
        outline: 2px solid var(--pn-text);
        outline-offset: 2px;
      }

      .theme-accent {
        background: conic-gradient(
          var(--pn-accent) 0 50%,
          var(--pn-surface-sunken) 0
        );
      }

      .current {
        display: inline-flex;
        align-items: center;
        gap: var(--pn-space-2);
      }
    `,
  ];

  readonly #settings = new AtomController(this, () => settings);

  #save(patch: Partial<Settings>) {
    registry.set(saveSettings, { ...this.#settings.value, ...patch });
  }

  override render() {
    const current = this.#settings.value;
    const builtIn = themes.find(({ id }) => id === current.theme);
    const custom = current.customThemes.find(({ id }) => id === current.theme);

    const followsMode =
      custom === undefined &&
      (builtIn === undefined || hasBothSchemes(builtIn));

    const onlyDark =
      custom === undefined
        ? builtIn?.dark !== undefined
        : custom.scheme === "dark";

    const themesPage = { page: "settings", section: "themes" } as const;

    return html`
      <h2>Appearance</h2>
      <section class="card">
        ${item(
          "Theme",
          custom?.name ?? builtIn?.name ?? "Panel",
          html`<a
            class="button"
            href=${href(themesPage)}
            @click=${(event: MouseEvent) => {
              event.preventDefault();
              navigate(themesPage);
            }}
            >${icon("sparkles")} Choose a theme</a
          >`,
        )}
        ${item(
          "Mode",
          followsMode
            ? "Follow the device, or always light or dark"
            : `This theme is only ${onlyDark ? "dark" : "light"}`,
          html`<div class="segmented" role="group" aria-label="Mode">
            ${modes.map(
              ([mode, label, name]) =>
                html`<button
                  aria-pressed=${current.mode === mode ? "true" : "false"}
                  ?disabled=${!followsMode}
                  @click=${() => this.#save({ mode })}
                >
                  ${icon(name)} ${label}
                </button>`,
            )}
          </div>`,
        )}
        ${item(
          "Accent",
          "The colour of anything that's on: the theme's own, or another",
          html`<div class="swatches" role="group" aria-label="Accent">
            <button
              class="swatch theme-accent"
              title="Theme"
              aria-label="Theme"
              aria-pressed=${current.accent === "theme" ? "true" : "false"}
              @click=${() => this.#save({ accent: "theme" })}
            ></button>
            ${accents.map(
              ([accent, hue, chroma]) =>
                html`<button
                  class="swatch"
                  title=${accent}
                  aria-label=${accent}
                  aria-pressed=${current.accent === accent ? "true" : "false"}
                  style="background: oklch(72% ${chroma} ${hue})"
                  @click=${() => this.#save({ accent })}
                ></button>`,
            )}
          </div>`,
        )}
        ${item(
          "Density",
          "How tall tiles are and how close together",
          html`<div class="segmented" role="group" aria-label="Density">
            ${densities.map(
              ([density, label]) =>
                html`<button
                  aria-pressed=${current.density === density ? "true" : "false"}
                  @click=${() => this.#save({ density })}
                >
                  ${label}
                </button>`,
            )}
          </div>`,
        )}
        ${item(
          "24-hour clock",
          "Show times as 18:30 rather than 6:30 PM",
          toggle(current.clock24h, "24-hour clock", (clock24h) =>
            this.#save({ clock24h }),
          ),
        )}
        ${item(
          "Kiosk mode",
          "Hide navigation and editing, for a wall tablet. Open /settings to turn it off.",
          toggle(current.kiosk, "Kiosk mode", (kiosk) => this.#save({ kiosk })),
        )}
      </section>
      <h3>Background</h3>
      <p class="lead">
        Behind every dashboard, unless a dashboard sets its own.
      </p>
      <section class="card padded">
        <panel-background-editor
          .value=${current.background}
          @background-change=${(event: CustomEvent<Background>) =>
            this.#save({ background: event.detail })}
        ></panel-background-editor>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-appearance": SettingsAppearance;
  }
}
