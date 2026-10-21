import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HistoryWidget } from "../../../src/panel/Panel.js";
import { AtomController } from "../AtomController.js";
import { type HistoryPoint, history } from "../client.js";
import { entityName, stateText } from "../entity.js";
import { open } from "../state.js";
import { controls } from "../ui.js";

const width = 300;
const height = 100;

// The points as a smoothed line, scaled into the chart's box.
const line = (
  points: ReadonlyArray<HistoryPoint>,
  from: number,
  to: number,
) => {
  const values = points.map(({ value }) => value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xy = points.map(
    ({ time, value }) =>
      [
        ((time - from) / (to - from || 1)) * width,
        height - 8 - ((value - min) / range) * (height - 16),
      ] as const,
  );

  const last = xy.at(-1);

  // The latest value holds until now.
  const extended = last === undefined ? xy : [...xy, [width, last[1]] as const];

  return extended
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
    )
    .join(" ");
};

// A sensor's recent values as a line, with its current value on top.
@customElement("panel-history")
export class PanelHistory extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        cursor: pointer;
      }

      .head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--pn-space-3);
        padding: var(--pn-space-4) var(--pn-space-4) 0;
      }

      .name {
        overflow: hidden;
        font-size: var(--pn-text-s);
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .value {
        font-size: var(--pn-text-xl);
        font-weight: 650;
        letter-spacing: -0.02em;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }

      .range {
        padding: 0 var(--pn-space-4);
        color: var(--pn-text-faint);
        font-size: var(--pn-text-2xs);
      }

      svg {
        flex: 1;
        width: 100%;
        min-height: 0;
        overflow: visible;
      }

      .stroke {
        fill: none;
        stroke: var(--pn-accent-strong);
        stroke-width: 2.25;
        stroke-linejoin: round;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
      }

      .area {
        fill: url(#fill);
      }

      .empty {
        display: grid;
        flex: 1;
        place-items: center;
        color: var(--pn-text-faint);
        font-size: var(--pn-text-s);
      }

      .loading {
        flex: 1;
        margin: var(--pn-space-4);
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: HistoryWidget | undefined;

  @property({ attribute: false }) accessor entity: EntityUpdate | undefined;

  readonly #history = new AtomController(this, () =>
    history(`${this.widget?.entityId ?? ""}|${this.widget?.hours ?? 24}`),
  );

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", () => {
      if (this.widget !== undefined && this.widget.entityId !== "") {
        open({ kind: "details", entityId: this.widget.entityId });
      }
    });
  }

  #chart(points: ReadonlyArray<HistoryPoint>) {
    const hours = this.widget?.hours ?? 24;
    const to = Date.now();
    const from = to - hours * 3_600_000;
    const live = Number(this.entity?.state.state);

    const all = Number.isFinite(live)
      ? [...points, { time: to, value: live }]
      : points;

    if (all.length < 2) {
      return html`<div class="empty">No numeric history yet</div>`;
    }

    const path = line(all, from, to);
    const values = all.map(({ value }) => value);

    const format = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    });

    return html`
      ${svg`<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="var(--pn-accent)" stop-opacity="0.35"></stop>
            <stop offset="100%" stop-color="var(--pn-accent)" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path class="area" d="${path} L${width},${height} L0,${height} Z"></path>
        <path class="stroke" d=${path}></path>
      </svg>`}
      <div class="range">
        ${format.format(Math.min(...values))} –
        ${format.format(Math.max(...values))} · last ${hours} h
      </div>
    `;
  }

  override render() {
    const widget = this.widget;

    if (widget === undefined) {
      return nothing;
    }

    const result = this.#history.value;

    return html`
      <div class="head">
        <span class="name"
          >${entityName(this.entity, widget.entityId, widget.title)}</span
        >
        <span class="value">${stateText(this.entity?.state)}</span>
      </div>
      ${
        AsyncResult.isSuccess(result)
          ? this.#chart(result.value)
          : AsyncResult.isFailure(result)
            ? html`<div class="empty">Couldn't load history</div>`
            : html`<div class="loading skeleton"></div>`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-history": PanelHistory;
  }
}
