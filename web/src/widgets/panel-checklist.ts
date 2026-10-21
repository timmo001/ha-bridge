import { Predicate } from "effect";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type {
  ChecklistItem,
  ChecklistWidget,
  Dashboard,
} from "../../../src/panel/Panel.js";
import { registry } from "../AtomController.js";
import { saveDashboard } from "../client.js";
import { newId, saveWidget } from "../edit.js";
import { icon } from "../icons.js";
import { controls } from "../ui.js";

// A shared list, such as shopping, ticked off on any screen.
@customElement("panel-checklist")
export class PanelChecklist extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--pn-space-4) var(--pn-space-3) var(--pn-space-3);
      }

      .title {
        padding: 0 var(--pn-space-2) var(--pn-space-2);
      }

      ul {
        flex: 1;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        list-style: none;
        scrollbar-width: thin;
      }

      li {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 2.5rem;
        padding: 0 var(--pn-space-2);
        border-radius: var(--pn-radius-m);
      }

      li:hover {
        background: var(--pn-surface-hover);
      }

      li:hover .remove {
        opacity: 1;
      }

      .check {
        display: grid;
        place-items: center;
        flex: none;
        width: 1.375rem;
        height: 1.375rem;
        padding: 0;
        border: 1.5px solid var(--pn-border-strong);
        border-radius: 0.45rem;
        background: transparent;
        color: var(--pn-accent-text);
        cursor: pointer;
        transition:
          background var(--pn-fast) var(--pn-ease),
          border-color var(--pn-fast) var(--pn-ease);
      }

      .check .icon {
        width: 0.875rem;
        height: 0.875rem;
        stroke-width: 3;
      }

      .check[aria-checked="true"] {
        border-color: var(--pn-accent);
        background: var(--pn-accent);
      }

      .text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        font-size: var(--pn-text-s);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .done .text {
        color: var(--pn-text-faint);
        text-decoration: line-through;
      }

      .remove {
        opacity: 0;
      }

      @media (hover: none) {
        .remove {
          opacity: 1;
        }
      }

      form {
        display: flex;
        gap: var(--pn-space-2);
        padding-top: var(--pn-space-2);
      }

      form input {
        min-height: 2.25rem;
        font-size: var(--pn-text-s);
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: ChecklistWidget | undefined;

  @property({ attribute: false }) accessor dashboard: Dashboard | undefined;

  @property() accessor sectionId = "";

  #save(items: ReadonlyArray<ChecklistItem>) {
    if (this.widget !== undefined && this.dashboard !== undefined) {
      registry.set(
        saveDashboard,
        saveWidget(this.dashboard, this.sectionId, { ...this.widget, items }),
      );
    }
  }

  override render() {
    const widget = this.widget;

    if (widget === undefined) {
      return nothing;
    }

    // Unticked items first, each group in the order they were added.
    const items = [
      ...widget.items.filter(({ done }) => !done),
      ...widget.items.filter(({ done }) => done),
    ];

    return html`
      ${
        widget.title
          ? html`<div class="eyebrow title">${widget.title}</div>`
          : nothing
      }
      <ul>
        ${repeat(
          items,
          (item) => item.id,
          (item) =>
            html`<li class=${item.done ? "done" : ""}>
              <button
                class="check"
                role="checkbox"
                aria-checked=${item.done ? "true" : "false"}
                aria-label=${item.text}
                @click=${() =>
                  this.#save(
                    widget.items.map((existing) =>
                      existing.id === item.id
                        ? { ...existing, done: !existing.done }
                        : existing,
                    ),
                  )}
              >
                ${item.done ? icon("check") : nothing}
              </button>
              <span class="text">${item.text}</span>
              <button
                class="icon-button small remove"
                title="Remove"
                @click=${() =>
                  this.#save(widget.items.filter(({ id }) => id !== item.id))}
              >
                ${icon("x")}
              </button>
            </li>`,
        )}
      </ul>
      <form
        @submit=${(event: SubmitEvent) => {
          event.preventDefault();
          const form = event.currentTarget;

          if (!(form instanceof HTMLFormElement)) {
            return;
          }

          const text = new FormData(form).get("text");

          if (Predicate.isString(text) && text.trim() !== "") {
            this.#save([
              ...widget.items,
              { id: newId(), text: text.trim(), done: false },
            ]);
            form.reset();
          }
        }}
      >
        <input
          type="text"
          name="text"
          placeholder="Add an item"
          aria-label="Add an item"
        />
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-checklist": PanelChecklist;
  }
}
