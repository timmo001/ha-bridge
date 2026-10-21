import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type {
  Dashboard,
  SecondaryInfo,
  TapAction,
  Widget,
} from "../../src/panel/Panel.js";
import { AtomController, registry } from "./AtomController.js";
import { type EntityMap, entities, saveDashboard } from "./client.js";
import { removeWidget, saveWidget } from "./edit.js";
import { icon, iconNames } from "./icons.js";
import "./panel-entity-picker.js";
import "./panel-sheet.js";
import "./panel-widget.js";
import { close } from "./state.js";
import { controls } from "./ui.js";

export const widgetLabels: Readonly<
  Record<Widget["type"], { name: string; icon: string; about: string }>
> = {
  entity: {
    name: "Entity",
    icon: "lightbulb",
    about: "A light, switch, sensor or anything else, with a tap action",
  },
  history: {
    name: "History",
    icon: "chart-spline",
    about: "A sensor's recent values as a line",
  },
  markdown: {
    name: "Note",
    icon: "file-text",
    about: "Markdown with live Home Assistant templates",
  },
  clock: { name: "Clock", icon: "clock", about: "The time and date, large" },
  checklist: {
    name: "Checklist",
    icon: "list-checks",
    about: "A shared list to tick off from any screen",
  },
  image: { name: "Image", icon: "image", about: "A picture from a URL" },
  frame: { name: "Web page", icon: "frame", about: "Another page, embedded" },
};

const tapLabels: ReadonlyArray<readonly [TapAction, string]> = [
  ["toggle", "Toggle"],
  ["details", "Details"],
  ["none", "Nothing"],
];

const secondaryLabels: ReadonlyArray<readonly [SecondaryInfo, string]> = [
  ["state", "State"],
  ["last-changed", "Last changed"],
  ["none", "Nothing"],
];

const numericDomains = ["sensor", "input_number", "number", "counter"];

// Edits one tile, with a live preview, and saves it to its section.
@customElement("panel-widget-editor")
export class PanelWidgetEditor extends LitElement {
  static override styles = [
    controls,
    css`
      .form {
        display: grid;
        gap: var(--pn-space-6);
      }

      .preview {
        display: grid;
        place-items: center;
        padding: var(--pn-space-6);
        border-radius: var(--pn-radius-xl);
        background:
          radial-gradient(
              circle at 1px 1px,
              var(--pn-border-strong) 1px,
              transparent 0
            )
            0 0 / 14px 14px,
          var(--pn-surface-sunken);
      }

      .preview > div {
        width: 100%;
        max-width: 100%;
      }

      .entity {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        width: 100%;
        min-height: 3.25rem;
        padding: var(--pn-space-2) var(--pn-space-3);
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-m);
        background: var(--pn-surface-sunken);
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .entity:hover {
        border-color: var(--pn-accent);
      }

      .entity .grow {
        display: grid;
        flex: 1;
        min-width: 0;
      }

      .entity small {
        color: var(--pn-text-faint);
        font-family: var(--pn-font-mono);
        font-size: var(--pn-text-2xs);
      }

      .icons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
        gap: var(--pn-space-1);
        max-height: 11rem;
        overflow-y: auto;
        padding: var(--pn-space-1);
        border: 1px solid var(--pn-border);
        border-radius: var(--pn-radius-m);
        scrollbar-width: thin;
      }

      .icons button {
        display: grid;
        place-items: center;
        aspect-ratio: 1;
        border: none;
        border-radius: var(--pn-radius-s);
        background: transparent;
        color: var(--pn-text-muted);
        cursor: pointer;
      }

      .icons button:hover {
        background: var(--pn-surface-hover);
      }

      .icons button[aria-pressed="true"] {
        background: var(--pn-accent);
        color: var(--pn-accent-text);
      }

      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--pn-space-4);
      }

      .grow-spacer {
        flex: 1;
      }
    `,
  ];

  @property({ attribute: false }) accessor dashboard: Dashboard | undefined;

  @property() accessor sectionId = "";

  @property({ attribute: false }) accessor widget: Widget | undefined;

  // Whether the widget is already on the dashboard, so it can be deleted.
  @property({ type: Boolean }) accessor saved = false;

  @state() accessor draft: Widget | undefined;

  @state() accessor picking = false;

  @state() accessor customIcon = false;

  readonly #entities = new AtomController(this, () => {
    const draft = this.draft ?? this.widget;

