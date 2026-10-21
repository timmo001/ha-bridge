import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Background, BackgroundKind } from "../../src/panel/Panel.js";
import { cssUrl } from "./panel-backdrop.js";
import { controls } from "./ui.js";

const kinds: ReadonlyArray<readonly [BackgroundKind, string]> = [
  ["theme", "Glow"],
  ["plain", "Plain"],
  ["color", "Colour"],
  ["image", "Image"],
];

// Picks a background, with a small preview. Fires `background-change` with the new
// background on every edit.
@customElement("panel-background-editor")
export class PanelBackgroundEditor extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: grid;
        gap: var(--pn-space-4);
      }

      .preview {
        position: relative;
        height: 7rem;
        overflow: hidden;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
        background: var(--pn-bg);
      }

      .preview > div {
        position: absolute;
        inset: 0;
        background-position: center;
        background-size: cover;
      }

      .glow {
        background: radial-gradient(
          circle at 85% 0%,
          var(--pn-bg-glow),
          transparent 70%
        );
      }

      .dim {
        background: var(--pn-bg);
      }

      .tiles {
        position: absolute;
        inset: auto var(--pn-space-4) var(--pn-space-4);
        display: flex;
        gap: var(--pn-space-2);
      }

      .tiles span {
        width: 3.5rem;
        height: 2.5rem;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-m);
        background: var(--pn-surface);
        backdrop-filter: blur(12px);
      }

      .tiles span:first-child {
        background: var(--pn-accent);
      }

      .colour {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
      }

      input[type="color"] {
        width: 3rem;
        height: 2.75rem;
        padding: 0.25rem;
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-m);
        background: var(--pn-surface-sunken);
        cursor: pointer;
      }

      input[type="range"] {
        width: 100%;
        accent-color: var(--pn-accent);
      }
    `,
  ];

  @property({ attribute: false }) accessor value: Background = {
    kind: "theme",
    blur: 0,
    dim: 30,
  };

  #change(next: Background) {
    this.dispatchEvent(new CustomEvent("background-change", { detail: next }));
  }

  #range(
    label: string,
    value: number,
    max: number,
    unit: string,
    onInput: (value: number) => void,
  ) {
    return html`<label class="field">
      <span class="spread"
        ><span>${label}</span><span class="muted">${value}${unit}</span></span
      >
      <input
        type="range"
        min="0"
        max=${max}
        .value=${String(value)}
        @input=${(event: InputEvent) => {
          if (event.target instanceof HTMLInputElement) {
            onInput(Number(event.target.value));
          }
        }}
      />
    </label>`;
  }

  #preview(value: Background) {
    const layer =
      value.kind === "theme"
        ? html`<div class="glow"></div>`
        : value.kind === "color"
          ? html`<div
              style=${styleMap({ background: value.color ?? "" })}
            ></div>`
          : value.kind === "image" && value.image
            ? html`<div
                  style=${styleMap({
                    backgroundImage: cssUrl(value.image),
                    filter: `blur(${value.blur / 3}px)`,
                    inset: value.blur > 0 ? "-1rem" : "0",
                  })}
                ></div>
                <div
                  class="dim"
                  style=${styleMap({ opacity: String(value.dim / 100) })}
                ></div>`
            : nothing;

    return html`<div class="preview" aria-hidden="true">
      ${layer}
      <div class="tiles"><span></span><span></span><span></span></div>
    </div>`;
  }

  override render() {
    const value = this.value;

    return html`
      ${this.#preview(value)}
      <div class="segmented" role="group" aria-label="Background">
        ${kinds.map(
          ([kind, label]) =>
            html`<button
              type="button"
              aria-pressed=${value.kind === kind ? "true" : "false"}
              @click=${() => this.#change({ ...value, kind })}
            >
              ${label}
            </button>`,
        )}
      </div>
      ${
        value.kind === "color"
          ? html`<label class="field">
              <span>Colour</span>
              <span class="colour">
                <input
                  type="color"
                  .value=${value.color ?? "#1a1b26"}
                  @input=${(event: InputEvent) => {
                    if (event.target instanceof HTMLInputElement) {
                      this.#change({ ...value, color: event.target.value });
                    }
                  }}
                />
                <span class="muted">${value.color ?? "#1a1b26"}</span>
              </span>
            </label>`
          : nothing
      }
      ${
        value.kind === "image"
          ? html`<label class="field">
                <span>Image URL</span>
                <input
                  type="url"
                  placeholder="https://"
                  .value=${value.image ?? ""}
                  @input=${(event: InputEvent) => {
                    if (event.target instanceof HTMLInputElement) {
                      this.#change({ ...value, image: event.target.value });
                    }
                  }}
                />
              </label>
              ${this.#range("Blur", value.blur, 40, " px", (blur) =>
                this.#change({ ...value, blur }),
              )}
              ${this.#range("Dim", value.dim, 90, "%", (dim) =>
                this.#change({ ...value, dim }),
              )}`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-background-editor": PanelBackgroundEditor;
  }
}
