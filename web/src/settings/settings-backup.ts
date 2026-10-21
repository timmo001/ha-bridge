import { Exit, Schema } from "effect";
import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { PanelState } from "../../../src/panel/Panel.js";
import { AtomController, registry } from "../AtomController.js";
import {
  dashboards,
  saveDashboard,
  saveSettings,
  settings,
} from "../client.js";
import { icon } from "../icons.js";
import { controls } from "../ui.js";
import { item, settingsStyles } from "./parts.js";

const PanelFile = Schema.fromJsonString(PanelState);

// Every dashboard and setting, downloaded as one file or restored from one.
@customElement("settings-backup")
export class SettingsBackup extends LitElement {
  static override styles = [controls, settingsStyles];

  readonly #settings = new AtomController(this, () => settings);

  readonly #dashboards = new AtomController(this, () => dashboards);

  @state() accessor message:
    { readonly ok: boolean; readonly text: string } | undefined;

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

    const decoded = Schema.decodeExit(PanelFile)(await file.text());

    input.value = "";

    if (Exit.isFailure(decoded)) {
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

  override render() {
    return html`
      <h2>Backup</h2>
      <section class="card">
        ${item(
          "Export",
          "Download every dashboard and these settings as one file",
          html`<button class="button" @click=${() => this.#export()}>
            ${icon("arrow-down")} Export
          </button>`,
        )}
        ${item(
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
      </section>
      ${
        this.message === undefined
          ? nothing
          : html`<span class="message ${this.message.ok ? "ok" : "error"}"
              >${this.message.text}</span
            >`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-backup": SettingsBackup;
  }
}
