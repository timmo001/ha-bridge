import type { Action } from "@timmo001/effect-ha";
import { Predicate } from "effect";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { HistoryWidget } from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { callAction, entity } from "./client.js";
import {
  canToggle,
  domainOf,
  type EntityState,
  entityIcon,
  isActive,
  numberAttribute,
  relativeTime,
  stateText,
  stringAttribute,
  toggleAction,
} from "./entity.js";
import { icon } from "./icons.js";
import "./panel-sheet.js";
import { now } from "./state.js";
import { controls } from "./ui.js";
import "./widgets/panel-history.js";

const hiddenAttributes = new Set([
  "friendly_name",
  "icon",
  "entity_picture",
  "supported_features",
  "supported_color_modes",
  "color_mode",
  "attribution",
  "device_class",
  "unit_of_measurement",
  "state_class",
  "entity_id",
  "hs_color",
  "rgb_color",
  "xy_color",
]);

// An entity's controls and recent history, opened from its tile.
@customElement("panel-entity-details")
export class PanelEntityDetails extends LitElement {
  static override styles = [
    controls,
    css`
      .hero {
        display: flex;
        align-items: center;
        gap: var(--pn-space-4);
        margin-bottom: var(--pn-space-6);
      }

      .chip {
        display: grid;
        place-items: center;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: var(--pn-radius-l);
        background: var(--pn-surface-sunken);
        color: var(--pn-text-muted);
      }

      .chip .icon {
        width: 1.75rem;
        height: 1.75rem;
      }

      .chip.on {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
        box-shadow: 0 10px 30px -10px var(--pn-accent-ring);
      }

      .state {
        font-size: var(--pn-text-2xl);
        font-weight: 650;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }

      .since {
        color: var(--pn-text-muted);
        font-size: var(--pn-text-s);
      }

      .hero .switch {
        margin-left: auto;
      }

      .controls {
        display: grid;
        gap: var(--pn-space-5);
        margin-bottom: var(--pn-space-6);
      }

      .slider {
        display: grid;
        gap: var(--pn-space-2);
      }

      input[type="range"] {
        width: 100%;
        height: 3rem;
        margin: 0;
        appearance: none;
        border-radius: var(--pn-radius-l);
        background: linear-gradient(
            to right,
            var(--pn-accent) var(--fill),
            var(--pn-surface-sunken) var(--fill)
          )
          border-box;
        border: 1px solid var(--pn-border);
        overflow: hidden;
        cursor: pointer;
      }

      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 4px;
        height: 1.75rem;
        border-radius: 2px;
        background: var(--pn-accent-text);
        box-shadow: 0 0 0 4px oklch(100% 0 0 / 30%);
      }

      input[type="range"]::-moz-range-thumb {
        width: 4px;
        height: 1.75rem;
        border: none;
        border-radius: 2px;
        background: var(--pn-accent-text);
      }

      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--pn-space-2);
      }

      .stepper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--pn-space-6);
        padding: var(--pn-space-4);
        border-radius: var(--pn-radius-xl);
        background: var(--pn-surface-sunken);
      }

      .stepper .target {
        min-width: 6rem;
        font-size: var(--pn-text-display);
        font-weight: 640;
        letter-spacing: -0.04em;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }

      .stepper .icon-button {
        width: 3.25rem;
        height: 3.25rem;
        border: 1px solid var(--pn-border-strong);
        background: var(--pn-surface-solid);
      }

      .chart {
        height: 12rem;
        margin-bottom: var(--pn-space-6);
        overflow: hidden;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
      }

      dl {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
        gap: 0;
        margin: 0;
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-l);
        overflow: hidden;
      }

      dt,
      dd {
        margin: 0;
        padding: var(--pn-space-3) var(--pn-space-4);
        border-bottom: 1px solid var(--pn-border);
        font-size: var(--pn-text-s);
        overflow-wrap: anywhere;
      }

      dt {
        color: var(--pn-text-muted);
        text-transform: capitalize;
      }

      dl > :nth-last-child(-n + 2) {
        border-bottom: none;
      }

      h3 {
        margin: 0 0 var(--pn-space-3);
      }
    `,
  ];

  @property() accessor entityId = "";

  readonly #entity = new AtomController(this, () => entity(this.entityId));

  readonly #now = new AtomController(this, () => now(30_000));

