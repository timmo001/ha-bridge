import { css, html, LitElement, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { Dashboard, Section } from "../../src/panel/Panel.js";
import { registry } from "./AtomController.js";
import { type EntityMap, saveDashboard } from "./client.js";
import { moveSection, placeWidget, removeSection } from "./edit.js";
import { icon } from "./icons.js";
import "./panel-widget.js";
import { open } from "./state.js";
import { controls } from "./ui.js";

// The grid fits as many 9.5rem columns as the section has room for, up to
// the section's own count, and a widget never spans more than there are.
// Container queries can't compute a column count, so the rules for every
// width step, column count and span are written out here.
const columnStep = 9.5;

const gridRules = Array.from({ length: 6 }, (_, step) => {
  const fit = step + 1;

  const rules = Array.from({ length: 6 }, (_, c) => {
    const columns = c + 1;
    const shown = Math.min(columns, fit);

    const spans = Array.from(
      { length: 6 },
      (_, s) =>
        `.grid[data-columns="${columns}"] > [data-span="${s + 1}"] { grid-column: span ${Math.min(s + 1, shown)}; }`,
    ).join("\n");

    return `.grid[data-columns="${columns}"] { grid-template-columns: repeat(${shown}, minmax(0, 1fr)); }\n${spans}`;
  }).join("\n");

  return step === 0
    ? rules
    : `@container section (min-width: ${fit * columnStep}rem) {\n${rules}\n}`;
}).join("\n");

@customElement("panel-section")
export class PanelSection extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
        container: section / inline-size;
      }

      header {
        display: flex;
        align-items: flex-end;
        gap: var(--pn-space-3);
        min-height: 2.25rem;
        margin-bottom: var(--pn-space-3);
        padding: 0 var(--pn-space-1);
      }

      h2 {
        margin: 0;
        font-size: var(--pn-text-l);
        font-weight: 650;
        letter-spacing: -0.015em;
      }

      .subtitle {
        margin: 0.125rem 0 0;
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
      }

      .tools {
        display: flex;
        gap: 2px;
        margin-left: auto;
        padding: 2px;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-full);
        background: var(--pn-surface-solid);
        box-shadow: var(--pn-shadow-s);
      }

      .grid {
        display: grid;
        grid-auto-rows: var(--pn-row);
        grid-auto-flow: row dense;
        gap: var(--pn-gap);
        border-radius: var(--pn-radius-xl);
        transition:
          background var(--pn-fast) var(--pn-ease),
          outline-color var(--pn-fast) var(--pn-ease);
        outline: 2px dashed transparent;
        outline-offset: 6px;
      }

      .editing .grid {
        outline-color: var(--pn-border);
      }

      .grid.over {
        outline-color: var(--pn-accent);
        background: var(--pn-accent-soft);
      }

      .cell {
        position: relative;
        min-width: 0;
        grid-row: span var(--rows, 1);
        transition:
          transform var(--pn-slow) var(--pn-ease),
          opacity var(--pn-fast) var(--pn-ease);
      }

      .cell.dragging {
        opacity: 0.35;
        transform: scale(0.97);
      }

      .cell.target::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 calc(-0.5 * var(--pn-gap) - 1.5px);
        width: 3px;
        border-radius: 3px;
        background: var(--pn-accent);
      }

      .add-tile {
        display: grid;
        place-items: center;
        align-content: center;
        gap: var(--pn-space-1);
        border: 1.5px dashed var(--pn-border-strong);
        border-radius: var(--pn-radius-l);
        background: transparent;
        color: var(--pn-text-muted);
        font: inherit;
        font-size: var(--pn-text-s);
        font-weight: 560;
        cursor: pointer;
        transition:
          border-color var(--pn-fast) var(--pn-ease),
          background var(--pn-fast) var(--pn-ease),
          color var(--pn-fast) var(--pn-ease);
      }

      .add-tile:hover {
        border-color: var(--pn-accent);
        background: var(--pn-accent-soft);
        color: var(--pn-text);
      }

      .empty {
        grid-column: 1 / -1;
        display: grid;
        place-items: center;
        border-radius: var(--pn-radius-l);
        color: var(--pn-text-faint);
        font-size: var(--pn-text-s);
      }
    `,
    unsafeCSS(gridRules),
  ];

  @property({ attribute: false }) accessor dashboard: Dashboard | undefined;

  @property({ attribute: false }) accessor section: Section | undefined;

  @property({ attribute: false }) accessor entities: EntityMap = new Map();

  @property({ type: Boolean }) accessor editing = false;

  @property({ type: Boolean }) accessor first = false;

  @property({ type: Boolean }) accessor last = false;

  @state() accessor dragging: string | undefined;

  @state() accessor target: string | null | undefined;

  #save(next: Dashboard) {
    registry.set(saveDashboard, next);
  }

  #drop(event: DragEvent, beforeId: string | undefined) {
    event.preventDefault();
    event.stopPropagation();

    const widgetId = event.dataTransfer?.getData("application/x-panel-widget");

    this.target = undefined;

    if (
      widgetId === undefined ||
      widgetId === "" ||
      this.dashboard === undefined ||
      this.section === undefined
    ) {
      return;
    }

    this.#save(
      placeWidget(this.dashboard, widgetId, this.section.id, beforeId),
    );
  }

  #over(event: DragEvent, target: string | null) {
    if (!event.dataTransfer?.types.includes("application/x-panel-widget")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    this.target = target;
  }

  #renderTools(dashboard: Dashboard, section: Section) {
    return html`<div class="tools">
      <button
        class="icon-button small"
        title="Move up"
        ?disabled=${this.first}
        @click=${() => this.#save(moveSection(dashboard, section.id, -1))}
      >
        ${icon("arrow-up")}
      </button>
      <button
        class="icon-button small"
        title="Move down"
        ?disabled=${this.last}
        @click=${() => this.#save(moveSection(dashboard, section.id, 1))}
      >
        ${icon("arrow-down")}
      </button>
      <button
        class="icon-button small"
        title="Edit section"
        @click=${() =>
          open({
            kind: "section",
            dashboardId: dashboard.id,
            sectionId: section.id,
          })}
      >
        ${icon("pencil")}
      </button>
      <button
        class="icon-button small"
        title="Delete section"
        @click=${() => {
          if (
            section.widgets.length === 0 ||
            confirm(`Delete ${section.title || "this section"} and its tiles?`)
          ) {
            this.#save(removeSection(dashboard, section.id));
          }
        }}
      >
        ${icon("trash")}
      </button>
    </div>`;
  }

  override render() {
    const { dashboard, section } = this;

    if (dashboard === undefined || section === undefined) {
      return nothing;
    }

    const hasHeader =
      section.title !== "" || section.subtitle !== undefined || this.editing;

    return html`
      <div class=${this.editing ? "editing" : ""}>
        ${
          hasHeader
            ? html`<header>
                <div>
                  <h2>
                    ${
                      section.title === "" && this.editing
                        ? html`<span class="muted">Untitled section</span>`
                        : section.title
                    }
                  </h2>
                  ${
                    section.subtitle
                      ? html`<p class="subtitle">${section.subtitle}</p>`
                      : nothing
                  }
                </div>
                ${this.editing ? this.#renderTools(dashboard, section) : nothing}
              </header>`
            : nothing
        }
        <div
          class="grid ${this.target === null ? "over" : ""}"
          data-columns=${section.columns}
          @dragover=${(event: DragEvent) => this.#over(event, null)}
          @dragleave=${(event: DragEvent) => {
            if (event.target === event.currentTarget) {
              this.target = undefined;
            }
          }}
          @drop=${(event: DragEvent) => this.#drop(event, undefined)}
        >
          ${repeat(
            section.widgets,
            (widget) => widget.id,
            (widget) => html`
              <div
                class="cell ${
                  this.dragging === widget.id ? "dragging" : ""
                } ${this.target === widget.id ? "target" : ""}"
                data-span=${widget.size.columns}
                style="--rows: ${widget.size.rows}"
                draggable=${this.editing ? "true" : "false"}
                @dragstart=${(event: DragEvent) => {
                  event.dataTransfer?.setData(
                    "application/x-panel-widget",
                    widget.id,
                  );

                  if (event.dataTransfer !== null) {
                    event.dataTransfer.effectAllowed = "move";
                  }

                  this.dragging = widget.id;
                }}
                @dragend=${() => {
                  this.dragging = undefined;
                  this.target = undefined;
                }}
                @dragover=${(event: DragEvent) => {
                  event.stopPropagation();
                  this.#over(event, widget.id);
                }}
                @drop=${(event: DragEvent) => this.#drop(event, widget.id)}
              >
                <panel-widget
                  .widget=${widget}
                  .entities=${this.entities}
                  .editing=${this.editing}
                  .dashboard=${dashboard}
                  .sectionId=${section.id}
                ></panel-widget>
              </div>
            `,
          )}
          ${
            this.editing
              ? html`<button
                  class="add-tile"
                  data-span="1"
                  @click=${() =>
                    open({
                      kind: "add-widget",
                      dashboardId: dashboard.id,
                      sectionId: section.id,
                    })}
                >
                  ${icon("plus")} Add tile
                </button>`
              : section.widgets.length === 0
                ? html`<div class="empty">Nothing here yet</div>`
                : nothing
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-section": PanelSection;
  }
}
