import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { CustomTheme } from "../../../src/panel/Panel.js";
import { AtomController, registry } from "../AtomController.js";
import { saveSettings, settings } from "../client.js";
import { newId } from "../edit.js";
import { icon } from "../icons.js";
import "../panel-theme-picker.js";
import { href, navigate } from "../state.js";
import { customPalette } from "../themes.js";
import { controls } from "../ui.js";
import { settingsStyles, textField } from "./parts.js";

const newTheme = (): CustomTheme => ({
  id: newId(),
  name: "My theme",
  scheme: "dark",
  background: "#14161c",
  card: "#1d2029",
  text: "#e8eaf0",
  accent: "#7aa2f7",
});

const themesPage = { page: "settings", section: "themes" } as const;

// Every theme, and a page for each custom theme at /settings/themes/<id>,
// or /settings/themes/new to make one.
@customElement("settings-themes")
export class SettingsThemes extends LitElement {
  static override styles = [
    controls,
    settingsStyles,
    css`
      .preview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
        gap: var(--pn-space-3);
        padding: var(--pn-space-6);
        border-radius: var(--pn-radius-xl);
        background: var(--bg);
        box-shadow: inset 0 0 0 1px var(--pn-border);
      }

      .preview .tile {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        padding: var(--pn-space-3);
        border-radius: var(--pn-radius-l);
        background: var(--card);
        color: var(--text);
        font-size: var(--pn-text-s);
        font-weight: 600;
      }

      .preview .tile small {
        display: block;
        opacity: 0.65;
        font-weight: 500;
      }

      .preview .chip {
        display: grid;
        place-items: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--pn-radius-m);
        background: color-mix(in oklab, var(--text) 10%, transparent);
      }

      .preview .on .chip {
        background: var(--accent);
        color: var(--on-accent);
      }

      .colours {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
        gap: var(--pn-space-3);
      }

      .colour {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        padding: var(--pn-space-2);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-m);
        cursor: pointer;
      }

      .colour input {
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        border: none;
        border-radius: var(--pn-radius-s);
        background: none;
        cursor: pointer;
      }

      .colour small {
        display: block;
        color: var(--pn-text-faint);
        font-family: var(--pn-font-mono);
        font-size: var(--pn-text-2xs);
      }
    `,
  ];

  // A custom theme's ID, or "new"; the gallery without one.
  @property() accessor themeId: string | undefined;

  @state() accessor draft: CustomTheme | undefined;

  readonly #settings = new AtomController(this, () => settings);

  #editing: string | undefined;

  override willUpdate() {
    if (this.themeId === this.#editing) {
      return;
    }

    this.#editing = this.themeId;
    this.draft =
      this.themeId === undefined
        ? undefined
        : (this.#settings.value.customThemes.find(
            ({ id }) => id === this.themeId,
          ) ?? newTheme());
  }

  #colour(label: string, value: string, onInput: (value: string) => void) {
    return html`<label class="colour">
      <input
        type="color"
        .value=${value}
        @input=${(event: InputEvent) => {
          if (event.target instanceof HTMLInputElement) {
            onInput(event.target.value);
          }
        }}
      />
      <span>
        <strong>${label}</strong>
        <small>${value}</small>
      </span>
    </label>`;
  }

  #renderEditor(draft: CustomTheme) {
    const current = this.#settings.value;
    const exists = current.customThemes.some(({ id }) => id === draft.id);
    const palette = customPalette(draft);

    const set = (patch: Partial<CustomTheme>) => {
      this.draft = { ...draft, ...patch };
    };

    return html`
      <a
        class="back"
        href=${href(themesPage)}
        @click=${(event: MouseEvent) => {
          event.preventDefault();
          navigate(themesPage);
        }}
        >${icon("chevron-left")} Themes</a
      >
      <h2>${exists ? draft.name : "New theme"}</h2>
      <div
        class="preview"
        style=${styleMap({
          "--bg": palette.background,
          "--card": palette.card,
          "--text": palette.text,
          "--accent": palette.accent,
          "--on-accent": palette.onAccent,
        })}
      >
        <span class="tile on">
          <span class="chip">${icon("lightbulb")}</span>
          <span>Lamp<small>On</small></span>
        </span>
        <span class="tile">
          <span class="chip">${icon("thermometer")}</span>
          <span>Hall<small>21.5 °C</small></span>
        </span>
        <span class="tile on">
          <span class="chip">${icon("music")}</span>
          <span>Speaker<small>Playing</small></span>
        </span>
      </div>
      <section class="card padded">
        ${textField("Name", draft.name, (name) => set({ name }))}
        <div class="field">
          <span>Kind</span>
          <div class="segmented" role="group" aria-label="Kind">
            ${(["light", "dark"] as const).map(
              (scheme) =>
                html`<button
                  aria-pressed=${draft.scheme === scheme ? "true" : "false"}
                  @click=${() => set({ scheme })}
                >
                  ${scheme === "light" ? "Light" : "Dark"}
                </button>`,
            )}
          </div>
          <small>Sets shadows and how browser controls look.</small>
        </div>
        <div class="colours">
          ${this.#colour("Background", draft.background, (background) =>
            set({ background }),
          )}
          ${this.#colour("Cards", draft.card, (card) => set({ card }))}
          ${this.#colour("Text", draft.text, (text) => set({ text }))}
          ${this.#colour("Accent", draft.accent, (accent) => set({ accent }))}
        </div>
      </section>
      <div class="actions">
        ${
          exists
            ? html`<button
                class="button danger"
                @click=${() => {
                  registry.set(saveSettings, {
                    ...current,
                    theme: current.theme === draft.id ? "panel" : current.theme,
                    customThemes: current.customThemes.filter(
                      ({ id }) => id !== draft.id,
                    ),
                  });
                  navigate(themesPage);
                }}
              >
                ${icon("trash")} Delete
              </button>`
            : nothing
        }
        <span class="spacer"></span>
        <button class="button" @click=${() => navigate(themesPage)}>
          Cancel
        </button>
        <button
          class="button primary"
          ?disabled=${draft.name.trim() === ""}
          @click=${() => {
            const saved = { ...draft, name: draft.name.trim() };

            registry.set(saveSettings, {
              ...current,
              theme: saved.id,
              customThemes: exists
                ? current.customThemes.map((theme) =>
                    theme.id === saved.id ? saved : theme,
                  )
                : [...current.customThemes, saved],
            });
            navigate(themesPage);
          }}
        >
          ${exists ? "Save" : "Create and use"}
        </button>
      </div>
    `;
  }

  override render() {
    if (this.draft !== undefined) {
      return this.#renderEditor(this.draft);
    }

    return html`
      <h2>Themes</h2>
      <p class="lead">
        Each theme is shown in its own colours. Picking one applies it to every
        screen showing the panel.
      </p>
      <section class="card padded">
        <panel-theme-picker></panel-theme-picker>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-themes": SettingsThemes;
  }
}
