import { Schema } from "effect";
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import {
  type Accent,
  type Density,
  PanelState,
  type Settings,
  type Theme,
} from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import {
  dashboards,
  orderDashboards,
  saveDashboard,
  saveSettings,
  settings,
} from "./client.js";
import { icon } from "./icons.js";
import { navigate, open } from "./state.js";
import { controls } from "./ui.js";

const PanelFile = Schema.fromJsonString(PanelState);

const accents: ReadonlyArray<readonly [Accent, number, number]> = [
  ["amber", 75, 0.16],
  ["coral", 38, 0.16],
  ["rose", 8, 0.16],
  ["violet", 295, 0.16],
  ["blue", 252, 0.16],
  ["teal", 185, 0.12],
  ["lime", 128, 0.17],
];

const themes: ReadonlyArray<readonly [Theme, string, string]> = [
  ["system", "System", "monitor"],
  ["light", "Light", "sun"],
  ["dark", "Dark", "moon"],
];

const densities: ReadonlyArray<readonly [Density, string]> = [
  ["comfortable", "Comfortable"],
  ["compact", "Compact"],
];

// How the panel looks, and the dashboards in it. Settings save as they
// change and apply to every screen showing the panel.
@customElement("panel-settings")
export class PanelSettings extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: grid;
        gap: var(--pn-space-8);
        max-width: 48rem;
        padding-top: var(--pn-space-2);
      }

      section {
        display: grid;
        gap: var(--pn-space-4);
      }

      h2 {
        margin: 0;
        font-size: var(--pn-text-l);
        letter-spacing: -0.015em;
      }

      .card {
        display: grid;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-xl);
        background: var(--pn-surface);
        box-shadow: var(--pn-shadow-s);
        backdrop-filter: blur(16px);
        overflow: hidden;
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--pn-space-4);
        min-height: 4.5rem;
        padding: var(--pn-space-4) var(--pn-space-5);
      }

      .item + .item {
        border-top: 1px solid var(--pn-border);
      }

      .label {
        display: grid;
        gap: 0.125rem;
      }

      .label strong {
        font-size: var(--pn-text-m);
        font-weight: 600;
      }

      .label span {
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
      }

      .swatches {
        display: flex;
        gap: var(--pn-space-2);
      }

      .swatch {
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: 2px solid transparent;
        border-radius: 50%;
        background-clip: padding-box;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px oklch(0% 0 0 / 10%);
        transition: transform var(--pn-fast) var(--pn-ease);
      }

      .swatch:hover {
        transform: scale(1.1);
      }

      .swatch[aria-pressed="true"] {
        outline: 2px solid var(--pn-text);
        outline-offset: 2px;
      }

      .segmented .icon {
        width: 1rem;
        height: 1rem;
      }

      .segmented button {
        display: inline-flex;
        align-items: center;
        gap: var(--pn-space-2);
      }

      .dashboard {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 3.75rem;
        padding: var(--pn-space-2) var(--pn-space-3) var(--pn-space-2)
          var(--pn-space-5);
      }

      .dashboard + .dashboard {
        border-top: 1px solid var(--pn-border);
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

      .message {
        font-size: var(--pn-text-s);
      }

      .message.error {
        color: var(--pn-danger);
      }

      .message.ok {
        color: var(--pn-success);
      }
    `,
  ];

  readonly #settings = new AtomController(this, () => settings);

  readonly #dashboards = new AtomController(this, () => dashboards);

  @state() accessor message:
    { readonly ok: boolean; readonly text: string } | undefined;

  #save(patch: Partial<Settings>) {
    registry.set(saveSettings, { ...this.#settings.value, ...patch });
  }

  #move(index: number, by: number) {
    const ids = (this.#dashboards.value ?? []).map(({ id }) => id);
    const [id] = ids.splice(index, 1);

    if (id !== undefined) {
      ids.splice(index + by, 0, id);
      registry.set(orderDashboards, ids);
    }
  }

  #export() {
    const content = Schema.encodeSync(PanelFile)({
      settings: this.#settings.value,
      dashboards: this.#dashboards.value ?? [],
    });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    link.download = "panel.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async #import(event: Event) {
    const input = event.target;
    const file =
      input instanceof HTMLInputElement ? input.files?.[0] : undefined;

    if (file === undefined || !(input instanceof HTMLInputElement)) {
      return;
    }

    const decoded = Schema.decodeUnknownExit(PanelFile)(await file.text());
    input.value = "";

    if (decoded._tag === "Failure") {
      this.message = { ok: false, text: "That file isn't a panel export." };

      return;
    }

    const { settings: imported, dashboards: list } = decoded.value;

    registry.set(saveSettings, imported);

    for (const dashboard of list) {
      registry.set(saveDashboard, dashboard);
    }

    this.message = {
      ok: true,
      text: `Imported ${list.length} dashboard${list.length === 1 ? "" : "s"}.`,
    };
  }

  #item(title: string, about: string, control: unknown) {
    return html`<div class="item">
      <div class="label">
        <strong>${title}</strong>
        <span>${about}</span>
      </div>
      ${control}
    </div>`;
  }

  #switch(value: boolean, label: string, onChange: (value: boolean) => void) {
    return html`<button
      class="switch"
      role="switch"
      aria-label=${label}
      aria-checked=${value ? "true" : "false"}
      @click=${() => onChange(!value)}
    ></button>`;
  }

  override render() {
    const current = this.#settings.value;
    const list = this.#dashboards.value ?? [];

    return html`
      <section>
        <h2>Appearance</h2>
        <div class="card">
          ${this.#item(
            "Theme",
            "Follow the device, or always light or dark",
            html`<div class="segmented" role="group" aria-label="Theme">
              ${themes.map(
                ([theme, label, name]) =>
                  html`<button
                    aria-pressed=${current.theme === theme ? "true" : "false"}
                    @click=${() => this.#save({ theme })}
                  >
                    ${icon(name)} ${label}
                  </button>`,
              )}
            </div>`,
          )}
          ${this.#item(
            "Accent",
            "The colour of anything that's on",
            html`<div class="swatches" role="group" aria-label="Accent">
              ${accents.map(
                ([accent, hue, chroma]) =>
                  html`<button
                    class="swatch"
                    title=${accent}
                    aria-label=${accent}
                    aria-pressed=${current.accent === accent ? "true" : "false"}
                    style="background: oklch(70% ${chroma} ${hue})"
                    @click=${() => this.#save({ accent })}
                  ></button>`,
              )}
            </div>`,
          )}
          ${this.#item(
            "Density",
            "How tall tiles are and how close together",
            html`<div class="segmented" role="group" aria-label="Density">
              ${densities.map(
                ([density, label]) =>
                  html`<button
                    aria-pressed=${current.density === density ? "true" : "false"}
                    @click=${() => this.#save({ density })}
                  >
                    ${label}
                  </button>`,
              )}
            </div>`,
          )}
          ${this.#item(
            "24-hour clock",
            "Show times as 18:30 rather than 6:30 PM",
            this.#switch(current.clock24h, "24-hour clock", (clock24h) =>
              this.#save({ clock24h }),
            ),
          )}
          ${this.#item(
            "Kiosk mode",
            "Hide navigation and editing, for a wall tablet. Open /settings to turn it off.",
            this.#switch(current.kiosk, "Kiosk mode", (kiosk) =>
              this.#save({ kiosk }),
            ),
          )}
        </div>
      </section>
      <section>
        <h2>Dashboards</h2>
        <div class="card">
          ${
            list.length === 0
              ? html`<div class="item">
                  <span class="muted">No dashboards yet.</span>
                </div>`
              : repeat(
                  list,
                  (dashboard) => dashboard.id,
                  (dashboard, index) => {
                    const tiles = dashboard.sections.reduce(
                      (sum, section) => sum + section.widgets.length,
                      0,
                    );

                    return html`<div class="dashboard">
                      ${icon(dashboard.icon)}
                      <span class="name">${dashboard.name}</span>
                      <span class="count"
                        >${tiles} tile${tiles === 1 ? "" : "s"}</span
                      >
                      <button
                        class="icon-button small"
                        title="Move up"
                        ?disabled=${index === 0}
                        @click=${() => this.#move(index, -1)}
                      >
                        ${icon("arrow-up")}
                      </button>
                      <button
                        class="icon-button small"
                        title="Move down"
                        ?disabled=${index === list.length - 1}
                        @click=${() => this.#move(index, 1)}
                      >
                        ${icon("arrow-down")}
                      </button>
                      <button
                        class="icon-button small"
                        title="Rename or delete"
                        @click=${() =>
                          open({
                            kind: "dashboard",
                            dashboardId: dashboard.id,
                          })}
                      >
                        ${icon("pencil")}
                      </button>
                      <button
                        class="icon-button small"
                        title="Open"
                        @click=${() =>
                          navigate({ page: "dashboard", id: dashboard.id })}
                      >
                        ${icon("chevron-right")}
                      </button>
                    </div>`;
                  },
                )
          }
        </div>
      </section>
      <section>
        <h2>Backup</h2>
        <div class="card">
          ${this.#item(
            "Export",
            "Download every dashboard and these settings as one file",
            html`<button class="button" @click=${() => this.#export()}>
              ${icon("arrow-down")} Export
            </button>`,
          )}
          ${this.#item(
            "Import",
            "Restore from an export. Dashboards with the same ID are replaced.",
            html`<label class="button">
              ${icon("arrow-up")} Import
              <input
                class="visually-hidden"
                type="file"
                accept="application/json,.json"
                @change=${(event: Event) => void this.#import(event)}
              />
            </label>`,
          )}
        </div>
        ${
          this.message === undefined
            ? nothing
            : html`<span class="message ${this.message.ok ? "ok" : "error"}"
                >${this.message.text}</span
              >`
        }
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-settings": PanelSettings;
  }
}
