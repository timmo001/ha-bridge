import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import {
  type Dashboard,
  type Section,
  widgetTypes,
} from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { dashboards, deleteDashboard, saveDashboard } from "./client.js";
import { newSection, newWidget, saveSection } from "./edit.js";
import { icon, iconNames } from "./icons.js";
import "./panel-entity-details.js";
import "./panel-sheet.js";
import "./panel-widget-editor.js";
import { widgetLabels } from "./panel-widget-editor.js";
import { close, navigate, open, type Overlay, overlay } from "./state.js";
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
