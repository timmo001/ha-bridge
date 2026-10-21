import { VirtualizerController } from "@tanstack/lit-virtual";
import { AsyncResult, Atom } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import type { Mode, Settings } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import {
  allEntities,
  dashboards,
  saveDashboard,
  saveSettings,
  settings,
} from "./client.js";
import { newDashboard } from "./edit.js";
import { entityIcon, stateText } from "./entity.js";
import { icon } from "./icons.js";
import { sectionInfo } from "./panel-settings.js";
import { editing, navigate, open, route, settingsSections } from "./state.js";
import { themes } from "./themes.js";
import { controls } from "./ui.js";

// Whether the command menu is open.
const commandOpen = Atom.make(false).pipe(Atom.keepAlive);

const notLoaded = Atom.make(AsyncResult.initial<ReadonlyArray<EntityUpdate>>());

export const openCommands = () => registry.set(commandOpen, true);

interface Command {
  readonly id: string;
  readonly group: string;
  readonly title: string;
  readonly detail?: string;
  readonly icon: string;
  // Words it also matches, beyond its title and detail.
  readonly keywords?: string;
  readonly run: () => void;
}

type Row =
  | { readonly kind: "group"; readonly title: string }
  | { readonly kind: "command"; readonly command: Command };

const groupOrder = ["Go to", "Settings", "Actions", "Themes", "Entities"];

// Every word of the query has to appear somewhere in the command. Titles
// starting with the query come first.
const filter = (commands: ReadonlyArray<Command>, query: string) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return commands;
  }

  return commands
    .flatMap((command) => {
      const text =
        `${command.title} ${command.detail ?? ""} ${command.keywords ?? ""} ${command.group}`.toLowerCase();

      return words.every((word) => text.includes(word))
        ? [
            {
              command,
              rank: command.title.toLowerCase().startsWith(words[0] ?? "")
                ? 0
                : 1,
            },
          ]
        : [];
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ command }) => command);
};

const rowHeight = { group: 30, command: 48 } as const;

// A menu of everything in the panel, opened with ⌘K or Ctrl+K: dashboards,
// settings pages, actions, themes and every entity. Type to filter, move with
// the arrow keys, and press Enter to go.
@customElement("panel-command")
export class PanelCommand extends LitElement {
  static override styles = [
    controls,
    css`
      [popover] {
        position: fixed;
        inset: 12dvh 0 auto;
        width: min(40rem, calc(100vw - 2rem));
        margin: 0 auto;
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-xl);
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow: var(--pn-shadow-l);
        opacity: 0;
        transform: translateY(-0.5rem) scale(0.98);
        transition:
          opacity var(--pn-fast) var(--pn-ease),
          transform var(--pn-fast) var(--pn-ease),
          overlay var(--pn-fast) allow-discrete,
          display var(--pn-fast) allow-discrete;
      }

      [popover]:popover-open {
        display: flex;
        flex-direction: column;
        opacity: 1;
        transform: none;
      }

      @starting-style {
        [popover]:popover-open {
          opacity: 0;
          transform: translateY(-0.5rem) scale(0.98);
        }
      }

      [popover]::backdrop {
        background: var(--pn-scrim);
        backdrop-filter: blur(3px);
      }

      .search {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        padding: 0 var(--pn-space-5);
        border-bottom: 1px solid var(--pn-border);
        color: var(--pn-text-faint);
      }

      .search input {
        flex: 1;
        min-height: 3.5rem;
        padding: 0;
        border: none;
        background: none;
        color: var(--pn-text);
        font: inherit;
        font-size: var(--pn-text-l);
        box-shadow: none;
      }

      .search input:focus {
        outline: none;
        box-shadow: none;
      }

      kbd {
        padding: 0.125rem 0.4rem;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-s);
        background: var(--pn-surface-sunken);
        font-family: var(--pn-font);
        font-size: var(--pn-text-2xs);
        font-weight: 600;
      }

      .list {
        max-height: min(26rem, 60dvh);
        overflow-y: auto;
        padding: var(--pn-space-2);
        scrollbar-width: thin;
      }

      .row {
        position: absolute;
        inset: 0 0 auto;
      }

      .group {
        display: flex;
        align-items: flex-end;
        height: ${rowHeight.group}px;
        padding: 0 var(--pn-space-3) var(--pn-space-1);
      }

      .command {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        width: 100%;
        height: ${rowHeight.command}px;
        padding: 0 var(--pn-space-3);
        border: none;
        border-radius: var(--pn-radius-m);
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .command[aria-selected="true"] {
        background: var(--pn-accent-soft);
      }

      .command .chip {
        display: grid;
        place-items: center;
        flex: none;
        width: 2rem;
        height: 2rem;
        border-radius: var(--pn-radius-s);
        background: var(--pn-surface-sunken);
        color: var(--pn-text-muted);
      }

      .command .chip .icon {
        width: 1rem;
        height: 1rem;
      }

      .command[aria-selected="true"] .chip {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
      }

      .names {
        display: grid;
        flex: 1;
        min-width: 0;
      }

      .title,
      .detail {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .title {
        font-size: var(--pn-text-s);
        font-weight: 560;
      }

      .detail {
        color: var(--pn-text-faint);
        font-size: var(--pn-text-xs);
      }

      .enter {
        visibility: hidden;
        color: var(--pn-text-faint);
      }

      .command[aria-selected="true"] .enter {
        visibility: visible;
      }

      .empty {
        padding: var(--pn-space-10) var(--pn-space-4);
        color: var(--pn-text-faint);
        text-align: center;
      }

      footer {
        display: flex;
        gap: var(--pn-space-4);
        padding: var(--pn-space-2) var(--pn-space-5);
        border-top: 1px solid var(--pn-border);
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
      }
    `,
  ];

