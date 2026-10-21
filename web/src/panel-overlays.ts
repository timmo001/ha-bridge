import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import type { Dashboard, Section } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { dashboards, saveDashboard } from "./client.js";
import { newSection, newWidget, saveSection } from "./edit.js";
import "./panel-dialog.js";
import "./panel-entity-details.js";
import "./panel-widget-editor.js";
import { settingsStyles, textField } from "./settings/parts.js";
import { close, type Overlay, overlay } from "./state.js";
import { controls } from "./ui.js";

// Whichever dialog is open over the page: an entity's details, or the tile
// or section editor.
@customElement("panel-overlays")
export class PanelOverlays extends LitElement {
  static override styles = [
    controls,
    settingsStyles,
    css`
      :host {
        display: contents;
      }

      .form {
        display: grid;
        gap: var(--pn-space-6);
      }

      .grow-spacer {
        flex: 1;
      }
    `,
  ];

  readonly #overlay = new AtomController(this, () => overlay);

  readonly #dashboards = new AtomController(this, () => dashboards);

  // The section being edited, for the open dialog.
  @state() accessor sectionDraft: Section | undefined;

  #shown: Overlay | undefined;

  override willUpdate() {
    const current = this.#overlay.value;

    if (current === this.#shown) {
      return;
    }

    this.#shown = current;
    this.sectionDraft =
      current.kind === "section"
        ? (this.#find(current.dashboardId)?.sections.find(
            ({ id }) => id === current.sectionId,
          ) ?? newSection(""))
        : undefined;
  }

  #find(id: string) {
    return this.#dashboards.value?.find((dashboard) => dashboard.id === id);
  }

  #renderSection(dashboard: Dashboard, draft: Section) {
    const exists = dashboard.sections.some(({ id }) => id === draft.id);

    const set = (next: Section) => {
      this.sectionDraft = next;
    };

    return html`<panel-dialog
      heading=${exists ? "Edit section" : "New section"}
      keep
    >
      <div class="form">
        ${textField(
          "Title",
          draft.title,
          (title) => set({ ...draft, title }),
          "Living room",
        )}
        ${textField(
          "Subtitle",
          draft.subtitle ?? "",
          (subtitle) =>
            set({ ...draft, subtitle: subtitle === "" ? undefined : subtitle }),
          "Optional",
        )}
        <div class="field">
          <span>Columns</span>
          <div class="segmented" role="group" aria-label="Columns">
            ${[1, 2, 3, 4, 5, 6].map(
              (columns) =>
                html`<button
                  aria-pressed=${draft.columns === columns ? "true" : "false"}
                  @click=${() => set({ ...draft, columns })}
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
    </panel-dialog>`;
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
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-overlays": PanelOverlays;
  }
}
