import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { icon } from "./icons.js";
import { controls } from "./ui.js";

// A dialog in the top layer, built on the Popover API: centred over the page,
// and a floating card near the bottom on phones. A dialog opened from another
// stacks on it. The newest closes when someone clicks outside or presses
// Escape. Editors set `keep`, so a stray click can't lose a draft; they close
// with Escape, Cancel or the close button.
@customElement("panel-dialog")
export class PanelDialog extends LitElement {
  static override styles = [
    controls,
    css`
      [popover] {
        position: fixed;
        inset: 0;
        width: min(36rem, calc(100vw - 2rem));
        height: fit-content;
        max-height: min(52rem, calc(100dvh - 4rem));
        margin: auto;
        padding: 0;
        overflow: hidden;
        border: 1px solid var(--pn-border-strong);
        border-radius: var(--pn-radius-xl);
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow: var(--pn-shadow-l);
        opacity: 0;
        transform: translateY(0.75rem) scale(0.98);
        transition:
          opacity var(--pn-slow) var(--pn-ease),
          transform var(--pn-slow) var(--pn-ease),
          overlay var(--pn-slow) allow-discrete,
          display var(--pn-slow) allow-discrete;
      }

      [popover]:popover-open {
        display: flex;
        flex-direction: column;
        opacity: 1;
        transform: none;
      }

      @starting-style {
        [popover]:popover-open {
          opacity: 0;
          transform: translateY(0.75rem) scale(0.98);
        }
      }

      [popover]:focus {
        outline: none;
      }

      [popover]::backdrop {
        background: var(--pn-scrim);
        backdrop-filter: blur(4px);
      }

      :host([wide]) [popover] {
        width: min(48rem, calc(100vw - 2rem));
      }

      :host([tall]) [popover] {
        height: min(48rem, calc(100dvh - 4rem));
      }

      header {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 3.75rem;
        padding: var(--pn-space-2) var(--pn-space-3) var(--pn-space-2)
          var(--pn-space-6);
        border-bottom: 1px solid var(--pn-border);
      }

      h2 {
        flex: 1;
        margin: 0;
        overflow: hidden;
        font-size: var(--pn-text-l);
        font-weight: 650;
        letter-spacing: -0.015em;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: var(--pn-space-6);
        scrollbar-width: thin;
      }

      :host([flush]) .body {
        display: flex;
        flex-direction: column;
        padding: 0;
        overflow: hidden;
      }

      footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--pn-space-2);
        padding: var(--pn-space-4) var(--pn-space-6);
        border-top: 1px solid var(--pn-border);
      }

      :host([bare]) footer {
        display: none;
      }

      @media (max-width: 700px) {
        [popover] {
          inset: auto 0 0.75rem;
          width: calc(100vw - 1.5rem);
          max-height: calc(100dvh - 3rem);
        }

        :host([wide]) [popover] {
          width: calc(100vw - 1.5rem);
        }

        :host([tall]) [popover] {
          height: calc(100dvh - 3rem);
        }
      }
    `,
  ];

  @property() accessor heading = "";

  // Keeps the dialog open when someone clicks outside it.
  @property({ type: Boolean }) accessor keep = false;

  @query("[popover]") accessor popup: HTMLElement | null = null;

  // Open dialogs, newest last. Only the newest closes on Escape or a click
  // outside, so a dialog opened from another leaves it in place.
  static readonly #shown: Array<PanelDialog> = [];

  get #top() {
    return PanelDialog.#shown.at(-1) === this;
  }

  // Asks the view this dialog shows to close.
  #close() {
    this.dispatchEvent(
      new Event("dialog-close", { bubbles: true, composed: true }),
    );
  }

  // Manual popovers ignore Escape by themselves, and focus may have left the
  // dialog after a click outside, so dialogs listen on the window.
  readonly #escape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.#top) {
      event.preventDefault();
      this.#close();
    }
  };

  readonly #outside = (event: PointerEvent) => {
    if (
      !this.keep &&
      this.#top &&
      this.popup !== null &&
      !event.composedPath().includes(this.popup)
    ) {
      this.#close();
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    PanelDialog.#shown.push(this);
    addEventListener("keydown", this.#escape);
    addEventListener("pointerdown", this.#outside, true);
  }

  // Where focus was before the dialog opened, to return it on close.
  #returnFocus: Element | null = null;

  override firstUpdated() {
    this.#returnFocus = document.activeElement;
    this.popup?.showPopover();

    // Popovers don't move focus by themselves. Focus the dialog unless
    // something in it, such as a search field, took focus already.
    requestAnimationFrame(() => {
      if (!this.matches(":focus-within")) {
        this.popup?.focus();
      }
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    PanelDialog.#shown.splice(PanelDialog.#shown.indexOf(this), 1);
    removeEventListener("keydown", this.#escape);
    removeEventListener("pointerdown", this.#outside, true);
    this.popup?.hidePopover();

    if (
      this.#returnFocus instanceof HTMLElement &&
      this.#returnFocus.isConnected
    ) {
      this.#returnFocus.focus();
    }
  }

  override render() {
    return html`
      <div
        popover="manual"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label=${this.heading}
      >
        <header>
          <h2>${this.heading}</h2>
          <slot name="actions"></slot>
          <button
            class="icon-button"
            title="Close"
            @click=${() => this.#close()}
          >
            ${icon("x")}
          </button>
        </header>
        <div class="body"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-dialog": PanelDialog;
  }
}
