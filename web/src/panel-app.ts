import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
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
import "./panel-settings.js";
import {
  editing,
  href,
  navigate,
  now,
  open,
  prefersDark,
  route,
} from "./state.js";
import { applyPalette, resolvePalette } from "./themes.js";
import { controls } from "./ui.js";

@customElement("panel-app")
export class PanelApp extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
        min-height: 100dvh;
      }

      .shell {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        min-height: 100dvh;
      }

      .rail {
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        gap: var(--pn-space-1);
        width: 15rem;
        height: 100dvh;
        padding: var(--pn-space-5) var(--pn-space-3);
        border-right: 1px solid var(--pn-border);
        background: color-mix(
          in oklab,
          var(--pn-surface-solid) 55%,
          transparent
        );
        backdrop-filter: blur(24px) saturate(1.4);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        padding: 0 var(--pn-space-3) var(--pn-space-5);
        font-weight: 680;
        letter-spacing: -0.01em;
      }

      .brand.compact {
        display: none;
      }

      .logo {
        display: block;
        flex: none;
        width: 2rem;
        height: 2rem;
      }

      .brand span {
        display: grid;
        line-height: 1.15;
      }

      .brand small {
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
        font-weight: 560;
        letter-spacing: 0.02em;
      }

      .nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
        scrollbar-width: none;
      }

      .nav-label {
        padding: var(--pn-space-3) var(--pn-space-3) var(--pn-space-2);
      }

      .link {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 2.5rem;
        padding: 0 var(--pn-space-3);
        border-radius: var(--pn-radius-m);
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
        font-weight: 560;
        text-decoration: none;
        transition:
          background var(--pn-fast) var(--pn-ease),
          color var(--pn-fast) var(--pn-ease);
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
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow:
          var(--pn-shadow-s),
          inset 0 0 0 1px var(--pn-border);
      }

      .link[aria-current="page"] .icon {
        color: var(--pn-accent-strong);
      }

      .new {
        margin-top: var(--pn-space-1);
        border: 1px dashed var(--pn-border-strong);
        background: transparent;
        cursor: pointer;
        font: inherit;
        font-size: var(--pn-text-s);
      }

      .rail-end {
        margin-top: auto;
        padding-top: var(--pn-space-3);
        border-top: 1px solid var(--pn-border);
      }

      main {
        min-width: 0;
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

      .kiosk .rail {
        display: none;
      }

      .kiosk {
        grid-template-columns: minmax(0, 1fr);
      }

      @media (max-width: 1100px) {
        .rail {
          width: 4.5rem;
          align-items: center;
        }

        .brand,
        .nav-label,
        .link span {
          display: none;
        }

        .brand.compact {
          display: flex;
          padding: 0 0 var(--pn-space-5);
        }

        .link {
          justify-content: center;
          width: 3rem;
          padding: 0;
        }
      }

      @media (max-width: 700px) {
        .shell {
          grid-template-columns: minmax(0, 1fr);
        }

        .rail {
          position: fixed;
          inset: auto var(--pn-space-3) var(--pn-space-3);
          z-index: 20;
          flex-direction: row;
          width: auto;
          height: auto;
          padding: var(--pn-space-1);
          border: 1px solid var(--pn-border);
          border-radius: var(--pn-radius-xl);
          background: color-mix(
            in oklab,
            var(--pn-surface-solid) 80%,
            transparent
          );
          box-shadow: var(--pn-shadow-l);
        }

        .brand.compact {
          display: none;
        }

        .nav {
          flex-direction: row;
          overflow-x: auto;
          flex: 1;
        }

        .rail-end {
          margin: 0;
          padding: 0 0 0 var(--pn-space-1);
          border-top: none;
          border-left: 1px solid var(--pn-border);
        }

        main {
          padding-bottom: 6rem;
        }

        .time {
          display: none;
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

  #renderRail(current: string | undefined) {
    const list = this.#dashboards.value ?? [];
    const onSettings = this.#route.value.page === "settings";

    return html`
      <nav class="rail" aria-label="Dashboards">
        <div class="brand">
          <img class="logo" src=${logo} alt="" />
          <span>Panel<small>Home Assistant Bridge</small></span>
        </div>
        <div class="brand compact">
          <img class="logo" src=${logo} alt="Home Assistant Bridge panel" />
        </div>
        <div class="eyebrow nav-label">Dashboards</div>
        <div class="nav">
          ${repeat(
            list,
            (dashboard) => dashboard.id,
            (dashboard) => {
              const to = { page: "dashboard", id: dashboard.id } as const;

              return html`<a
                class="link"
                href=${href(to)}
                title=${dashboard.name}
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
            class="link new"
            title="New dashboard"
            @click=${() => this.#create()}
          >
            ${icon("plus")}<span>New dashboard</span>
          </button>
        </div>
        <div class="rail-end">
          <a
            class="link"
            href=${href({ page: "settings" })}
            title="Settings"
            aria-current=${onSettings ? "page" : "false"}
            @click=${(event: MouseEvent) =>
              this.#link(event, { page: "settings" })}
          >
            ${icon("settings")}<span>Settings</span>
          </a>
        </div>
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

    return html`
      <panel-backdrop
        .background=${dashboard?.background ?? this.#settings.value.background}
      ></panel-backdrop>
      <div class="shell ${kiosk ? "kiosk" : ""}">
        ${this.#renderRail(dashboard?.id)}
        <main>
          <header class="topbar">
            <h1>
              ${
                current.page === "settings"
                  ? "Settings"
                  : (dashboard?.name ?? "Panel")
              }
            </h1>
            <span class="time">${this.#time()}</span>
            ${
              this.#connected.value
                ? nothing
                : html`<span class="offline" role="status">
                    <span class="pulse"></span>Reconnecting
                  </span>`
            }
            <div class="actions">
              ${
                dashboard !== undefined &&
                current.page === "dashboard" &&
                !kiosk
                  ? html`
                      ${
                        isEditing
                          ? html`<button
                              class="button ghost"
                              @click=${() =>
                                open({
                                  kind: "dashboard",
                                  dashboardId: dashboard.id,
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
              ? html`<panel-settings></panel-settings>`
              : dashboard === undefined
                ? this.#renderEmpty()
                : html`<panel-dashboard
                    .dashboard=${dashboard}
                    .editing=${isEditing}
                  ></panel-dashboard>`
          }
        </main>
      </div>
      <panel-overlays></panel-overlays>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-app": PanelApp;
  }
}
