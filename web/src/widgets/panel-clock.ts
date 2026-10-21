import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ClockWidget } from "../../../src/panel/Panel.js";
import { AtomController } from "../AtomController.js";
import { settings } from "../client.js";
import { now } from "../state.js";
import { controls } from "../ui.js";

// The time, large, with the date under it.
@customElement("panel-clock")
export class PanelClock extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        padding: var(--pn-space-4) var(--pn-space-5);
        container-type: size;
      }

      .time {
        font-size: clamp(2rem, min(22cqi, 50cqb), 6rem);
        font-weight: 640;
        letter-spacing: -0.045em;
        line-height: 0.95;
        font-variant-numeric: tabular-nums;
      }

      .seconds {
        color: var(--pn-text-faint);
        font-size: 0.45em;
        letter-spacing: -0.02em;
      }

      .date {
        margin-top: var(--pn-space-2);
        color: var(--pn-text-muted);
        font-size: clamp(var(--pn-text-s), 6cqi, var(--pn-text-l));
        font-weight: 560;
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: ClockWidget | undefined;

  readonly #now = new AtomController(this, () =>
    now(this.widget?.showSeconds ? 1000 : 10_000),
  );

  readonly #settings = new AtomController(this, () => settings);

  override render() {
    const widget = this.widget;

    if (widget === undefined) {
      return nothing;
    }

    const date = new Date(this.#now.value);
    const hour12 = !this.#settings.value.clock24h;
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12,
    }).format(date);

    return html`
      ${widget.title ? html`<div class="eyebrow">${widget.title}</div>` : nothing}
      <div class="time">
        ${time}${
          widget.showSeconds
            ? html`<span class="seconds"
                >:${String(date.getSeconds()).padStart(2, "0")}</span
              >`
            : nothing
        }
      </div>
      ${
        widget.showDate
          ? html`<div class="date">
              ${new Intl.DateTimeFormat(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(date)}
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-clock": PanelClock;
  }
}
