import { VirtualizerController } from "@tanstack/lit-virtual";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  FlexRender,
  functionalUpdate,
  globalFilteringFeature,
  rowSortingFeature,
  type SortingState,
  sortFn_alphanumeric,
  TableController,
  tableFeatures,
} from "@tanstack/lit-table";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { AtomController } from "./AtomController.js";
import { allEntities } from "./client.js";
import { domainOf, entityIcon, isActive, stateText } from "./entity.js";
import { icon } from "./icons.js";
import { controls } from "./ui.js";

interface EntityRow {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly state: string;
  readonly update: EntityUpdate;
}

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

const column = createColumnHelper<typeof features, EntityRow>();

const columns = column.columns([
  column.accessor("name", {
    header: "Name",
    sortFn: "alphanumeric",
    cell: ({ row: { original } }) => html`
      <span class="chip ${isActive(original.update.state) ? "on" : ""}">
        ${icon(entityIcon(original.update.state, original.id))}
      </span>
      <span class="names">
        <span class="name">${original.name}</span>
        <span class="id">${original.id}</span>
      </span>
    `,
  }),
  column.accessor("domain", { header: "Domain", sortFn: "alphanumeric" }),
  column.accessor("state", {
    header: "State",
    sortFn: "alphanumeric",
    enableGlobalFilter: false,
  }),
]);

const rowHeight = 56;

const ariaSort = { asc: "ascending", desc: "descending" } as const;

