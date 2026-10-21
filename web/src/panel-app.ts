import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import logo from "../../docs/src/assets/logo.svg";
import { AtomController, registry } from "./AtomController.js";
import {
  connected,
  dashboards,
  panel,
  saveDashboard,
  settings,
} from "./client.js";
import { newDashboard } from "./edit.js";
import { icon } from "./icons.js";
import "./panel-backdrop.js";
import "./panel-dashboard.js";
import "./panel-overlays.js";
import "./panel-command.js";
import { openCommands } from "./panel-command.js";
import "./panel-settings.js";
import { editing, href, navigate, now, prefersDark, route } from "./state.js";
import { applyPalette, resolvePalette } from "./themes.js";
import { controls } from "./ui.js";

const settingsHome = { page: "settings", section: "appearance" } as const;

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

@customElement("panel-app")
export class PanelApp extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
        min-height: 100dvh;
      }

      .logo {
        display: block;
        flex: none;
        width: 2rem;
        height: 2rem;
      }

      .switcher {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-width: 0;
        margin-left: calc(-1 * var(--pn-space-2));
        padding: var(--pn-space-1) var(--pn-space-2);
        border: none;
        border-radius: var(--pn-radius-m);
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        anchor-name: --switcher;
      }

      .switcher:hover {
        background: var(--pn-surface-hover);
      }

      .switcher > .icon {
        flex: none;
        color: var(--pn-text-faint);
      }

      .menu {
        position: fixed;
        position-anchor: --switcher;
        inset: auto;
        top: anchor(bottom);
        left: anchor(left);
        position-try-fallbacks: flip-block;
        width: 16rem;
        max-height: min(30rem, 70dvh);
        margin: var(--pn-space-2) 0 0;
        padding: var(--pn-space-2);
        overflow-y: auto;
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow: var(--pn-shadow-l);
        scrollbar-width: thin;
      }

      .menu:popover-open {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .link {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 2.5rem;
        padding: 0 var(--pn-space-3);
        border: none;
        border-radius: var(--pn-radius-m);
        background: transparent;
        color: var(--pn-text-muted);
        font: inherit;
        font-size: var(--pn-text-s);
        font-weight: 560;
        text-align: left;
        text-decoration: none;
        cursor: pointer;
      }

      .link span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .link:hover {
        background: var(--pn-surface-hover);
        color: var(--pn-text);
      }

      .link[aria-current="page"] {
        color: var(--pn-text);
      }

      .link[aria-current="page"] .icon {
        color: var(--pn-accent-strong);
      }

      .menu hr {
        margin: var(--pn-space-1) 0;
        border: none;
        border-top: 1px solid var(--pn-border);
      }

      main {
        position: relative;
        z-index: 1;
        min-width: 0;
        min-height: 100dvh;
        padding: 0 clamp(var(--pn-space-4), 3vw, var(--pn-space-10))
          var(--pn-space-10);
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: var(--pn-space-4);
        min-height: 4.5rem;
        margin: 0 calc(-1 * clamp(var(--pn-space-4), 3vw, var(--pn-space-10)));
        padding: var(--pn-space-3)
          clamp(var(--pn-space-4), 3vw, var(--pn-space-10));
        /* Frosted, fading out at the bottom, so it works over any background. */
        background: linear-gradient(
          color-mix(in oklab, var(--pn-bg) 72%, transparent),
          color-mix(in oklab, var(--pn-bg) 0%, transparent)
        );
        backdrop-filter: blur(14px) saturate(1.3);
        mask-image: linear-gradient(black 65%, transparent);
      }

      h1 {
        margin: 0;
        font-size: var(--pn-text-xl);
        font-weight: 680;
        letter-spacing: -0.02em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .time {
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
        font-weight: 560;
        font-variant-numeric: tabular-nums;
      }

      .offline {
        display: inline-flex;
        align-items: center;
        gap: var(--pn-space-2);
        min-height: 1.75rem;
        padding: 0 var(--pn-space-3);
        border-radius: var(--pn-radius-full);
        background: var(--pn-danger-soft);
        color: var(--pn-danger);
        font-size: var(--pn-text-xs);
        font-weight: 600;
      }

      .pulse {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: currentColor;
        animation: pulse 1.2s ease-in-out infinite;
      }

      @keyframes pulse {
        50% {
          opacity: 0.3;
        }
      }

      .search {
        display: inline-flex;
        align-items: center;
        gap: var(--pn-space-2);
        min-width: 13rem;
        min-height: 2.5rem;
        padding: 0 var(--pn-space-2) 0 var(--pn-space-3);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-full);
        background: var(--pn-surface);
        backdrop-filter: blur(16px);
        color: var(--pn-text-faint);
        font: inherit;
        font-size: var(--pn-text-s);
        cursor: pointer;
        transition: border-color var(--pn-fast) var(--pn-ease);
      }

      .search:hover {
        border-color: var(--pn-border-strong);
        color: var(--pn-text-muted);
      }

      .search .icon {
        width: 1rem;
        height: 1rem;
      }

      .search span {
        flex: 1;
        text-align: left;
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

      @media (max-width: 900px) {
        .search {
          min-width: 0;
          width: 2.5rem;
          padding: 0;
          justify-content: center;
        }

        .search span,
        .search kbd {
          display: none;
        }
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--pn-space-2);
        margin-left: auto;
      }

      .center {
        display: grid;
        place-items: center;
        gap: var(--pn-space-4);
        min-height: 70dvh;
        text-align: center;
      }

      .empty {
        display: grid;
        justify-items: center;
        gap: var(--pn-space-3);
        max-width: 26rem;
      }

      .empty h2 {
        margin: 0;
        font-size: var(--pn-text-2xl);
        letter-spacing: -0.02em;
      }

      .empty p {
        margin: 0 0 var(--pn-space-3);
        color: var(--pn-text-muted);
      }

      .hero-logo {
        width: 5.5rem;
        height: 5.5rem;
        filter: drop-shadow(0 16px 32px var(--pn-accent-ring));
      }

      .spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--pn-border-strong);
        border-top-color: var(--pn-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(1turn);
        }
      }

      @media (max-width: 700px) {
        .time {
          display: none;
        }

        .menu {
          inset: auto var(--pn-space-3) var(--pn-space-3);
          width: auto;
          margin: 0;
        }
      }
    `,
  ];

  readonly #panel = new AtomController(this, () => panel);

  readonly #dashboards = new AtomController(this, () => dashboards);

  readonly #settings = new AtomController(this, () => settings);

  readonly #route = new AtomController(this, () => route);

  readonly #editing = new AtomController(this, () => editing);

  readonly #now = new AtomController(this, () => now(15_000));

  readonly #prefersDark = new AtomController(this, () => prefersDark);

  readonly #connected = new AtomController(this, () => connected);

  @query("#switcher") accessor menu: HTMLElement | null = null;

  override updated() {
    const current = this.#settings.value;
    const root = document.documentElement;

    applyPalette(root, resolvePalette(current, this.#prefersDark.value));
    root.dataset.density = current.density;
  }

  #create() {
    const dashboard = newDashboard(
      (this.#dashboards.value?.length ?? 0) === 0 ? "Home" : "New dashboard",
    );

    registry.set(saveDashboard, dashboard);
    navigate({ page: "dashboard", id: dashboard.id });
    registry.set(editing, true);
  }

  #link(event: MouseEvent, to: Parameters<typeof navigate>[0]) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    this.menu?.hidePopover();
    navigate(to);
  }

  #time() {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: !this.#settings.value.clock24h,
    }).format(this.#now.value);
  }

  // The dashboard switcher in the top bar: the logo and the page's name,
  // opening a menu of dashboards and settings.
  #renderSwitcher(title: string, current: string | undefined) {
    const list = this.#dashboards.value ?? [];
    const onSettings = this.#route.value.page === "settings";

    return html`
      <button
        class="switcher"
        popovertarget="switcher"
        aria-haspopup="menu"
        title="Dashboards and settings"
      >
        <img class="logo" src=${logo} alt="" />
        <h1>${title}</h1>
        ${icon("chevron-down")}
      </button>
      <nav id="switcher" class="menu" popover aria-label="Dashboards">
        ${repeat(
          list,
          (dashboard) => dashboard.id,
          (dashboard) => {
            const to = { page: "dashboard", id: dashboard.id } as const;

            return html`<a
              class="link"
              href=${href(to)}
              aria-current=${
                !onSettings && dashboard.id === current ? "page" : "false"
              }
              @click=${(event: MouseEvent) => this.#link(event, to)}
            >
              ${icon(dashboard.icon)}<span>${dashboard.name}</span>
            </a>`;
          },
        )}
        <button
          class="link"
          @click=${() => {
            this.menu?.hidePopover();
            this.#create();
          }}
        >
          ${icon("plus")}<span>New dashboard</span>
        </button>
        <hr />
        <a
          class="link"
          href=${href(settingsHome)}
          aria-current=${onSettings ? "page" : "false"}
          @click=${(event: MouseEvent) => this.#link(event, settingsHome)}
        >
          ${icon("settings")}<span>Settings</span>
        </a>
      </nav>
    `;
  }

  #renderEmpty() {
    return html`
      <div class="center">
        <div class="empty">
          <img class="hero-logo" src=${logo} alt="" />
          <h2>Build your first dashboard</h2>
          <p>
            Group your home into sections, then fill them with tiles for lights,
            sensors, clocks, notes and more.
          </p>
          <button class="button accent" @click=${() => this.#create()}>
            ${icon("plus")} Create a dashboard
          </button>
        </div>
      </div>
    `;
  }

  override render() {
    const result = this.#panel.value;

    if (AsyncResult.isFailure(result) && !AsyncResult.isSuccess(result)) {
      return html`<div class="center">
        <div class="empty">
          <h2>Can't reach the panel</h2>
          <p>Retrying. Check that ha-bridge serve and panel are running.</p>
          <div class="spinner"></div>
        </div>
      </div>`;
    }

    const list = this.#dashboards.value;

    if (list === undefined) {
      return html`<div class="center"><div class="spinner"></div></div>`;
    }

    const current = this.#route.value;

    const dashboard =
      current.page === "dashboard"
        ? (list.find(({ id }) => id === current.id) ?? list[0])
        : undefined;

    const { kiosk } = this.#settings.value;
    const isEditing = this.#editing.value && !kiosk;

    const title =
      current.page === "settings" ? "Settings" : (dashboard?.name ?? "Panel");

    return html`
      <panel-backdrop
        .background=${dashboard?.background ?? this.#settings.value.background}
      ></panel-backdrop>
      <main>
        <header class="topbar">
          ${kiosk ? html`<h1>${title}</h1>` : this.#renderSwitcher(title, dashboard?.id)}
          <span class="time">${this.#time()}</span>
          ${
            this.#connected.value
              ? nothing
              : html`<span class="offline" role="status">
                  <span class="pulse"></span>Reconnecting
                </span>`
          }
          <div class="actions">
            <button
              class="search"
              aria-keyshortcuts="Meta+K Control+K"
              @click=${() => openCommands()}
            >
              ${icon("search")}<span>Search</span>
              <kbd>${isMac ? "⌘" : "Ctrl"} K</kbd>
            </button>
            ${
              dashboard !== undefined && current.page === "dashboard" && !kiosk
                ? html`
                    ${
                      isEditing
                        ? html`<button
                            class="button ghost"
                            @click=${() =>
                              navigate({
                                page: "settings",
                                section: "dashboards",
                                id: dashboard.id,
                              })}
                          >
                            ${icon("settings")} Customise
                          </button>`
                        : nothing
                    }
                    <button
                      class="button ${isEditing ? "primary" : ""}"
                      aria-pressed=${isEditing ? "true" : "false"}
                      @click=${() => registry.set(editing, !isEditing)}
                    >
                      ${icon(isEditing ? "check" : "pencil")}
                      ${isEditing ? "Done" : "Edit"}
                    </button>
                  `
                : nothing
            }
          </div>
        </header>
        ${
          current.page === "settings"
            ? html`<panel-settings .route=${current}></panel-settings>`
            : dashboard === undefined
              ? this.#renderEmpty()
              : html`<panel-dashboard
                  .dashboard=${dashboard}
                  .editing=${isEditing}
                ></panel-dashboard>`
        }
      </main>
      <panel-overlays></panel-overlays>
      <panel-command></panel-command>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-app": PanelApp;
  }
}
