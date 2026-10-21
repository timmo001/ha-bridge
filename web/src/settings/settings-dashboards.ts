import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { Background, Dashboard } from "../../../src/panel/Panel.js";
import { AtomController, registry } from "../AtomController.js";
import {
  dashboards,
  deleteDashboard,
  orderDashboards,
  saveDashboard,
  settings,
} from "../client.js";
import { newDashboard, placeBefore } from "../edit.js";
import { icon, iconNames } from "../icons.js";
import "../panel-background-editor.js";
import { editing, href, navigate, type Route } from "../state.js";
import { controls } from "../ui.js";
import { settingsStyles, textField, toggle } from "./parts.js";

const listPage = { page: "settings", section: "dashboards" } as const;

const link = (to: Route) => (event: MouseEvent) => {
  event.preventDefault();
  navigate(to);
};

// The dashboards in order, dragged to reorder, and a page for each at
// /settings/dashboards/<id> with its name, icon and background.
@customElement("settings-dashboards")
export class SettingsDashboards extends LitElement {
  static override styles = [
    controls,
    settingsStyles,
    css`
      .dashboard {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 3.75rem;
        padding: var(--pn-space-2) var(--pn-space-3) var(--pn-space-2)
          var(--pn-space-5);
        color: inherit;
        text-decoration: none;
        cursor: grab;
      }

      .dashboard:hover {
        background: var(--pn-surface-hover);
      }

      .dashboard + .dashboard {
        border-top: 1px solid var(--pn-border);
      }

      .dashboard.before::before,
      .dashboard.after::after {
        content: "";
        position: absolute;
        inset: auto var(--pn-space-3);
        height: 3px;
        border-radius: 3px;
        background: var(--pn-accent);
      }

      .dashboard.before::before {
        top: -1.5px;
      }

      .dashboard.after::after {
        bottom: -1.5px;
      }

      .grip {
        display: grid;
        place-items: center;
        margin-left: calc(-1 * var(--pn-space-2));
        color: var(--pn-text-faint);
      }

      .grip .icon,
      .chevron {
        width: 1rem;
        height: 1rem;
      }

      .dashboard .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        font-weight: 560;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dashboard .count {
        color: var(--pn-text-faint);
        font-size: var(--pn-text-s);
      }

      .dashboard > .icon {
        color: var(--pn-text-muted);
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
    `,
  ];

  // A dashboard's ID; the list without one.
  @property() accessor dashboardId: string | undefined;

  @state() accessor draft: Dashboard | undefined;

  // The row a dashboard being dragged would land beside.
  @state() accessor target:
    { readonly id: string; readonly where: "before" | "after" } | undefined;

  readonly #dashboards = new AtomController(this, () => dashboards);

  readonly #settings = new AtomController(this, () => settings);

  #editing: string | undefined;

  override willUpdate() {
    if (this.dashboardId === this.#editing && this.draft !== undefined) {
      return;
    }

    this.#editing = this.dashboardId;
    this.draft =
      this.dashboardId === undefined
        ? undefined
        : this.#dashboards.value?.find(({ id }) => id === this.dashboardId);
  }

  #drop(event: DragEvent, targetId: string) {
    const id = event.dataTransfer?.getData("application/x-panel-dashboard");
    const where = this.target?.where;
    const list = this.#dashboards.value ?? [];

    this.target = undefined;

    if (id === undefined || id === "" || where === undefined) {
      return;
    }

    event.preventDefault();

    const index = list.findIndex((dashboard) => dashboard.id === targetId);
    const beforeId = where === "before" ? targetId : list[index + 1]?.id;