// Every Home Assistant entity in a sortable, searchable table. Thousands of
// entities scroll smoothly, as only the rows in view are rendered.
@customElement("panel-entity-picker")
export class PanelEntityPicker extends LitElement {
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
        padding: var(--pn-space-4) var(--pn-space-6);
        border-bottom: 1px solid var(--pn-border);
      }

      .domains {
        display: flex;
        gap: var(--pn-space-1);
        overflow-x: auto;
        scrollbar-width: none;
      }

      .domain {
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

      .domain[aria-pressed="true"] {
        border-color: transparent;
        background: var(--pn-text);
        color: var(--pn-bg);
      }

      .head,
      .row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 7.5rem 8rem;
        align-items: center;
        gap: var(--pn-space-3);
        padding: 0 var(--pn-space-6);
      }

      .head {
        min-height: 2.25rem;
        border-bottom: 1px solid var(--pn-border);
        background: var(--pn-surface-sunken);
      }

      .head button {
        display: flex;
        align-items: center;
        gap: var(--pn-space-1);
        padding: 0;
        border: none;
        background: none;
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
        font-weight: 650;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
      }

      .head .icon {
        width: 0.875rem;
        height: 0.875rem;
      }

      .scroller {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .row {
        position: absolute;
        inset: 0 0 auto;
        height: ${rowHeight}px;
        border: none;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .row:hover,
      .row:focus-visible {
        background: var(--pn-surface-hover);
        outline: none;
      }

      .row[aria-selected="true"] {
        background: var(--pn-accent-soft);
      }

      .cell {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-width: 0;
        overflow: hidden;
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
        text-overflow: ellipsis;
        white-space: nowrap;
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

      .names {
        display: grid;
        min-width: 0;
      }

      .name {
        overflow: hidden;
        color: var(--pn-text);
        font-weight: 560;
        text-overflow: ellipsis;
      }

      .id {
        overflow: hidden;
        color: var(--pn-text-faint);
        font-family: var(--pn-font-mono);
        font-size: var(--pn-text-2xs);
        text-overflow: ellipsis;
      }

      .message {
        display: grid;
        place-items: center;
        padding: var(--pn-space-10);
        color: var(--pn-text-faint);
      }

      @media (max-width: 560px) {
        .head,
        .row {
          grid-template-columns: minmax(0, 1fr) 6rem;
          padding: 0 var(--pn-space-4);
        }

        .head > :nth-child(2),
        .row > :nth-child(2) {
          display: none;
        }
      }
    `,
  ];

  @property() accessor value = "";

  // Only entities in these domains, when given.
  @property({ attribute: false }) accessor domains:
    ReadonlyArray<string> | undefined;

  @state() accessor search = "";

  @state() accessor domain: string | undefined;

  @state() accessor sorting: SortingState = [{ id: "name", desc: false }];

  @query(".scroller") accessor scroller: HTMLDivElement | null = null;

  @query("input[type=search]") accessor input: HTMLInputElement | null = null;

  readonly #entities = new AtomController(this, () => allEntities);

  readonly #table = new TableController<typeof features, EntityRow>(this);

  readonly #virtualizer = new VirtualizerController<
    HTMLDivElement,
    HTMLButtonElement
  >(this, {
    count: 0,
    estimateSize: () => rowHeight,
    overscan: 12,
    getScrollElement: () => this.scroller,
  });

  #rows: { source: unknown; rows: ReadonlyArray<EntityRow> } | undefined;

  override firstUpdated() {
    this.input?.focus();
  }

  #pick(id: string) {
    this.dispatchEvent(
      new CustomEvent("pick", { detail: id, bubbles: true, composed: true }),
    );
  }

  #data(updates: ReadonlyArray<EntityUpdate>) {
    if (this.#rows?.source !== updates) {
      this.#rows = {
        source: updates,
        rows: updates.map((update) => ({
          id: update.state.entity_id,
          name: update.name || update.state.entity_id,
          domain: domainOf(update.state.entity_id),
          state: stateText(update.state),
          update,
        })),
      };
    }

    return this.#rows.rows;
  }

  override render() {
    const result = this.#entities.value;

    if (!AsyncResult.isSuccess(result)) {
      return html`<div class="message">
        ${
          AsyncResult.isFailure(result)
            ? "Couldn't load entities from Home Assistant"
            : "Loading entities…"
        }
      </div>`;
    }

    const all = this.#data(result.value);

    const allowed =
      this.domains === undefined
        ? all
        : all.filter((row) => this.domains?.includes(row.domain));

    const domainCounts = new Map<string, number>();

    for (const row of allowed) {
      domainCounts.set(row.domain, (domainCounts.get(row.domain) ?? 0) + 1);
    }

    const shownDomains = [...domainCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    );

    const data =
      this.domain === undefined
        ? allowed
        : allowed.filter((row) => row.domain === this.domain);

    const table = this.#table.table({
      features,
      columns,
      data: [...data],
      getRowId: (row) => row.id,
      globalFilterFn: "includesString",
      state: { sorting: this.sorting, globalFilter: this.search },
      onSortingChange: (updater) => {
        this.sorting = functionalUpdate(updater, this.sorting);
      },
    });

    const rows = table.getRowModel().rows;
    const virtualizer = this.#virtualizer.getVirtualizer();

    virtualizer.setOptions({
      ...virtualizer.options,
      count: rows.length,
      getItemKey: (index) => rows[index]?.id ?? index,
    });

    return html`
      <div class="tools">
        <input
          type="search"
          placeholder="Search ${allowed.length} entities"
          aria-label="Search entities"
          .value=${this.search}
          @input=${(event: InputEvent) => {
            if (event.target instanceof HTMLInputElement) {
              this.search = event.target.value;
              this.scroller?.scrollTo({ top: 0 });
            }
          }}
          @keydown=${(event: KeyboardEvent) => {
            const first = rows[0];

            if (event.key === "Enter" && first !== undefined) {
              this.#pick(first.id);
            }
          }}
        />
        ${
          shownDomains.length > 1
            ? html`<div class="domains" role="group" aria-label="Domain">
                <button
                  class="domain"
                  aria-pressed=${this.domain === undefined ? "true" : "false"}
                  @click=${() => {
                    this.domain = undefined;
                  }}
                >
                  All
                </button>
                ${shownDomains.map(
                  ([domain, count]) =>
                    html`<button
                      class="domain"
                      aria-pressed=${this.domain === domain ? "true" : "false"}
                      @click=${() => {
                        this.domain =
                          this.domain === domain ? undefined : domain;
                      }}
                    >
                      ${domain.replaceAll("_", " ")} · ${count}
                    </button>`,
                )}
              </div>`
            : nothing
        }
      </div>
      <div class="head" role="row">
        ${table.getHeaderGroups()[0]?.headers.map((header) => {
          const sorted = header.column.getIsSorted();

          return html`<button
            role="columnheader"
            aria-sort=${sorted === false ? "none" : ariaSort[sorted]}
            @click=${header.column.getToggleSortingHandler()}
          >
            ${FlexRender({ header })}
            ${
              sorted === false
                ? nothing
                : icon(sorted === "asc" ? "chevron-up" : "chevron-down")
            }
          </button>`;
        })}
      </div>
      <div class="scroller" role="listbox" aria-label="Entities">
        ${
          rows.length === 0
            ? html`<div class="message">No entities match</div>`
            : html`<div
                style="position: relative; height: ${virtualizer.getTotalSize()}px"
              >
                ${repeat(
                  virtualizer.getVirtualItems(),
                  (item) => item.key,
                  (item) => {
                    const row = rows[item.index];

                    return row === undefined
                      ? nothing
                      : html`<button
                          class="row"
                          role="option"
                          aria-selected=${row.id === this.value ? "true" : "false"}
                          data-index=${item.index}
                          style="transform: translateY(${item.start}px)"
                          ${ref((element) => {
                            if (element instanceof HTMLButtonElement) {
                              virtualizer.measureElement(element);
                            }
                          })}
                          @click=${() => this.#pick(row.id)}
                        >
                          ${row
                            .getAllCells()
                            .map(
                              (cell) =>
                                html`<span class="cell"
                                  >${FlexRender({ cell })}</span
                                >`,
                            )}
                        </button>`;
                  },
                )}
              </div>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-entity-picker": PanelEntityPicker;
  }

  interface HTMLElementEventMap {
    pick: CustomEvent<string>;
  }
}