  @state() accessor search = "";

  @state() accessor active = 0;

  @query("[popover]") accessor popup: HTMLElement | null = null;

  @query("input") accessor input: HTMLInputElement | null = null;

  @query(".list") accessor list: HTMLDivElement | null = null;

  readonly #open = new AtomController(this, () => commandOpen);

  readonly #dashboards = new AtomController(this, () => dashboards);

  readonly #settings = new AtomController(this, () => settings);

  readonly #route = new AtomController(this, () => route);

  readonly #editing = new AtomController(this, () => editing);

  // Entities only load once the menu is opened. This reads the registry
  // rather than #open: Bun's bundler leaves a private field read inside
  // another field's initialiser unconverted, which throws at runtime.
  readonly #entities = new AtomController(this, () =>
    registry.get(commandOpen) ? allEntities : notLoaded,
  );

  readonly #virtualizer = new VirtualizerController<
    HTMLDivElement,
    HTMLElement
  >(this, {
    count: 0,
    estimateSize: () => rowHeight.command,
    overscan: 10,
    getScrollElement: () => this.list,
  });

  #rows: ReadonlyArray<Row> = [];

  readonly #keydown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      registry.set(commandOpen, !registry.get(commandOpen));
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    addEventListener("keydown", this.#keydown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("keydown", this.#keydown);
  }

  override updated() {
    const popup = this.popup;

    if (popup === null) {
      return;
    }

    const shown = popup.matches(":popover-open");

    if (this.#open.value && !shown) {
      this.search = "";
      this.active = 0;
      popup.showPopover();
      this.input?.focus();
    } else if (!this.#open.value && shown) {
      popup.hidePopover();
    }
  }

  #save(patch: Partial<Settings>) {
    registry.set(saveSettings, { ...this.#settings.value, ...patch });
  }

  #commands(): ReadonlyArray<Command> {
    const list = this.#dashboards.value ?? [];
    const current = this.#settings.value;
    const where = this.#route.value;
    const onDashboard = where.page === "dashboard" && list.length > 0;

    const modes: ReadonlyArray<readonly [Mode, string, string]> = [
      ["light", "Light mode", "sun"],
      ["dark", "Dark mode", "moon"],
      ["system", "Follow the device's mode", "monitor"],
    ];

    const entities = AsyncResult.isSuccess(this.#entities.value)
      ? this.#entities.value.value
      : [];

    return [
      ...list.map((dashboard) => ({
        id: `dashboard:${dashboard.id}`,
        group: "Go to",
        title: dashboard.name,
        detail: "Dashboard",
        icon: dashboard.icon,
        run: () => navigate({ page: "dashboard", id: dashboard.id }),
      })),
      ...settingsSections.map((section) => ({
        id: `settings:${section}`,
        group: "Settings",
        title: sectionInfo[section].name,
        detail: sectionInfo[section].about,
        icon: sectionInfo[section].icon,
        keywords: "settings preferences",
        run: () => navigate({ page: "settings", section }),
      })),
      ...list.map((dashboard) => ({
        id: `customise:${dashboard.id}`,
        group: "Settings",
        title: `Customise ${dashboard.name}`,
        detail: "Name, icon and background",
        icon: "settings",
        keywords: "rename icon background delete dashboard",
        run: () =>
          navigate({
            page: "settings",
            section: "dashboards",
            id: dashboard.id,
          }),
      })),
      ...(onDashboard
        ? [
            {
              id: "edit",
              group: "Actions",
              title: this.#editing.value
                ? "Finish editing"
                : "Edit this dashboard",
              detail: "Add, move and change tiles and sections",
              icon: this.#editing.value ? "check" : "pencil",
              keywords: "edit layout tiles sections done",
              run: () => registry.set(editing, !this.#editing.value),
            },
          ]
        : []),
      {
        id: "new-dashboard",
        group: "Actions",
        title: "New dashboard",
        icon: "plus",
        keywords: "add create",
        run: () => {
          const dashboard = newDashboard("New dashboard");

          registry.set(saveDashboard, dashboard);
          registry.set(editing, true);
          navigate({ page: "dashboard", id: dashboard.id });
        },
      },
      ...modes.flatMap(([mode, title, name]) =>
        mode === current.mode
          ? []
          : [
              {
                id: `mode:${mode}`,
                group: "Actions",
                title,
                icon: name,
                keywords: "theme appearance scheme",
                run: () => this.#save({ mode }),
              },
            ],
      ),
      {
        id: "density",
        group: "Actions",
        title:
          current.density === "compact" ? "Comfortable tiles" : "Compact tiles",
        icon: "layout-grid",
        keywords: "density size",
        run: () =>
          this.#save({
            density: current.density === "compact" ? "comfortable" : "compact",
          }),
      },
      {
        id: "kiosk",
        group: "Actions",
        title: current.kiosk ? "Leave kiosk mode" : "Kiosk mode",
        detail: "Hide navigation and editing",
        icon: "monitor",
        keywords: "wall tablet fullscreen",
        run: () => this.#save({ kiosk: !current.kiosk }),
      },
      {
        id: "new-theme",
        group: "Actions",
        title: "New theme",
        icon: "sparkles",
        keywords: "custom colours",
        run: () => navigate({ page: "settings", section: "themes", id: "new" }),
      },
      ...themes.map((theme) => ({
        id: `theme:${theme.id}`,
        group: "Themes",
        title:
          theme.family === theme.name
            ? theme.name
            : `${theme.family} ${theme.name}`,
        detail: current.theme === theme.id ? "Current theme" : undefined,
        icon: "sparkles",
        keywords: "theme",
        run: () => this.#save({ theme: theme.id }),
      })),
      ...current.customThemes.map((theme) => ({
        id: `theme:${theme.id}`,
        group: "Themes",
        title: theme.name,
        detail: current.theme === theme.id ? "Current theme" : "Your theme",
        icon: "sparkles",
        keywords: "theme custom",
        run: () => this.#save({ theme: theme.id }),
      })),
      ...entities.map((update) => ({
        id: `entity:${update.state.entity_id}`,
        group: "Entities",
        title: update.name || update.state.entity_id,
        detail: `${update.state.entity_id} · ${stateText(update.state)}`,
        icon: entityIcon(update.state, update.state.entity_id),
        run: () => open({ kind: "details", entityId: update.state.entity_id }),
      })),
    ];
  }

  #buildRows(): ReadonlyArray<Row> {
    const found = filter(this.#commands(), this.search);

    return groupOrder.flatMap((group): ReadonlyArray<Row> => {
      const commands = found.filter((command) => command.group === group);

      return commands.length === 0
        ? []
        : [
            { kind: "group", title: group },
            ...commands.map(
              (command) => ({ kind: "command", command }) as const,
            ),
          ];
    });
  }

  // The positions of the rows that are commands, which the arrows move over.
  #commandIndexes() {
    return this.#rows.flatMap((row, index) =>
      row.kind === "command" ? [index] : [],
    );
  }

  #run(command: Command) {
    registry.set(commandOpen, false);
    command.run();
  }

  #onKey(event: KeyboardEvent) {
    const indexes = this.#commandIndexes();
    const position = indexes.indexOf(this.active);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const next =
        indexes[
          Math.max(
            0,
            Math.min(
              indexes.length - 1,
              position + (event.key === "ArrowDown" ? 1 : -1),
            ),
          )
        ];

      if (next !== undefined) {
        this.active = next;
        this.#virtualizer.getVirtualizer().scrollToIndex(next);
      }
    } else if (event.key === "Enter") {
      const row = this.#rows[this.active];

      if (row?.kind === "command") {
        event.preventDefault();
        this.#run(row.command);
      }
    }
  }

  override render() {
    this.#rows = this.#open.value ? this.#buildRows() : [];

    const rows = this.#rows;
    const first = this.#commandIndexes()[0];

    if (rows[this.active]?.kind !== "command" && first !== undefined) {
      this.active = first;
    }

    const virtualizer = this.#virtualizer.getVirtualizer();

    virtualizer.setOptions({
      ...virtualizer.options,
      count: rows.length,
      estimateSize: (index) =>
        rows[index]?.kind === "group" ? rowHeight.group : rowHeight.command,
      getItemKey: (index) => {
        const row = rows[index];

        return row === undefined
          ? index
          : row.kind === "group"
            ? `group:${row.title}`
            : row.command.id;
      },
    });

    const activeRow = rows[this.active];

    return html`
      <div
        popover="auto"
        role="dialog"
        aria-label="Search the panel"
        @toggle=${(event: ToggleEvent) => {
          if (event.newState === "closed") {
            registry.set(commandOpen, false);
          }
        }}
      >
        <label class="search">
          ${icon("search")}
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="results"
            aria-activedescendant=${
              activeRow?.kind === "command" ? `command-${this.active}` : nothing
            }
            placeholder="Search dashboards, settings, themes and entities"
            .value=${this.search}
            @input=${(event: InputEvent) => {
              if (event.target instanceof HTMLInputElement) {
                this.search = event.target.value;
                this.list?.scrollTo({ top: 0 });
              }
            }}
            @keydown=${(event: KeyboardEvent) => this.#onKey(event)}
          />
          <kbd>Esc</kbd>
        </label>
        <div class="list" id="results" role="listbox" aria-label="Results">
          ${
            rows.length === 0
              ? html`<div class="empty">Nothing matches “${this.search}”</div>`
              : html`<div
                  style="position: relative; height: ${virtualizer.getTotalSize()}px"
                >
                  ${repeat(
                    virtualizer.getVirtualItems(),
                    (item) => item.key,
                    (item) => {
                      const row = rows[item.index];

                      if (row === undefined) {
                        return nothing;
                      }

                      return html`<div
                        class="row"
                        data-index=${item.index}
                        style="transform: translateY(${item.start}px)"
                        ${ref((element) => {
                          if (element instanceof HTMLElement) {
                            virtualizer.measureElement(element);
                          }
                        })}
                      >
                        ${
                          row.kind === "group"
                            ? html`<div
                                class="group eyebrow"
                                role="presentation"
                              >
                                ${row.title}
                              </div>`
                            : html`<button
                                class="command"
                                id="command-${item.index}"
                                role="option"
                                tabindex="-1"
                                aria-selected=${
                                  item.index === this.active ? "true" : "false"
                                }
                                @pointermove=${() => {
                                  this.active = item.index;
                                }}
                                @click=${() => this.#run(row.command)}
                              >
                                <span class="chip"
                                  >${icon(row.command.icon)}</span
                                >
                                <span class="names">
                                  <span class="title"
                                    >${row.command.title}</span
                                  >
                                  ${
                                    row.command.detail
                                      ? html`<span class="detail"
                                          >${row.command.detail}</span
                                        >`
                                      : nothing
                                  }
                                </span>
                                <span class="enter">↵</span>
                              </button>`
                        }
                      </div>`;
                    },
                  )}
                </div>`
          }
        </div>
        <footer>
          <span><kbd>↑</kbd> <kbd>↓</kbd> to move</span>
          <span><kbd>↵</kbd> to go</span>
          <span><kbd>Esc</kbd> to close</span>
        </footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-command": PanelCommand;
  }
}
