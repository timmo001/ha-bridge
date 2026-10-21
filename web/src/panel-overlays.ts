import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import { styleMap } from "lit/directives/style-map.js";
import {
  type Background,
  type CustomTheme,
  type Dashboard,
  type Section,
  widgetTypes,
} from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import {
  dashboards,
  deleteDashboard,
  saveDashboard,
  saveSettings,
  settings,
} from "./client.js";
import { newId, newSection, newWidget, saveSection } from "./edit.js";
import { icon, iconNames } from "./icons.js";
import "./panel-background-editor.js";
import "./panel-entity-details.js";
import "./panel-sheet.js";
import "./panel-widget-editor.js";
import { widgetLabels } from "./panel-widget-editor.js";
import { close, navigate, open, type Overlay, overlay } from "./state.js";
import { customPalette } from "./themes.js";
import { controls } from "./ui.js";

// Whichever sheet is open: an entity's details or one of the editors.
@customElement("panel-overlays")
export class PanelOverlays extends LitElement {
  static override styles = [
    controls,
    css`
      .types {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
        gap: var(--pn-space-3);
      }

      .type {
        display: grid;
        gap: var(--pn-space-3);
        padding: var(--pn-space-4);
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

      .type:hover {
        border-color: var(--pn-accent);
        box-shadow: var(--pn-shadow-m);
        transform: translateY(-1px);
      }

      .type .chip {
        display: grid;
        place-items: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--pn-radius-m);
        background: var(--pn-accent-soft);
        color: var(--pn-accent-strong);
      }

      .type strong {
        font-size: var(--pn-text-m);
      }

      .type span {
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
        line-height: 1.4;
      }

      .form {
        display: grid;
        gap: var(--pn-space-6);
      }

      .icons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
        gap: var(--pn-space-1);
        max-height: 14rem;
        overflow-y: auto;
        padding: var(--pn-space-1);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-m);
        scrollbar-width: thin;
      }

      .icons button {
        display: grid;
        place-items: center;
        aspect-ratio: 1;
        border: none;
        border-radius: var(--pn-radius-s);
        background: transparent;
        color: var(--pn-text-muted);
        cursor: pointer;
      }

      .icons button:hover {
        background: var(--pn-surface-hover);
      }

      .icons button[aria-pressed="true"] {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
      }

      .theme-preview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--pn-space-3);
        padding: var(--pn-space-5);
        border-radius: var(--pn-radius-xl);
        background: var(--bg);
        box-shadow: inset 0 0 0 1px var(--pn-border);
      }

      .theme-preview .tile {
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

      .theme-preview .tile small {
        display: block;
        opacity: 0.65;
        font-weight: 500;
      }

      .theme-preview .chip {
        display: grid;
        place-items: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--pn-radius-m);
        background: color-mix(in oklch, var(--text) 10%, transparent);
      }

      .theme-preview .on .chip {
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

      .grow-spacer {
        flex: 1;
      }
    `,
  ];

  readonly #overlay = new AtomController(this, () => overlay);

  readonly #dashboards = new AtomController(this, () => dashboards);

  // The section or dashboard form being edited, for the open sheet.
  @state() accessor sectionDraft: Section | undefined;

  @state() accessor dashboardDraft: Dashboard | undefined;

  @state() accessor themeDraft: CustomTheme | undefined;

  readonly #settings = new AtomController(this, () => settings);

  #shown: Overlay | undefined;

  override willUpdate() {
    const current = this.#overlay.value;

    if (current === this.#shown) {
      return;
    }

    this.#shown = current;

    const dashboard = this.#find(
      "dashboardId" in current ? current.dashboardId : undefined,
    );

