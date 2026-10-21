import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { EntityWidget } from "../../../src/panel/Panel.js";
import { AtomController, registry } from "../AtomController.js";
import { callAction } from "../client.js";
import {
  canToggle,
  domainOf,
  entityIcon,
  entityName,
  isActive,
  isUnavailable,
  relativeTime,
  stateText,
  toggleAction,
} from "../entity.js";
import { icon } from "../icons.js";
import { now, open } from "../state.js";
import { controls } from "../ui.js";

const longPress = 450;

// An entity as a tile: its icon, name and state, lit up in the accent colour
// while it's on. Tapping runs the widget's tap action; a long press, or the
// arrow on larger tiles, opens its details.
@customElement("panel-entity-tile")
export class PanelEntityTile extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
        height: 100%;
      }

      .tile {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--pn-space-2);
        width: 100%;
        height: 100%;
        padding: var(--pn-space-3) var(--pn-space-4) var(--pn-space-3);
        overflow: hidden;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface);
        box-shadow: var(--pn-shadow-s);
        backdrop-filter: blur(16px);
        color: var(--pn-text);
        font: inherit;
        text-align: left;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition:
          background var(--pn-slow) var(--pn-ease),
          border-color var(--pn-slow) var(--pn-ease),
          box-shadow var(--pn-slow) var(--pn-ease),
          transform var(--pn-fast) var(--pn-ease);
      }

      .tile:hover {
        border-color: var(--pn-border-strong);
        box-shadow: var(--pn-shadow-m);
      }

      .tile:active {
        transform: scale(0.975);
      }

      .tile.static {
        cursor: default;
      }

      .tile.active {
        background:
          radial-gradient(
            120% 90% at 0% 0%,
            oklch(80% var(--pn-chroma) var(--pn-hue) / 34%),
            transparent 70%
          ),
          var(--pn-surface);
        border-color: oklch(70% var(--pn-chroma) var(--pn-hue) / 35%);
      }

      .tile.off {
        opacity: 0.55;
      }

      .top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--pn-space-2);
      }

      .chip {
        display: grid;
        place-items: center;
        flex: none;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--pn-radius-m);
        background: var(--pn-surface-sunken);
        color: var(--pn-text-muted);
        transition:
          background var(--pn-slow) var(--pn-ease),
          color var(--pn-slow) var(--pn-ease),
          box-shadow var(--pn-slow) var(--pn-ease);
      }

      .active .chip {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
        box-shadow: 0 6px 18px -6px var(--pn-accent-ring);
      }

      :host {
        position: relative;
      }

      .more {
        position: absolute;
        top: var(--pn-space-2);
        right: var(--pn-space-2);
        z-index: 1;
        display: grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: none;
        border-radius: var(--pn-radius-full);
        background: transparent;
        color: var(--pn-text-faint);
        cursor: pointer;
      }

      .more:hover {
        background: var(--pn-surface-hover);
        color: var(--pn-text);
      }

      .more .icon {
        width: 1rem;
        height: 1rem;
      }

      .text {
        display: grid;
        min-width: 0;
      }

      .name {
        overflow: hidden;
        font-size: var(--pn-text-s);
        font-weight: 600;
        line-height: 1.3;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .state {
        overflow: hidden;
        color: var(--pn-text-muted);
        font-size: var(--pn-text-xs);
        font-weight: 500;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .big {
        font-size: clamp(1.5rem, 9cqi, 2.75rem);
        font-weight: 650;
        letter-spacing: -0.03em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      .wide {
        container-type: size;
      }

      /* Short tiles put the icon beside the text. */
      .compact {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: var(--pn-space-3);
      }

      .compact .top {
        flex: none;
      }

      .compact .more {
        display: none;
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: EntityWidget | undefined;

  @property({ attribute: false }) accessor entity: EntityUpdate | undefined;

  @property({ type: Boolean }) accessor editing = false;

  // Relative times stay current.
  readonly #now = new AtomController(this, () => now(30_000));

  #timer: ReturnType<typeof setTimeout> | undefined;

  #pressed = false;

  #details() {
    if (this.widget !== undefined && this.widget.entityId !== "") {
      open({ kind: "details", entityId: this.widget.entityId });
    }
  }

  #tap() {
    const widget = this.widget;
    const state = this.entity?.state;

    if (this.editing || widget === undefined) {
      return;
    }

    if (
      widget.tap === "details" ||
      (widget.tap === "toggle" && !canToggle(widget.entityId))
    ) {
      this.#details();

      return;
    }

    if (widget.tap === "toggle" && state !== undefined) {
      const action = toggleAction(state);

      if (action !== undefined) {
        registry.set(callAction, action);
      }
    }
  }

  #down() {
    this.#pressed = false;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#pressed = true;
      this.#details();
    }, longPress);
  }

  #up() {
    clearTimeout(this.#timer);
  }

  #secondary(widget: EntityWidget) {
    const state = this.entity?.state;

    switch (widget.secondary) {
      case "none":
        return "";
      case "last-changed":
        return state?.last_changed === undefined
          ? ""
          : relativeTime(state.last_changed, this.#now.value);
      case "state":
        return stateText(state);
    }
  }

  override render() {
    const widget = this.widget;

    if (widget === undefined) {
      return nothing;
    }

    const update = this.entity;
    const state = update?.state;
    const active = state !== undefined && isActive(state);
    const off = state === undefined || isUnavailable(state);
    const actionable = widget.tap !== "none";
    const compact = widget.size.rows === 1 && widget.size.columns >= 2;
    const roomy = widget.size.rows >= 2;
    const name = entityName(update, widget.entityId, widget.title);

    const numeric =
      state !== undefined &&
      state.state !== "" &&
      Number.isFinite(Number(state.state));

    const domain = domainOf(widget.entityId);

    return html`
      ${
        roomy && !this.editing
          ? html`<button
              class="more"
              title="Details"
              aria-label="${name} details"
              @click=${() => this.#details()}
            >
              ${icon("chevron-right")}
            </button>`
          : nothing
      }
      <button
        class="tile ${active ? "active" : ""} ${off ? "off" : ""} ${
          compact ? "compact" : ""
        } ${actionable ? "" : "static"} ${roomy ? "wide" : ""}"
        aria-label="${name}, ${stateText(state)}"
        aria-pressed=${
          canToggle(widget.entityId) &&
          domain !== "button" &&
          domain !== "scene"
            ? active
              ? "true"
              : "false"
            : nothing
        }
        @pointerdown=${() => this.#down()}
        @pointerup=${() => this.#up()}
        @pointerleave=${() => this.#up()}
        @pointercancel=${() => this.#up()}
        @contextmenu=${(event: Event) => {
          event.preventDefault();
          clearTimeout(this.#timer);
          this.#details();
        }}
        @click=${() => {
          if (!this.#pressed) {
            this.#tap();
          }

          this.#pressed = false;
        }}
      >
        <div class="top">
          <span class="chip">
            ${icon(widget.icon ?? entityIcon(state, widget.entityId))}
          </span>
        </div>
        ${
          roomy && numeric
            ? html`<div class="big">${stateText(state)}</div>`
            : nothing
        }
        <div class="text">
          <span class="name">${name}</span>
          ${
            roomy && numeric
              ? nothing
              : html`<span class="state">${this.#secondary(widget)}</span>`
          }
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-entity-tile": PanelEntityTile;
  }
}