    registry.set(
      orderDashboards,
      placeBefore(list, id, beforeId).map((dashboard) => dashboard.id),
    );
  }

  #renderEditor(draft: Dashboard) {
    const list = this.#dashboards.value ?? [];

    const set = (next: Dashboard) => {
      this.draft = next;
    };

    const open = { page: "dashboard", id: draft.id } as const;

    return html`
      <a class="back" href=${href(listPage)} @click=${link(listPage)}
        >${icon("chevron-left")} Dashboards</a
      >
      <h2>${draft.name || "Untitled"}</h2>
      <section class="card padded">
        ${textField("Name", draft.name, (name) => set({ ...draft, name }))}
        <div class="field">
          <span>Icon</span>
          <div class="icons" role="group" aria-label="Icon">
            ${iconNames.map(
              (name) =>
                html`<button
                  title=${name}
                  aria-pressed=${draft.icon === name ? "true" : "false"}
                  @click=${() => set({ ...draft, icon: name })}
                >
                  ${icon(name)}
                </button>`,
            )}
          </div>
        </div>
      </section>
      <section class="card padded">
        <div class="spread">
          <div class="label">
            <strong>Own background</strong>
            <span>Otherwise this dashboard uses the panel's background.</span>
          </div>
          ${toggle(draft.background !== undefined, "Own background", (on) =>
            set({
              ...draft,
              background: on ? this.#settings.value.background : undefined,
            }),
          )}
        </div>
        ${
          draft.background === undefined
            ? nothing
            : html`<panel-background-editor
                .value=${draft.background}
                @background-change=${(event: CustomEvent<Background>) =>
                  set({ ...draft, background: event.detail })}
              ></panel-background-editor>`
        }
      </section>
      <div class="actions">
        <button
          class="button danger"
          @click=${() => {
            if (confirm(`Delete ${draft.name} and everything on it?`)) {
              registry.set(deleteDashboard, draft.id);
              navigate(listPage);
            }
          }}
        >
          ${icon("trash")} Delete
        </button>
        <span class="spacer"></span>
        <a class="button" href=${href(open)} @click=${link(open)}
          >${icon("layout-grid")} Open</a
        >
        <button
          class="button primary"
          ?disabled=${draft.name.trim() === ""}
          @click=${() => {
            registry.set(saveDashboard, { ...draft, name: draft.name.trim() });
            navigate(list.some(({ id }) => id === draft.id) ? listPage : open);
          }}
        >
          Save
        </button>
      </div>
    `;
  }

  override render() {
    if (this.dashboardId !== undefined) {
      return this.draft === undefined
        ? html`<a class="back" href=${href(listPage)} @click=${link(listPage)}
              >${icon("chevron-left")} Dashboards</a
            >
            <p class="lead">There's no dashboard ${this.dashboardId}.</p>`
        : this.#renderEditor(this.draft);
    }

    const list = this.#dashboards.value ?? [];

    return html`
      <div class="spread">
        <h2>Dashboards</h2>
        <button
          class="button"
          @click=${() => {
            const dashboard = newDashboard("New dashboard");

            registry.set(saveDashboard, dashboard);
            registry.set(editing, true);
            navigate({ page: "dashboard", id: dashboard.id });
          }}
        >
          ${icon("plus")} New dashboard
        </button>
      </div>
      <p class="lead">Drag to reorder. The first opens when the panel does.</p>
      <section class="card">
        ${
          list.length === 0
            ? html`<div class="item">
                <span class="muted">No dashboards yet.</span>
              </div>`
            : repeat(
                list,
                (dashboard) => dashboard.id,
                (dashboard) => {
                  const tiles = dashboard.sections.reduce(
                    (sum, section) => sum + section.widgets.length,
                    0,
                  );

                  const to = {
                    page: "settings",
                    section: "dashboards",
                    id: dashboard.id,
                  } as const;

                  return html`<a
                    class="dashboard ${
                      this.target?.id === dashboard.id ? this.target.where : ""
                    }"
                    href=${href(to)}
                    draggable="true"
                    @click=${link(to)}
                    @dragstart=${(event: DragEvent) => {
                      event.dataTransfer?.setData(
                        "application/x-panel-dashboard",
                        dashboard.id,
                      );

                      if (event.dataTransfer !== null) {
                        event.dataTransfer.effectAllowed = "move";
                      }
                    }}
                    @dragover=${(event: DragEvent) => {
                      if (
                        !event.dataTransfer?.types.includes(
                          "application/x-panel-dashboard",
                        ) ||
                        !(event.currentTarget instanceof HTMLElement)
                      ) {
                        return;
                      }

                      event.preventDefault();

                      const { top, height } =
                        event.currentTarget.getBoundingClientRect();

                      this.target = {
                        id: dashboard.id,
                        where:
                          event.clientY < top + height / 2 ? "before" : "after",
                      };
                    }}
                    @dragend=${() => {
                      this.target = undefined;
                    }}
                    @drop=${(event: DragEvent) => this.#drop(event, dashboard.id)}
                  >
                    <span class="grip" title="Drag to reorder"
                      >${icon("grip")}</span
                    >
                    ${icon(dashboard.icon)}
                    <span class="name">${dashboard.name}</span>
                    <span class="count"
                      >${tiles} tile${tiles === 1 ? "" : "s"}</span
                    >
                    <span class="chevron">${icon("chevron-right")}</span>
                  </a>`;
                },
              )
        }
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-dashboards": SettingsDashboards;
  }
}