  #call(action: Action) {
    registry.set(callAction, action);
  }

  #slider(
    label: string,
    value: number,
    min: number,
    max: number,
    onCommit: (value: number) => void,
    format: (value: number) => string,
  ) {
    const fill = `${((value - min) / (max - min || 1)) * 100}%`;

    return html`<label class="slider">
      <span class="spread">
        <span class="eyebrow">${label}</span>
        <span class="muted">${format(value)}</span>
      </span>
      <input
        type="range"
        min=${min}
        max=${max}
        .value=${String(value)}
        style="--fill: ${fill}"
        @input=${(event: InputEvent) => {
          if (event.target instanceof HTMLInputElement) {
            const next = Number(event.target.value);
            event.target.style.setProperty(
              "--fill",
              `${((next - min) / (max - min || 1)) * 100}%`,
            );
          }
        }}
        @change=${(event: Event) => {
          if (event.target instanceof HTMLInputElement) {
            onCommit(Number(event.target.value));
          }
        }}
      />
    </label>`;
  }

  #controls(state: EntityState) {
    const target = { entity_id: state.entity_id };
    const domain = domainOf(state.entity_id);

    switch (domain) {
      case "light": {
        const brightness = numberAttribute(state, "brightness") ?? 0;
        const minKelvin = numberAttribute(state, "min_color_temp_kelvin");
        const maxKelvin = numberAttribute(state, "max_color_temp_kelvin");
        const kelvin = numberAttribute(state, "color_temp_kelvin");

        return html`
          ${this.#slider(
            "Brightness",
            state.state === "on" ? Math.round((brightness / 255) * 100) : 0,
            0,
            100,
            (value) =>
              this.#call(
                value === 0
                  ? { action: "light.turn_off", target }
                  : {
                      action: "light.turn_on",
                      target,
                      data: { brightness_pct: value },
                    },
              ),
            (value) => `${value}%`,
          )}
          ${
            minKelvin !== undefined && maxKelvin !== undefined
              ? this.#slider(
                  "Colour temperature",
                  kelvin ?? Math.round((minKelvin + maxKelvin) / 2),
                  minKelvin,
                  maxKelvin,
                  (value) =>
                    this.#call({
                      action: "light.turn_on",
                      target,
                      data: { color_temp_kelvin: value },
                    }),
                  (value) => `${value} K`,
                )
              : nothing
          }
        `;
      }

      case "cover": {
        const position = numberAttribute(state, "current_position");

        return html`
          <div class="buttons">
            <button
              class="button"
              @click=${() => this.#call({ action: "cover.open_cover", target })}
            >
              ${icon("chevron-up")} Open
            </button>
            <button
              class="button"
              @click=${() => this.#call({ action: "cover.stop_cover", target })}
            >
              ${icon("square")} Stop
            </button>
            <button
              class="button"
              @click=${() => this.#call({ action: "cover.close_cover", target })}
            >
              ${icon("chevron-down")} Close
            </button>
          </div>
          ${
            position === undefined
              ? nothing
              : this.#slider(
                  "Position",
                  position,
                  0,
                  100,
                  (value) =>
                    this.#call({
                      action: "cover.set_cover_position",
                      target,
                      data: { position: value },
                    }),
                  (value) => `${value}%`,
                )
          }
        `;
      }

      case "climate":
      case "water_heater": {
        const temperature = numberAttribute(state, "temperature");
        const step = numberAttribute(state, "target_temp_step") ?? 0.5;
        const modes = attributeList(state, "hvac_modes");

        return html`
          ${
            temperature === undefined
              ? nothing
              : html`<div class="stepper">
                  <button
                    class="icon-button"
                    title="Lower"
                    @click=${() =>
                      this.#call({
                        action: `${domain}.set_temperature`,
                        target,
                        data: { temperature: temperature - step },
                      })}
                  >
                    ${icon("minus")}
                  </button>
                  <span class="target">${temperature}°</span>
                  <button
                    class="icon-button"
                    title="Raise"
                    @click=${() =>
                      this.#call({
                        action: `${domain}.set_temperature`,
                        target,
                        data: { temperature: temperature + step },
                      })}
                  >
                    ${icon("plus")}
                  </button>
                </div>`
          }
          ${
            modes.length > 0 && domain === "climate"
              ? html`<div class="segmented" role="group" aria-label="Mode">
                  ${modes.map(
                    (mode) =>
                      html`<button
                        aria-pressed=${state.state === mode ? "true" : "false"}
                        @click=${() =>
                          this.#call({
                            action: "climate.set_hvac_mode",
                            target,
                            data: { hvac_mode: mode },
                          })}
                      >
                        ${mode.replaceAll("_", " ")}
                      </button>`,
                  )}
                </div>`
              : nothing
          }
        `;
      }

      case "media_player": {
        const volume = numberAttribute(state, "volume_level");
        const title = stringAttribute(state, "media_title");
        const artist = stringAttribute(state, "media_artist");

        return html`
          ${
            title
              ? html`<div>
                  <strong>${title}</strong>
                  ${artist ? html`<div class="muted">${artist}</div>` : nothing}
                </div>`
              : nothing
          }
          <div class="buttons">
            <button
              class="icon-button"
              title="Previous"
              @click=${() =>
                this.#call({
                  action: "media_player.media_previous_track",
                  target,
                })}
            >
              ${icon("skip-back")}
            </button>
            <button
              class="button accent"
              @click=${() =>
                this.#call({ action: "media_player.media_play_pause", target })}
            >
              ${icon(state.state === "playing" ? "pause" : "play")}
              ${state.state === "playing" ? "Pause" : "Play"}
            </button>
            <button
              class="icon-button"
              title="Next"
              @click=${() =>
                this.#call({ action: "media_player.media_next_track", target })}
            >
              ${icon("skip-forward")}
            </button>
          </div>
          ${
            volume === undefined
              ? nothing
              : this.#slider(
                  "Volume",
                  Math.round(volume * 100),
                  0,
                  100,
                  (value) =>
                    this.#call({
                      action: "media_player.volume_set",
                      target,
                      data: { volume_level: value / 100 },
                    }),
                  (value) => `${value}%`,
                )
          }
        `;
      }

      case "fan": {
        const percentage = numberAttribute(state, "percentage");

        return percentage === undefined
          ? nothing
          : this.#slider(
              "Speed",
              state.state === "on" ? percentage : 0,
              0,
              100,
              (value) =>
                this.#call({
                  action: "fan.set_percentage",
                  target,
                  data: { percentage: value },
                }),
              (value) => `${value}%`,
            );
      }

      case "input_number":
      case "number": {
        const min = numberAttribute(state, "min") ?? 0;
        const max = numberAttribute(state, "max") ?? 100;

        return this.#slider(
          "Value",
          Number(state.state),
          min,
          max,
          (value) =>
            this.#call({
              action: `${domain}.set_value`,
              target,
              data: { value },
            }),
          (value) => String(value),
        );
      }

      case "input_select":
      case "select": {
        const options = attributeList(state, "options");

        return html`<div class="segmented" role="group" aria-label="Option">
          ${options.map(
            (option) =>
              html`<button
                aria-pressed=${state.state === option ? "true" : "false"}
                @click=${() =>
                  this.#call({
                    action: `${domain}.select_option`,
                    target,
                    data: { option },
                  })}
              >
                ${option}
              </button>`,
          )}
        </div>`;
      }

      default:
        return nothing;
    }
  }

  override render() {
    const result = this.#entity.value;
    const update = AsyncResult.isSuccess(result) ? result.value : undefined;

    const state = update?.state;
    const numeric = state !== undefined && Number.isFinite(Number(state.state));

    const historyWidget: HistoryWidget = {
      id: "details",
      type: "history",
      entityId: this.entityId,
      hours: 24,
      size: { columns: 4, rows: 2 },
    };

    if (state === undefined) {
      return html`<panel-sheet heading=${this.entityId} bare>
        <div class="skeleton" style="height: 4rem"></div>
      </panel-sheet>`;
    }

    const toggle = toggleAction(state);
    const domain = domainOf(state.entity_id);

    const switchable =
      canToggle(state.entity_id) &&
      toggle !== undefined &&
      !["button", "input_button", "scene", "media_player", "cover"].includes(
        domain,
      );

    // Plain values only; lists and objects read poorly as one line.
    const attributes = Object.entries(state.attributes ?? {}).flatMap(
      ([name, value]) =>
        !hiddenAttributes.has(name) &&
        (Predicate.isString(value) ||
          Predicate.isNumber(value) ||
          Predicate.isBoolean(value))
          ? [[name, String(value)] as const]
          : [],
    );

    const controls = this.#controls(state);

    return html`<panel-sheet heading=${update?.name ?? this.entityId} bare>
      <div class="hero">
        <span class="chip ${isActive(state) ? "on" : ""}">
          ${icon(entityIcon(state, state.entity_id))}
        </span>
        <div>
          <div class="state">${stateText(state)}</div>
          ${
            state.last_changed
              ? html`<div class="since">
                  Changed
                  ${relativeTime(state.last_changed, this.#now.value).toLowerCase()}
                </div>`
              : nothing
          }
        </div>
        ${
          switchable
            ? html`<button
                class="switch"
                role="switch"
                aria-label="Turn on or off"
                aria-checked=${isActive(state) ? "true" : "false"}
                @click=${() => this.#call(toggle)}
              ></button>`
            : toggle !== undefined &&
                (domain === "button" ||
                  domain === "input_button" ||
                  domain === "scene")
              ? html`<button
                  class="button accent"
                  style="margin-left: auto"
                  @click=${() => this.#call(toggle)}
                >
                  ${domain === "scene" ? "Activate" : "Press"}
                </button>`
              : nothing
        }
      </div>
      ${
        controls === nothing
          ? nothing
          : html`<div class="controls">${controls}</div>`
      }
      ${
        numeric
          ? html`<div class="chart">
              <panel-history
                .widget=${historyWidget}
                .entity=${update}
              ></panel-history>
            </div>`
          : nothing
      }
      ${
        attributes.length > 0
          ? html`<h3 class="eyebrow">Attributes</h3>
              <dl>
                ${attributes.map(
                  ([name, value]) =>
                    html`<dt>${name.replaceAll("_", " ")}</dt>
                      <dd>${value}</dd>`,
                )}
              </dl>`
          : nothing
      }
    </panel-sheet>`;
  }
}

const attributeList = (state: EntityState, name: string) => {
  const value = state.attributes?.[name];

  return Array.isArray(value) ? value.filter(Predicate.isString) : [];
};

declare global {
  interface HTMLElementTagNameMap {
    "panel-entity-details": PanelEntityDetails;
  }
}
