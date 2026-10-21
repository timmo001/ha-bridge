import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Dashboard, Widget } from "../../src/panel/Panel.js";
import { registry } from "./AtomController.js";
import { type EntityMap, saveDashboard } from "./client.js";
import { removeWidget } from "./edit.js";
import { icon } from "./icons.js";
import { open } from "./state.js";
import { controls } from "./ui.js";
import "./widgets/panel-checklist.js";
import "./widgets/panel-clock.js";
import "./widgets/panel-entity-tile.js";
import "./widgets/panel-history.js";
import "./widgets/panel-markdown.js";

// One tile in a section, with its editing controls on top in edit mode.
@customElement("panel-widget")
export class PanelWidget extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        position: relative;
        display: block;
        height: 100%;
      }

      .card {
        height: 100%;
        overflow: hidden;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface);
        box-shadow: var(--pn-shadow-s);
        backdrop-filter: blur(16px);
      }

      .media {
        position: relative;
        height: 100%;
        overflow: hidden;
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface-sunken);
      }

      img,
      iframe {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .caption {
        position: absolute;
        inset: auto 0 0;
        padding: var(--pn-space-6) var(--pn-space-4) var(--pn-space-3);
        background: linear-gradient(transparent, oklch(0% 0 0 / 55%));
        color: white;
        font-size: var(--pn-text-s);
        font-weight: 600;
      }

      .placeholder {
        display: grid;
        place-items: center;
        height: 100%;
        color: var(--pn-text-faint);
        font-size: var(--pn-text-s);
      }

      .edit {
        position: absolute;
        inset: 0;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: var(--pn-space-2);
        border-radius: var(--pn-radius-l);
        background: color-mix(in oklch, var(--pn-bg) 35%, transparent);
        outline: 1.5px solid var(--pn-border-strong);
        outline-offset: -1.5px;
        cursor: grab;
        opacity: 0;
        transition: opacity var(--pn-fast) var(--pn-ease);
      }

      :host(:hover) .edit,
      .edit:focus-within,
      .edit.touch {
        opacity: 1;
      }

      @media (hover: none) {
        .edit {
          opacity: 1;
          background: transparent;
        }
      }

      .grip {
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: var(--pn-radius-full);
        background: var(--pn-surface-solid);
        color: var(--pn-text-muted);
        box-shadow: var(--pn-shadow-s);
      }

      .grip .icon {
        width: 1rem;
        height: 1rem;
      }

      .pill {
        display: flex;
        gap: 2px;
        padding: 2px;
        border-radius: var(--pn-radius-full);
        background: var(--pn-surface-solid);
        box-shadow: var(--pn-shadow-m);
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: Widget | undefined;

  @property({ attribute: false }) accessor entities: EntityMap = new Map();

  @property({ type: Boolean }) accessor editing = false;

  @property({ attribute: false }) accessor dashboard: Dashboard | undefined;

  @property() accessor sectionId = "";

  #renderContent(widget: Widget) {
    switch (widget.type) {
      case "entity":
        return html`<panel-entity-tile
          .widget=${widget}
          .entity=${this.entities.get(widget.entityId)}
          .editing=${this.editing}
        ></panel-entity-tile>`;
      case "history":
        return html`<div class="card">
          <panel-history
            .widget=${widget}
            .entity=${this.entities.get(widget.entityId)}
          ></panel-history>
        </div>`;
      case "markdown":
        return html`<div class="card">
          <panel-markdown .widget=${widget}></panel-markdown>
        </div>`;
      case "clock":
        return html`<div class="card">
          <panel-clock .widget=${widget}></panel-clock>
        </div>`;
      case "checklist":
        return html`<div class="card">
          <panel-checklist
            .widget=${widget}
            .dashboard=${this.dashboard}
            .sectionId=${this.sectionId}
          ></panel-checklist>
        </div>`;
      case "image":
        return html`<div class="media">
          ${
            widget.url === ""
              ? html`<div class="placeholder">No image set</div>`
              : html`<img
                  src=${widget.url}
                  alt=${widget.title ?? ""}
                  loading="lazy"
                  style="object-fit: ${widget.fit}"
                />`
          }
          ${widget.title ? html`<div class="caption">${widget.title}</div>` : nothing}
        </div>`;
      case "frame":
        return html`<div class="media">
          ${
            widget.url === ""
              ? html`<div class="placeholder">No page set</div>`
              : html`<iframe
                  src=${widget.url}
                  title=${widget.title ?? "Embedded page"}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  style=${this.editing ? "pointer-events: none" : ""}
                ></iframe>`
          }
        </div>`;
    }
  }

  override render() {
    const widget = this.widget;
    const dashboard = this.dashboard;

    if (widget === undefined) {
      return nothing;
    }

    return html`
      ${this.#renderContent(widget)}
      ${
        this.editing && dashboard !== undefined
          ? html`<div class="edit">
              <span class="grip" title="Drag to move">${icon("grip")}</span>
              <div class="pill">
                <button
                  class="icon-button small"
                  title="Edit tile"
                  @click=${() =>
                    open({
                      kind: "widget",
                      dashboardId: dashboard.id,
                      sectionId: this.sectionId,
                      widgetId: widget.id,
                    })}
                >
                  ${icon("pencil")}
                </button>
                <button
                  class="icon-button small"
                  title="Delete tile"
                  @click=${() =>
                    registry.set(
                      saveDashboard,
                      removeWidget(dashboard, widget.id),
                    )}
                >
                  ${icon("trash")}
                </button>
              </div>
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-widget": PanelWidget;
  }
}
