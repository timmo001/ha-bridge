import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { icon } from "./icons.js";
import "./settings/settings-appearance.js";
import "./settings/settings-backup.js";
import "./settings/settings-dashboards.js";
import "./settings/settings-themes.js";
import {
  href,
  navigate,
  type Route,
  type SettingsSection,
  settingsSections,
} from "./state.js";
import { controls } from "./ui.js";

export const sectionInfo: Readonly<
  Record<SettingsSection, { name: string; icon: string; about: string }>
> = {
  appearance: {
    name: "Appearance",
    icon: "sun",
    about: "Mode, accent, background and density",
  },
  themes: { name: "Themes", icon: "sparkles", about: "Built-in and your own" },
  dashboards: {
    name: "Dashboards",
    icon: "layout-grid",
    about: "Order, names, icons and backgrounds",
  },
  backup: { name: "Backup", icon: "copy", about: "Export and import" },
};

// The settings pages, with a list of them beside the open one.
@customElement("panel-settings")
export class PanelSettings extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: grid;
        grid-template-columns: 15rem minmax(0, 48rem);
        gap: var(--pn-space-8);
        align-items: start;
        padding-top: var(--pn-space-2);
      }

      nav {
        position: sticky;
        top: 5.5rem;
        display: grid;
        gap: 2px;
      }

      a {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        padding: var(--pn-space-2) var(--pn-space-3);
        border-radius: var(--pn-radius-m);
        color: var(--pn-text-muted);
        text-decoration: none;
        transition:
          background var(--pn-fast) var(--pn-ease),
          color var(--pn-fast) var(--pn-ease);
      }

      a:hover {
        background: var(--pn-surface-hover);
        color: var(--pn-text);
      }

      a[aria-current="page"] {
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow:
          var(--pn-shadow-s),
          inset 0 0 0 1px var(--pn-border);
      }

      a[aria-current="page"] .icon {
        color: var(--pn-accent-strong);
      }

      .text {
        display: grid;
        min-width: 0;
      }

      .text strong {
        font-size: var(--pn-text-s);
        font-weight: 600;
      }

      .text small {
        overflow: hidden;
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 900px) {
        :host {
          grid-template-columns: minmax(0, 1fr);
          gap: var(--pn-space-5);
        }

        nav {
          position: static;
          display: flex;
          gap: var(--pn-space-1);
          overflow-x: auto;
          scrollbar-width: none;
        }

        a {
          flex: none;
          padding: var(--pn-space-2) var(--pn-space-3);
          border-radius: var(--pn-radius-full);
        }

        .text small {
          display: none;
        }
      }
    `,
  ];

  @property({ attribute: false }) accessor route: Route | undefined;

  #page() {
    const route = this.route;

    if (route?.page !== "settings") {
      return nothing;
    }

    switch (route.section) {
      case "appearance":
        return html`<settings-appearance></settings-appearance>`;
      case "themes":
        return html`<settings-themes .themeId=${route.id}></settings-themes>`;
      case "dashboards":
        return html`<settings-dashboards
          .dashboardId=${route.id}
        ></settings-dashboards>`;
      case "backup":
        return html`<settings-backup></settings-backup>`;
    }
  }

  override render() {
    const current =
      this.route?.page === "settings" ? this.route.section : undefined;

    return html`
      <nav aria-label="Settings">
        ${settingsSections.map((section) => {
          const info = sectionInfo[section];
          const to = { page: "settings", section } as const;

          return html`<a
            href=${href(to)}
            aria-current=${current === section ? "page" : "false"}
            @click=${(event: MouseEvent) => {
              event.preventDefault();
              navigate(to);
            }}
          >
            ${icon(info.icon)}
            <span class="text">
              <strong>${info.name}</strong>
              <small>${info.about}</small>
            </span>
          </a>`;
        })}
      </nav>
      <div>${this.#page()}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-settings": PanelSettings;
  }
}
