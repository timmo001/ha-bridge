import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AtomController } from "./AtomController.js";
import { allEntities } from "./client.js";
import { domainOf, entityIcon, isActive, stateText } from "./entity.js";
import "./panel-command-list.js";
import type { CommandItem } from "./panel-command-list.js";

const domainLabel = (domain: string) =>
  domain.charAt(0).toUpperCase() + domain.slice(1).replaceAll("_", " ");

// Every entity as a list item, by name, grouped by domain.
export const entityItems = (
  updates: ReadonlyArray<EntityUpdate>,
  group?: string,
): ReadonlyArray<CommandItem> =>
  updates
    .map((update) => {
      const id = update.state.entity_id;

      return {
        id,
        group: group ?? domainLabel(domainOf(id)),
        icon: entityIcon(update.state, id),
        primary: update.name || id,
        secondary: id,
        trailing: stateText(update.state),
        active: isActive(update.state),
        keywords: domainOf(id),
      };
    })
    .sort((a, b) => a.primary.localeCompare(b.primary));

// Every Home Assistant entity in a searchable list that works from the
// keyboard. Thousands of entities scroll smoothly, as only the rows in view
// are rendered.
@customElement("panel-entity-picker")
export class PanelEntityPicker extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }

    .message {
      display: grid;
      place-items: center;
      padding: var(--pn-space-10);
      color: var(--pn-text-faint);
    }
  `;

  @property() accessor value = "";

  // Only entities in these domains, when given.
  @property({ attribute: false }) accessor domains:
    ReadonlyArray<string> | undefined;

  readonly #entities = new AtomController(this, () => allEntities);

  #items: { source: unknown; items: ReadonlyArray<CommandItem> } | undefined;

  #groups(items: ReadonlyArray<CommandItem>) {
    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.group, (counts.get(item.group) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([group]) => group);
  }

  override render() {
    const result = this.#entities.value;

    if (!AsyncResult.isSuccess(result)) {
      return html`<div class="message">
        ${
          AsyncResult.isFailure(result)
            ? "Couldn't load entities from Home Assistant"
            : "Loading entities…"
        }
      </div>`;
    }

    const source = result.value;

    if (this.#items?.source !== source) {
      this.#items = { source, items: entityItems(source) };
    }

    const items =
      this.domains === undefined
        ? this.#items.items
        : this.#items.items.filter((item) =>
            this.domains?.includes(domainOf(item.id)),
          );

    return html`<panel-command-list
      .items=${items}
      .groups=${this.#groups(items)}
      .value=${this.value}
      placeholder="Search ${items.length} entities"
      empty="No entities match"
    ></panel-command-list>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-entity-picker": PanelEntityPicker;
  }
}
