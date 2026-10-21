import { css, html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Settings } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { saveSettings, settings } from "./client.js";
import { icon } from "./icons.js";
import { open } from "./state.js";
import {
  customPalette,
  type Palette,
  type ThemeDefinition,
  themes,
} from "./themes.js";
import { controls } from "./ui.js";

const families = [...new Set(themes.map(({ family }) => family))];

// A small picture of a palette: its background, a card and the accent.
const swatch = (palette: Palette) =>
  html`<span
    class="swatch"
    style=${styleMap({
      "--bg": palette.background,
      "--card": palette.card,
      "--text": palette.text,
      "--accent": palette.accent,
    })}
  >
    <span class="mini-card">
      <span class="dot"></span>
      <span class="line"></span>
      <span class="line short"></span>
    </span>
  </span>`;

// Every theme, grouped by family, each shown in its own colours. Picking one
// saves it at once.
@customElement("panel-theme-picker")
export class PanelThemePicker extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: grid;
        gap: var(--pn-space-5);
      }

      .family {
        display: grid;
        gap: var(--pn-space-2);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
        gap: var(--pn-space-3);
      }

      .theme {
        display: grid;
        gap: var(--pn-space-2);
        padding: var(--pn-space-2);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface-solid);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          border-color var(--pn-fast) var(--pn-ease),
          box-shadow var(--pn-fast) var(--pn-ease),
          transform var(--pn-fast) var(--pn-ease);
      }

      .theme:hover {
        border-color: var(--pn-border-strong);
        box-shadow: var(--pn-shadow-m);
        transform: translateY(-1px);
      }

      .theme[aria-pressed="true"] {
        border-color: var(--pn-accent);
        box-shadow: 0 0 0 3px var(--pn-accent-soft);
      }

      .preview {
        display: flex;
        height: 4.25rem;
        overflow: hidden;
        border-radius: var(--pn-radius-m);
        box-shadow: inset 0 0 0 1px var(--pn-border);
      }

      .swatch {
        position: relative;
        flex: 1;
        background: var(--bg);
      }

      .mini-card {
        position: absolute;
        inset: 0.625rem 0.625rem auto;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.25rem 0.375rem;
        align-items: center;
        padding: 0.4rem;
        border-radius: 0.45rem;
        background: var(--card);
      }

      .dot {
        grid-row: span 2;
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 0.3rem;
        background: var(--accent);
      }

      .line {
        height: 0.25rem;
        border-radius: 1px;
        background: var(--text);
        opacity: 0.7;
      }

      .line.short {
        width: 55%;
        opacity: 0.35;
      }

      .label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--pn-space-2);
        padding: 0 var(--pn-space-1);
        font-size: var(--pn-text-s);
        font-weight: 560;
      }

      .label small {
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
        font-weight: 500;
      }

      .custom {
        position: relative;
        display: grid;
      }

      .edit {
        position: absolute;
        top: 0.875rem;
        right: 0.875rem;
        background: var(--pn-surface-solid);
        box-shadow: var(--pn-shadow-s);
      }

      .new {
        display: grid;
        place-items: center;
        align-content: center;
        gap: var(--pn-space-1);
        min-height: 6.5rem;
        border-style: dashed;
        color: var(--pn-text-muted);
        text-align: center;
      }
    `,
  ];

  readonly #settings = new AtomController(this, () => settings);

  #pick(theme: string) {
    registry.set(saveSettings, { ...this.#settings.value, theme });
  }

  #scheme(theme: ThemeDefinition) {
    return theme.light !== undefined && theme.dark !== undefined
      ? "Light & dark"
      : theme.dark !== undefined
        ? "Dark"
        : "Light";
  }

  #renderTheme(current: Settings, theme: ThemeDefinition) {
    return html`<button
      class="theme"
      aria-pressed=${current.theme === theme.id ? "true" : "false"}
      @click=${() => this.#pick(theme.id)}
    >
      <span class="preview">
        ${theme.light === undefined ? nothing : swatch(theme.light)}
        ${theme.dark === undefined ? nothing : swatch(theme.dark)}
      </span>
      <span class="label">
        <span>${theme.name}</span>
        <small>${this.#scheme(theme)}</small>
      </span>
    </button>`;
  }

  override render() {
    const current = this.#settings.value;

    return html`
      ${families.map(
        (family) =>
          html`<div class="family">
            <span class="eyebrow">${family}</span>
            <div class="grid">
              ${themes
                .filter((theme) => theme.family === family)
                .map((theme) => this.#renderTheme(current, theme))}
            </div>
          </div>`,
      )}
      <div class="family">
        <span class="eyebrow">Custom</span>
        <div class="grid">
          ${current.customThemes.map(
            (theme) =>
              html`<div class="custom">
                <button
                  class="theme"
                  aria-pressed=${current.theme === theme.id ? "true" : "false"}
                  @click=${() => this.#pick(theme.id)}
                >
                  <span class="preview">${swatch(customPalette(theme))}</span>
                  <span class="label">
                    <span>${theme.name}</span>
                    <small>${theme.scheme === "dark" ? "Dark" : "Light"}</small>
                  </span>
                </button>
                <button
                  class="icon-button small edit"
                  title="Edit ${theme.name}"
                  @click=${() => open({ kind: "theme", themeId: theme.id })}
                >
                  ${icon("pencil")}
                </button>
              </div>`,
          )}
          <button class="theme new" @click=${() => open({ kind: "theme" })}>
            ${icon("plus")}
            <span>New theme</span>
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-theme-picker": PanelThemePicker;
  }
}