    return entities(
      draft !== undefined &&
        (draft.type === "entity" || draft.type === "history") &&
        draft.entityId !== ""
        ? draft.entityId
        : "",
    );
  });

  override willUpdate() {
    if (this.draft === undefined && this.widget !== undefined) {
      this.draft = this.widget;
      this.picking =
        (this.widget.type === "entity" || this.widget.type === "history") &&
        this.widget.entityId === "";
      this.customIcon =
        this.widget.type === "entity" && this.widget.icon !== undefined;
    }
  }

  #put(next: Widget) {
    this.draft = next;
  }

  #save() {
    if (this.dashboard !== undefined && this.draft !== undefined) {
      registry.set(
        saveDashboard,
        saveWidget(this.dashboard, this.sectionId, this.draft),
      );
      close();
    }
  }

  #text(
    label: string,
    value: string,
    onInput: (value: string) => void,
    options: { type?: string; placeholder?: string; hint?: string } = {},
  ) {
    return html`<label class="field">
      <span>${label}</span>
      <input
        type=${options.type ?? "text"}
        placeholder=${options.placeholder ?? ""}
        .value=${value}
        @input=${(event: InputEvent) => {
          if (event.target instanceof HTMLInputElement) {
            onInput(event.target.value);
          }
        }}
      />
      ${options.hint ? html`<small>${options.hint}</small>` : nothing}
    </label>`;
  }

  #segmented<A extends string | number>(
    label: string,
    options: ReadonlyArray<readonly [A, string]>,
    value: A,
    onPick: (value: A) => void,
  ) {
    return html`<div class="field">
      <span>${label}</span>
      <div class="segmented" role="group" aria-label=${label}>
        ${options.map(
          ([option, text]) =>
            html`<button
              type="button"
              aria-pressed=${option === value ? "true" : "false"}
              @click=${() => onPick(option)}
            >
              ${text}
            </button>`,
        )}
      </div>
    </div>`;
  }

  #toggle(label: string, value: boolean, onChange: (value: boolean) => void) {
    return html`<div class="toggle-row">
      <span>${label}</span>
      <button
        type="button"
        class="switch"
        role="switch"
        aria-label=${label}
        aria-checked=${value ? "true" : "false"}
        @click=${() => onChange(!value)}
      ></button>
    </div>`;
  }

  #size(draft: Widget) {
    const size = draft.size;
    const steps = [1, 2, 3, 4, 5, 6].map((n) => [n, String(n)] as const);

    return html`
      ${this.#segmented("Width", steps, size.columns, (columns) =>
        this.#put({ ...draft, size: { ...size, columns } }),
      )}
      ${this.#segmented("Height", steps, size.rows, (rows) =>
        this.#put({ ...draft, size: { ...size, rows } }),
      )}
    `;
  }

  #entityField(entityId: string, states: EntityMap) {
    const update = states.get(entityId);

    return html`<div class="field">
      <span>Entity</span>
      <button
        type="button"
        class="entity"
        @click=${() => {
          this.picking = true;
        }}
      >
        <span class="grow">
          <span>${update?.name ?? (entityId || "Choose an entity")}</span>
          ${entityId ? html`<small>${entityId}</small>` : nothing}
        </span>
        ${icon("chevron-right")}
      </button>
    </div>`;
  }

  #fields(draft: Widget, states: EntityMap): TemplateResult {
    const title = this.#text(
      "Title",
      draft.title ?? "",
      (value) =>
        this.#put({ ...draft, title: value === "" ? undefined : value }),
      {
        placeholder:
          draft.type === "entity" || draft.type === "history"
            ? (states.get(draft.entityId)?.name ?? "")
            : "Optional",
      },
    );

    switch (draft.type) {
      case "entity":
        return html`
          ${this.#entityField(draft.entityId, states)} ${title}
          ${this.#segmented("When tapped", tapLabels, draft.tap, (tap) =>
            this.#put({ ...draft, tap }),
          )}
          ${this.#segmented(
            "Second line",
            secondaryLabels,
            draft.secondary,
            (secondary) => this.#put({ ...draft, secondary }),
          )}
          ${this.#toggle("Custom icon", this.customIcon, (on) => {
            this.customIcon = on;

            if (!on) {
              this.#put({ ...draft, icon: undefined });
            }
          })}
          ${
            this.customIcon
              ? html`<div class="icons" role="group" aria-label="Icon">
                  ${iconNames.map(
                    (name) =>
                      html`<button
                        type="button"
                        title=${name}
                        aria-pressed=${draft.icon === name ? "true" : "false"}
                        @click=${() => this.#put({ ...draft, icon: name })}
                      >
                        ${icon(name)}
                      </button>`,
                  )}
                </div>`
              : nothing
          }
          ${this.#size(draft)}
        `;
      case "history":
        return html`
          ${this.#entityField(draft.entityId, states)} ${title}
          ${this.#segmented(
            "Period",
            [
              [6, "6 h"],
              [24, "24 h"],
              [72, "3 days"],
              [168, "Week"],
            ],
            draft.hours,
            (hours) => this.#put({ ...draft, hours }),
          )}
          ${this.#size(draft)}
        `;
      case "markdown":
        return html`
          ${title}
          <label class="field">
            <span>Content</span>
            <textarea
              .value=${draft.content}
              placeholder="# Good morning&#10;It's {{ states('sensor.outside_temperature') }}° outside."
              @input=${(event: InputEvent) => {
                if (event.target instanceof HTMLTextAreaElement) {
                  this.#put({ ...draft, content: event.target.value });
                }
              }}
            ></textarea>
            <small
              >Markdown, rendered by Home Assistant as a template first.</small
            >
          </label>
          ${this.#size(draft)}
        `;
      case "clock":
        return html`
          ${title}
          ${this.#toggle("Show the date", draft.showDate, (showDate) =>
            this.#put({ ...draft, showDate }),
          )}
          ${this.#toggle("Show seconds", draft.showSeconds, (showSeconds) =>
            this.#put({ ...draft, showSeconds }),
          )}
          ${this.#size(draft)}
        `;
      case "checklist":
        return html`${title} ${this.#size(draft)}`;
      case "image":
        return html`
          ${this.#text(
            "Image URL",
            draft.url,
            (url) => this.#put({ ...draft, url }),
            {
              type: "url",
              placeholder: "https://",
            },
          )}
          ${title}
          ${this.#segmented(
            "Fit",
            [
              ["cover", "Fill"],
              ["contain", "Fit"],
            ],
            draft.fit,
            (fit) => this.#put({ ...draft, fit }),
          )}
          ${this.#size(draft)}
        `;
      case "frame":
        return html`
          ${this.#text(
            "Page URL",
            draft.url,
            (url) => this.#put({ ...draft, url }),
            {
              type: "url",
              placeholder: "https://",
              hint: "Some sites refuse to be embedded.",
            },
          )}
          ${title} ${this.#size(draft)}
        `;
    }
  }

  override render() {
    const draft = this.draft;

    if (draft === undefined || this.dashboard === undefined) {
      return nothing;
    }

    const label = widgetLabels[draft.type];
    const states = this.#entities.value;

    if (this.picking && (draft.type === "entity" || draft.type === "history")) {
      return html`<panel-sheet heading="Choose an entity" flush bare wide>
        ${
          draft.entityId === ""
            ? nothing
            : html`<button
                slot="actions"
                class="button ghost"
                @click=${() => {
                  this.picking = false;
                }}
              >
                ${icon("chevron-left")} Back
              </button>`
        }
        <panel-entity-picker
          .value=${draft.entityId}
          .domains=${draft.type === "history" ? numericDomains : undefined}
          @pick=${(event: CustomEvent<string>) => {
            this.#put({ ...draft, entityId: event.detail });
            this.picking = false;
          }}
        ></panel-entity-picker>
      </panel-sheet>`;
    }

    const previewWidth = Math.min(draft.size.columns, 3) * 9.5;

    return html`<panel-sheet
      heading=${this.saved ? `Edit ${label.name.toLowerCase()}` : `New ${label.name.toLowerCase()}`}
    >
      <div class="form">
        <div class="preview">
          <div
            style="width: ${previewWidth}rem; height: calc(${Math.min(draft.size.rows, 3)} * var(--pn-row) + ${Math.min(draft.size.rows, 3) - 1} * var(--pn-gap))"
          >
            <panel-widget
              .widget=${draft}
              .entities=${states}
              .dashboard=${this.dashboard}
              .sectionId=${this.sectionId}
            ></panel-widget>
          </div>
        </div>
        ${this.#fields(draft, states)}
      </div>
      ${
        this.saved
          ? html`<button
              slot="footer"
              class="button danger"
              @click=${() => {
                if (this.dashboard !== undefined) {
                  registry.set(
                    saveDashboard,
                    removeWidget(this.dashboard, draft.id),
                  );
                  close();
                }
              }}
            >
              ${icon("trash")} Delete
            </button>`
          : nothing
      }
      <span slot="footer" class="grow-spacer"></span>
      <button slot="footer" class="button" @click=${() => close()}>
        Cancel
      </button>
      <button
        slot="footer"
        class="button primary"
        ?disabled=${
          (draft.type === "entity" || draft.type === "history") &&
          draft.entityId === ""
        }
        @click=${() => this.#save()}
      >
        ${this.saved ? "Save" : "Add tile"}
      </button>
    </panel-sheet>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-widget-editor": PanelWidgetEditor;
  }
}