    this.sectionDraft =
      current.kind === "section"
        ? (dashboard?.sections.find(({ id }) => id === current.sectionId) ??
          newSection(""))
        : undefined;
    this.dashboardDraft = current.kind === "dashboard" ? dashboard : undefined;
    this.themeDraft =
      current.kind === "theme"
        ? (this.#settings.value.customThemes.find(
            ({ id }) => id === current.themeId,
          ) ?? {
            id: newId(),
            name: "My theme",
            scheme: "dark",
            background: "#14161c",
            card: "#1d2029",
            text: "#e8eaf0",
            accent: "#7aa2f7",
          })
        : undefined;
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

  #renderTheme(draft: CustomTheme) {
    const current = this.#settings.value;
    const exists = current.customThemes.some(({ id }) => id === draft.id);
    const palette = customPalette(draft);

    return html`<panel-sheet heading=${exists ? "Edit theme" : "New theme"}>
      <div class="form">
        <div
          class="theme-preview"
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
        </div>
        ${this.#input("Name", draft.name, (name) => {
          this.themeDraft = { ...draft, name };
        })}
        <div class="field">
          <span>Kind</span>
          <div class="segmented" role="group" aria-label="Kind">
            ${(["light", "dark"] as const).map(
              (scheme) =>
                html`<button
                  aria-pressed=${draft.scheme === scheme ? "true" : "false"}
                  @click=${() => {
                    this.themeDraft = { ...draft, scheme };
                  }}
                >
                  ${scheme === "light" ? "Light" : "Dark"}
                </button>`,
            )}
          </div>
          <small>Sets shadows and how browser controls look.</small>
        </div>
        <div class="colours">
          ${this.#colour("Background", draft.background, (background) => {
            this.themeDraft = { ...draft, background };
          })}
          ${this.#colour("Cards", draft.card, (card) => {
            this.themeDraft = { ...draft, card };
          })}
          ${this.#colour("Text", draft.text, (text) => {
            this.themeDraft = { ...draft, text };
          })}
          ${this.#colour("Accent", draft.accent, (accent) => {
            this.themeDraft = { ...draft, accent };
          })}
        </div>
      </div>
      ${
        exists
          ? html`<button
              slot="footer"
              class="button danger"
              @click=${() => {
                registry.set(saveSettings, {
                  ...current,
                  theme: current.theme === draft.id ? "panel" : current.theme,
                  customThemes: current.customThemes.filter(
                    ({ id }) => id !== draft.id,
                  ),
                });
                close();
              }}
            >
              ${icon("trash")} Delete
            </button>`
          : nothing
      }
      <span slot="footer" class="grow-spacer"></span>
      <button slot="footer" class="button" @click=${() => close()}>
        Cancel
      </button>
      <button
        slot="footer"
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
          close();
        }}
      >
        ${exists ? "Save" : "Create and use"}
      </button>
    </panel-sheet>`;
  }

  #find(id: string | undefined) {
    return id === undefined
      ? undefined
      : this.#dashboards.value?.find((dashboard) => dashboard.id === id);
  }

  #input(
    label: string,
    value: string,
    onInput: (value: string) => void,
    placeholder = "",
  ) {
    return html`<label class="field">
      <span>${label}</span>
      <input
        type="text"
        .value=${value}
        placeholder=${placeholder}
        @input=${(event: InputEvent) => {
          if (event.target instanceof HTMLInputElement) {
            onInput(event.target.value);
          }
        }}
      />
    </label>`;
  }

  #renderSection(dashboard: Dashboard, draft: Section) {
    const exists = dashboard.sections.some(({ id }) => id === draft.id);

    return html`<panel-sheet heading=${exists ? "Edit section" : "New section"}>
      <div class="form">
        ${this.#input(
          "Title",
          draft.title,
          (title) => {
            this.sectionDraft = { ...draft, title };
          },
          "Living room",
        )}
        ${this.#input(
          "Subtitle",
          draft.subtitle ?? "",
          (subtitle) => {
            this.sectionDraft = {
              ...draft,
              subtitle: subtitle === "" ? undefined : subtitle,
            };
          },
          "Optional",
        )}
        <div class="field">
          <span>Columns</span>
          <div class="segmented" role="group" aria-label="Columns">
            ${[1, 2, 3, 4, 5, 6].map(
              (columns) =>
                html`<button
                  aria-pressed=${draft.columns === columns ? "true" : "false"}
                  @click=${() => {
                    this.sectionDraft = { ...draft, columns };
                  }}
                >
                  ${columns}
                </button>`,
            )}
          </div>
          <small>The most tiles side by side. Narrow screens show fewer.</small>
        </div>
      </div>
      <span slot="footer" class="grow-spacer"></span>
      <button slot="footer" class="button" @click=${() => close()}>
        Cancel
      </button>
      <button
        slot="footer"
        class="button primary"
        @click=${() => {
          registry.set(saveDashboard, saveSection(dashboard, draft));
          close();
        }}
      >
        Save
      </button>
    </panel-sheet>`;
  }

  #renderDashboard(draft: Dashboard) {
    const list = this.#dashboards.value ?? [];

    return html`<panel-sheet heading="Dashboard">
      <div class="form">
        ${this.#input("Name", draft.name, (name) => {
          this.dashboardDraft = { ...draft, name };
        })}
        <div class="field">
          <span>Icon</span>
          <div class="icons" role="group" aria-label="Icon">
            ${iconNames.map(
              (name) =>
                html`<button
                  title=${name}
                  aria-pressed=${draft.icon === name ? "true" : "false"}
                  @click=${() => {
                    this.dashboardDraft = { ...draft, icon: name };
                  }}
                >
                  ${icon(name)}
                </button>`,
            )}
          </div>
        </div>
        <div class="field">
          <span class="spread">
            <span>Own background</span>
            <button
              class="switch"
              role="switch"
              aria-label="Own background"
              aria-checked=${draft.background === undefined ? "false" : "true"}
              @click=${() => {
                this.dashboardDraft = {
                  ...draft,
                  background:
                    draft.background === undefined
                      ? this.#settings.value.background
                      : undefined,
                };
              }}
            ></button>
          </span>
          <small>Otherwise this dashboard uses the panel's background.</small>
        </div>
        ${
          draft.background === undefined
            ? nothing
            : html`<panel-background-editor
                .value=${draft.background}
                @background-change=${(event: CustomEvent<Background>) => {
                  this.dashboardDraft = { ...draft, background: event.detail };
                }}
              ></panel-background-editor>`
        }
      </div>
      <button
        slot="footer"
        class="button danger"
        @click=${() => {
          if (confirm(`Delete ${draft.name} and everything on it?`)) {
            registry.set(deleteDashboard, draft.id);
            const next = list.find(({ id }) => id !== draft.id);
            navigate({ page: "dashboard", id: next?.id });
            close();
          }
        }}
      >
        ${icon("trash")} Delete
      </button>
      <span slot="footer" class="grow-spacer"></span>
      <button slot="footer" class="button" @click=${() => close()}>
        Cancel
      </button>
      <button
        slot="footer"
        class="button primary"
        ?disabled=${draft.name.trim() === ""}
        @click=${() => {
          registry.set(saveDashboard, { ...draft, name: draft.name.trim() });
          close();
        }}
      >
        Save
      </button>
    </panel-sheet>`;
  }

  override render() {
    const current = this.#overlay.value;

    switch (current.kind) {
      case "none":
        return nothing;
      case "details":
        return keyed(
          current.entityId,
          html`<panel-entity-details
            .entityId=${current.entityId}
          ></panel-entity-details>`,
        );
      case "add-widget":
        return html`<panel-sheet heading="Add a tile" bare>
          <div class="types">
            ${widgetTypes.map((type) => {
              const label = widgetLabels[type];

              return html`<button
                class="type"
                @click=${() =>
                  open({
                    kind: "widget",
                    dashboardId: current.dashboardId,
                    sectionId: current.sectionId,
                    type,
                  })}
              >
                <span class="chip">${icon(label.icon)}</span>
                <strong>${label.name}</strong>
                <span>${label.about}</span>
              </button>`;
            })}
          </div>
        </panel-sheet>`;
      case "widget": {
        const dashboard = this.#find(current.dashboardId);

        const existing = dashboard?.sections
          .flatMap((section) => section.widgets)
          .find(({ id }) => id === current.widgetId);

        const widget =
          existing ??
          (current.type === undefined ? undefined : newWidget(current.type));

        return widget === undefined
          ? nothing
          : keyed(
              `${current.widgetId ?? current.type}`,
              html`<panel-widget-editor
                .dashboard=${dashboard}
                .sectionId=${current.sectionId}
                .widget=${widget}
                .saved=${existing !== undefined}
              ></panel-widget-editor>`,
            );
      }

      case "section": {
        const dashboard = this.#find(current.dashboardId);

        return dashboard === undefined || this.sectionDraft === undefined
          ? nothing
          : this.#renderSection(dashboard, this.sectionDraft);
      }

      case "theme":
        return this.themeDraft === undefined
          ? nothing
          : this.#renderTheme(this.themeDraft);
      case "dashboard":
        return this.dashboardDraft === undefined
          ? nothing
          : this.#renderDashboard(this.dashboardDraft);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-overlays": PanelOverlays;
  }
}
