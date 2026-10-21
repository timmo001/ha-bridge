import { VirtualizerController } from "@tanstack/lit-virtual";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { icon } from "./icons.js";
import { controls } from "./ui.js";

export interface CommandItem {
  readonly id: string;
  readonly group: string;
  readonly icon: string;
  readonly primary: string;
  readonly secondary?: string;
  readonly trailing?: string;
  // Shows the icon in the accent colour, for entities that are on.
  readonly active?: boolean;
  readonly keywords?: string;
}

type Row =
  | { readonly kind: "header"; readonly label: string }
  | { readonly kind: "item"; readonly item: CommandItem };

const rowHeight = 56;
const headerHeight = 32;
const pageSize = 8;

const score = (item: CommandItem, terms: ReadonlyArray<string>) => {
  const primary = item.primary.toLowerCase();

  const haystack =
    `${primary} ${item.secondary ?? ""} ${item.trailing ?? ""} ${item.keywords ?? ""}`.toLowerCase();

  if (!terms.every((term) => haystack.includes(term))) {
    return undefined;
  }

  const first = terms[0] ?? "";

  return primary.startsWith(first) ? 0 : primary.includes(first) ? 1 : 2;
};

// A searchable list in the style of Home Assistant's quick bar: type to
// filter, arrows, Page Up and Down, Home and End to move, Enter to pick. Group
// chips narrow the list, and only the rows in view are rendered.
@customElement("panel-command-list")
export class PanelCommandList extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
      }

      .tools {
        display: grid;
        gap: var(--pn-space-3);
        padding: var(--pn-space-4) var(--pn-space-4) var(--pn-space-3);
        border-bottom: 1px solid var(--pn-border);
      }

      .search {
        position: relative;
      }

      .search > .icon {
        position: absolute;
        top: 50%;
        left: var(--pn-space-3);
        color: var(--pn-text-faint);
        transform: translateY(-50%);
        pointer-events: none;
      }

      .search input {
        padding-left: 2.5rem;
      }

      .groups {
        display: flex;
        gap: var(--pn-space-1);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .group {
        flex: none;
        min-height: 1.875rem;
        padding: 0 var(--pn-space-3);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-full);
        background: transparent;
        color: var(--pn-text-muted);
        font-size: var(--pn-text-xs);
        font-weight: 560;
        cursor: pointer;
      }

      .group[aria-pressed="true"] {
        border-color: transparent;
        background: var(--pn-text);
        color: var(--pn-bg);
      }

      .scroller {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: var(--pn-space-1) 0;
        scrollbar-width: thin;
      }

      .header,
      .item {
        position: absolute;
        inset: 0 0 auto;
      }

      .header {
        display: flex;
        align-items: end;
        height: ${headerHeight}px;
        padding: 0 var(--pn-space-4) var(--pn-space-1);
      }

      .item {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        height: ${rowHeight}px;
        margin: 0 var(--pn-space-2);
        padding: 0 var(--pn-space-3);
        border-radius: var(--pn-radius-m);
        cursor: pointer;
      }

      .item[aria-selected="true"] {
        background: var(--pn-surface-hover);
      }

      .item.current .primary {
        color: var(--pn-accent-strong);
      }

      .chip {
        display: grid;
        place-items: center;
        flex: none;
        width: 2rem;
        height: 2rem;
        border-radius: var(--pn-radius-s);
        background: var(--pn-surface-sunken);
        color: var(--pn-text-muted);
      }

      .chip .icon {
        width: 1rem;
        height: 1rem;
      }

      .chip.on {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
      }

      .text {
        display: grid;
        flex: 1;
        min-width: 0;
      }

      .primary,
      .secondary,
      .trailing {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .primary {
        color: var(--pn-text);
        font-size: var(--pn-text-s);
        font-weight: 560;
      }

      .secondary {
        color: var(--pn-text-faint);
        font-family: var(--pn-font-mono);
        font-size: var(--pn-text-2xs);
      }

      .trailing {
        flex: none;
        max-width: 40%;
        color: var(--pn-text-muted);
        font-size: var(--pn-text-xs);
      }

      .message {
        display: grid;
        place-items: center;
        padding: var(--pn-space-10);
        color: var(--pn-text-faint);
      }

      footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pn-space-4);
        padding: var(--pn-space-2) var(--pn-space-4);
        border-top: 1px solid var(--pn-border);
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
      }

      kbd {
        display: inline-block;
        min-width: 1.25rem;
        margin-right: var(--pn-space-1);
        padding: 0 var(--pn-space-1);
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-s);
        font: inherit;
        text-align: center;
      }

      @media (pointer: coarse) {
        footer {
          display: none;
        }
      }
    `,
  ];

  @property({ attribute: false }) accessor items: ReadonlyArray<CommandItem> =
    [];

  // The groups to offer as chips, in order. Without them, there are none.
  @property({ attribute: false }) accessor groups: ReadonlyArray<string> = [];

  // Whether to head each group's rows with its name.
  @property({ type: Boolean }) accessor headers = false;

  // The item to mark as current, such as the entity already picked.
  @property() accessor value = "";

  @property() accessor placeholder = "Search";

  @property() accessor empty = "Nothing matches";

  @state() accessor search = "";

  @state() accessor group: string | undefined;

  @state() accessor highlighted = 0;

  @query(".scroller") accessor scroller: HTMLDivElement | null = null;

  @query("input") accessor input: HTMLInputElement | null = null;

  #rows: ReadonlyArray<Row> = [];

  readonly #virtualizer = new VirtualizerController<
    HTMLDivElement,
    HTMLDivElement
  >(this, {
    count: 0,
    estimateSize: () => rowHeight,
    overscan: 12,
    getScrollElement: () => this.scroller,
  });

  override focus() {
    this.input?.focus();
  }

  override firstUpdated() {
    requestAnimationFrame(() => this.focus());
  }

  #compute(): ReadonlyArray<Row> {
    const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);

    const scoped =
      this.group === undefined
        ? this.items
        : this.items.filter((item) => item.group === this.group);

    const matched =
      terms.length === 0
        ? scoped
        : scoped
            .map((item, index) => ({ item, index, score: score(item, terms) }))
            .filter(
              (entry): entry is typeof entry & { score: number } =>
                entry.score !== undefined,
            )
            .sort((a, b) => a.score - b.score || a.index - b.index)
            .map(({ item }) => item);

    if (!this.headers || this.group !== undefined) {
      return matched.map((item) => ({ kind: "item", item }));
    }

    const order = [
      ...this.groups,
      ...new Set(matched.map(({ group }) => group)),
    ].filter((group, index, all) => all.indexOf(group) === index);

    return order.flatMap((group) => {
      const inGroup = matched.filter((item) => item.group === group);

      return inGroup.length === 0
        ? []
        : [
            { kind: "header", label: group } as const,
            ...inGroup.map((item) => ({ kind: "item", item }) as const),
          ];
    });
  }

  #reset() {
    this.highlighted = this.#rows.findIndex((row) => row.kind === "item");
    this.scroller?.scrollTo({ top: 0 });
  }

  // Moves to the nearest item from the index, in the direction given, so
  // group headers are skipped.
  #move(to: number, direction: 1 | -1) {
    const last = this.#rows.length - 1;
    let index = Math.max(0, Math.min(last, to));

    while (this.#rows[index]?.kind === "header") {
      index += direction;
    }

    if (index < 0 || index > last) {
      index = this.highlighted;

      while (this.#rows[index]?.kind === "header" && index <= last) {
        index -= direction;
      }
    }

    if (this.#rows[index]?.kind === "item") {
      this.highlighted = index;
      this.#virtualizer.getVirtualizer().scrollToIndex(index, {
        align: "auto",
      });
    }
  }

  #pick(item: CommandItem) {
    this.dispatchEvent(
      new CustomEvent("pick", {
        detail: item.id,
        bubbles: true,
        composed: true,
      }),
    );
  }

  #keydown(event: KeyboardEvent) {
    const current = this.highlighted;

    switch (event.key) {
      case "ArrowDown":
        this.#move(current + 1, 1);
        break;
      case "ArrowUp":
        this.#move(current - 1, -1);
        break;
      case "PageDown":
        this.#move(current + pageSize, 1);
        break;
      case "PageUp":
        this.#move(current - pageSize, -1);
        break;
      case "Home":
        if (!event.ctrlKey && !event.metaKey && this.search !== "") {
          return;
        }

        this.#move(0, 1);
        break;
      case "End":
        if (!event.ctrlKey && !event.metaKey && this.search !== "") {
          return;
        }

        this.#move(this.#rows.length - 1, -1);
        break;
      case "Enter": {
        const row = this.#rows[current];

        if (row?.kind === "item") {
          this.#pick(row.item);
        }

        break;
      }

      default:
        return;
    }

    event.preventDefault();
  }

  override willUpdate(changed: Map<PropertyKey, unknown>) {
    this.#rows = this.#compute();

    if (
      changed.has("search") ||
      changed.has("group") ||
      changed.has("items") ||
      this.#rows[this.highlighted]?.kind !== "item"
    ) {
      const valueIndex =
        this.search === ""
          ? this.#rows.findIndex(
              (row) => row.kind === "item" && row.item.id === this.value,
            )
          : -1;

      if (changed.has("items") && !changed.has("search") && valueIndex < 0) {
        // Keep the highlight where it is when items refresh, such as an
        // entity changing state, unless it now points at a header.
        if (this.#rows[this.highlighted]?.kind !== "item") {
          this.#reset();
        }
      } else if (valueIndex >= 0 && changed.has("value")) {
        this.highlighted = valueIndex;
      } else {
        this.#reset();
      }
    }
  }

  override updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has("value") && this.search === "") {
      this.#virtualizer.getVirtualizer().scrollToIndex(this.highlighted, {
        align: "center",
      });
    }
  }

  #renderRow(row: Row, index: number, start: number) {
    if (row.kind === "header") {
      return html`<div
        class="header eyebrow"
        role="presentation"
        data-index=${index}
        style="transform: translateY(${start}px)"
      >
        ${row.label}
      </div>`;
    }

    const { item } = row;

    return html`<div
      id="option-${index}"
      class="item ${item.id === this.value ? "current" : ""}"
      role="option"
      aria-selected=${index === this.highlighted ? "true" : "false"}
      data-index=${index}
      style="transform: translateY(${start}px)"
      @pointermove=${() => {
        this.highlighted = index;
      }}
      @click=${() => this.#pick(item)}
    >
      <span class="chip ${item.active === true ? "on" : ""}"
        >${icon(item.icon)}</span
      >
      <span class="text">
        <span class="primary">${item.primary}</span>
        ${
          item.secondary === undefined
            ? nothing
            : html`<span class="secondary">${item.secondary}</span>`
        }
      </span>
      ${
        item.trailing === undefined
          ? nothing
          : html`<span class="trailing">${item.trailing}</span>`
      }
    </div>`;
  }

  override render() {
    const rows = this.#rows;
    const virtualizer = this.#virtualizer.getVirtualizer();

    virtualizer.setOptions({
      ...virtualizer.options,
      count: rows.length,
      estimateSize: (index) =>
        rows[index]?.kind === "header" ? headerHeight : rowHeight,
      getItemKey: (index) => {
        const row = rows[index];

        return row === undefined
          ? index
          : row.kind === "header"
            ? `header:${row.label}`
            : row.item.id;
      },
    });

    const counts = new Map<string, number>();

    for (const item of this.items) {
      counts.set(item.group, (counts.get(item.group) ?? 0) + 1);
    }

    const groups = this.groups.filter((group) => counts.has(group));

    return html`
      <div class="tools">
        <div class="search">
          ${icon("search")}
          <input
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="list"
            aria-autocomplete="list"
            aria-activedescendant=${
              rows[this.highlighted]?.kind === "item"
                ? `option-${this.highlighted}`
                : nothing
            }
            placeholder=${this.placeholder}
            aria-label=${this.placeholder}
            autocomplete="off"
            spellcheck="false"
            .value=${this.search}
            @input=${(event: InputEvent) => {
              if (event.target instanceof HTMLInputElement) {
                this.search = event.target.value;
              }
            }}
            @keydown=${(event: KeyboardEvent) => this.#keydown(event)}
          />
        </div>
        ${
          groups.length > 1
            ? html`<div class="groups" role="group" aria-label="Filter">
                ${groups.map(
                  (group) =>
                    html`<button
                      class="group"
                      tabindex="-1"
                      aria-pressed=${this.group === group ? "true" : "false"}
                      @click=${() => {
                        this.group = this.group === group ? undefined : group;
                        this.focus();
                      }}
                    >
                      ${group} · ${counts.get(group)}
                    </button>`,
                )}
              </div>`
            : nothing
        }
      </div>
      <div class="scroller" id="list" role="listbox">
        ${
          rows.length === 0
            ? html`<div class="message">${this.empty}</div>`
            : html`<div
                style="position: relative; height: ${virtualizer.getTotalSize()}px"
              >
                ${repeat(
                  virtualizer.getVirtualItems(),
                  (entry) => entry.key,
                  (entry) => {
                    const row = rows[entry.index];

                    return row === undefined
                      ? nothing
                      : html`<div
                          style="display: contents"
                          ${ref((element) => {
                            const child = element?.firstElementChild;

                            if (child instanceof HTMLDivElement) {
                              virtualizer.measureElement(child);
                            }
                          })}
                        >
                          ${this.#renderRow(row, entry.index, entry.start)}
                        </div>`;
                  },
                )}
              </div>`
        }
      </div>
      <footer aria-hidden="true">
        <span><kbd>↑</kbd><kbd>↓</kbd>to move</span>
        <span><kbd>↵</kbd>to pick</span>
        <span><kbd>Esc</kbd>to close</span>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-command-list": PanelCommandList;
  }

  interface HTMLElementEventMap {
    pick: CustomEvent<string>;
  }
}
