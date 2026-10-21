import { css, html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { Dashboard, Section, Widget } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { dashboards, saveDashboard } from "./client.js";
import { newSection, newWidget, saveSection } from "./edit.js";
import "./panel-dialog.js";
import "./panel-entity-details.js";
import "./panel-widget-editor.js";
import { settingsStyles, textField } from "./settings/parts.js";
import { close, type Overlay, overlays } from "./state.js";
import { controls } from "./ui.js";

// Every open dialog, oldest first: an entity's details, or the tile or
// section editor. One opened from another stacks on it.
@customElement("panel-overlays")
export class PanelOverlays extends LitElement {
  static override styles = [
    controls,
    settingsStyles,
    css`
      :host,
      .view {
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

  readonly #overlays = new AtomController(this, () => overlays);

  readonly #dashboards = new AtomController(this, () => dashboards);

  // The section being edited in each open section dialog.
  readonly #sections = new Map<Overlay, Section>();

  // New tiles, made once per view so their IDs stay put between renders.
  readonly #newWidgets = new WeakMap<Overlay, Widget>();

  override willUpdate() {
    const stack = this.#overlays.value;

    for (const view of this.#sections.keys()) {
      if (!stack.includes(view)) {
        this.#sections.delete(view);
      }
    }

    for (const view of stack) {
      if (view.kind === "section" && !this.#sections.has(view)) {
        this.#sections.set(
          view,
          this.#find(view.dashboardId)?.sections.find(
            ({ id }) => id === view.sectionId,
          ) ?? newSection(""),
        );
      }
    }
  }

  #find(id: string) {
    return this.#dashboards.value?.find((dashboard) => dashboard.id === id);
  }

  #renderSection(view: Overlay, dashboard: Dashboard, draft: Section) {
    const exists = dashboard.sections.some(({ id }) => id === draft.id);

    const set = (next: Section) => {
      this.#sections.set(view, next);
      this.requestUpdate();
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
      <button slot="footer" class="button" @click=${() => close(view)}>
        Cancel
      </button>
      <button
        slot="footer"
        class="button primary"
        @click=${() => {
          registry.set(saveDashboard, saveSection(dashboard, draft));
          close(view);
        }}
      >
        Save
      </button>
    </panel-dialog>`;
  }

  #renderView(view: Overlay) {
    switch (view.kind) {
      case "none":
        return nothing;
      case "details":
        return html`<panel-entity-details
          .entityId=${view.entityId}
        ></panel-entity-details>`;
      case "widget": {
        const dashboard = this.#find(view.dashboardId);

        const existing = dashboard?.sections
          .flatMap((section) => section.widgets)
          .find(({ id }) => id === view.widgetId);

        let widget = existing ?? this.#newWidgets.get(view);

        if (widget === undefined && view.type !== undefined) {
          widget = newWidget(view.type);
          this.#newWidgets.set(view, widget);
        }

        return widget === undefined
          ? nothing
          : html`<panel-widget-editor
              .dashboard=${dashboard}
              .sectionId=${view.sectionId}
              .widget=${widget}
              .saved=${existing !== undefined}
            ></panel-widget-editor>`;
      }

      case "section": {
        const dashboard = this.#find(view.dashboardId);
        const draft = this.#sections.get(view);

        return dashboard === undefined || draft === undefined
          ? nothing
          : this.#renderSection(view, dashboard, draft);
      }
    }
  }

  override render() {
    return repeat(
      this.#overlays.value,
      (view) => view,
      (view) =>
        html`<div class="view" @dialog-close=${() => close(view)}>
          ${this.#renderView(view)}
        </div>`,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-overlays": PanelOverlays;
  }
}
