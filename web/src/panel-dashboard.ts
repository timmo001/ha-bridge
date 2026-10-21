import { WindowVirtualizerController } from "@tanstack/lit-virtual";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { Dashboard } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { type EntityMap, entities, saveDashboard } from "./client.js";
import { dashboardEntities, newSection, saveSection } from "./edit.js";
import { icon } from "./icons.js";
import "./panel-section.js";
import { controls } from "./ui.js";

// A dashboard's sections, one under another. Only the sections near the
// window are rendered, so a dashboard with dozens of sections and hundreds
// of tiles scrolls as smoothly as a small one.
@customElement("panel-dashboard")
export class PanelDashboard extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
      }

      .add {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--pn-space-2);
        width: 100%;
        min-height: 4.5rem;
        margin-top: var(--pn-space-4);
        border: 1.5px dashed var(--pn-border-strong);
        border-radius: var(--pn-radius-xl);
        background: transparent;
        color: var(--pn-text-muted);
        font: inherit;
        font-weight: 560;
        cursor: pointer;
        transition:
          border-color var(--pn-fast) var(--pn-ease),
          color var(--pn-fast) var(--pn-ease),
          background var(--pn-fast) var(--pn-ease);
      }

      .add:hover {
        border-color: var(--pn-accent);
        color: var(--pn-text);
        background: var(--pn-accent-soft);
      }
    `,
  ];

  @property({ attribute: false }) accessor dashboard: Dashboard | undefined;

  @property({ type: Boolean }) accessor editing = false;

  readonly #entities = new AtomController(this, () =>
    entities(
      this.dashboard === undefined
        ? ""
        : dashboardEntities(this.dashboard).join(","),
    ),
  );

  readonly #virtualizer = new WindowVirtualizerController<HTMLElement>(this, {
    count: 0,
    estimateSize: () => 360,
    overscan: 2,
    gap: 40,
  });

  #list: HTMLDivElement | undefined;

  #addSection() {
    if (this.dashboard !== undefined) {
      registry.set(
        saveDashboard,
        saveSection(this.dashboard, newSection("New section")),
      );
    }
  }

  override render() {
    const dashboard = this.dashboard;

    if (dashboard === undefined) {
      return nothing;
    }

    const states = this.#entities.value;

    const sections = dashboard.sections;
    const virtualizer = this.#virtualizer.getVirtualizer();

    virtualizer.setOptions({
      ...virtualizer.options,
      count: sections.length,
      getItemKey: (index) => sections[index]?.id ?? index,
      scrollMargin: this.#list?.offsetTop ?? 0,
    });

    const items = virtualizer.getVirtualItems();
    const offset = (items[0]?.start ?? 0) - virtualizer.options.scrollMargin;

    return html`
      <div
        ${ref((element) => {
          if (element instanceof HTMLDivElement) {
            this.#list = element;
          }
        })}
        style="position: relative; height: ${virtualizer.getTotalSize()}px"
      >
        <div
          style="position: absolute; inset: 0 0 auto; transform: translateY(${offset}px)"
        >
          ${repeat(
            items,
            (item) => item.key,
            (item) => {
              const section = sections[item.index];

              return section === undefined
                ? nothing
                : html`<panel-section
                    data-index=${item.index}
                    style="display: block"
                    ${ref((element) => {
                      if (element instanceof HTMLElement) {
                        virtualizer.measureElement(element);
                      }
                    })}
                    .dashboard=${dashboard}
                    .section=${section}
                    .entities=${states}
                    .editing=${this.editing}
                    .first=${item.index === 0}
                    .last=${item.index === sections.length - 1}
                  ></panel-section>`;
            },
          )}
        </div>
      </div>
      ${
        this.editing
          ? html`<button class="add" @click=${() => this.#addSection()}>
              ${icon("plus")} Add section
            </button>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-dashboard": PanelDashboard;
  }
}
