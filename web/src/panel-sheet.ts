import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { icon } from "./icons.js";
import { close } from "./state.js";
import { controls } from "./ui.js";

// A modal sheet: from the right on wide screens, from the bottom on phones.
// Escape, the backdrop and the close button all close it.
@customElement("panel-sheet")
export class PanelSheet extends LitElement {
  static override styles = [
    controls,
    css`
      dialog {
        width: min(32rem, 100vw);
        max-width: none;
        height: 100dvh;
        max-height: none;
        margin: 0 0 0 auto;
        padding: 0;
        border: none;
        border-left: 1px solid var(--pn-border);
        background: var(--pn-surface-solid);
        color: var(--pn-text);
        box-shadow: var(--pn-shadow-l);
        overflow: hidden;
      }

      dialog[open] {
        display: flex;
        flex-direction: column;
        animation: in-right var(--pn-slow) var(--pn-ease);
      }

      :host([wide]) dialog {
        width: min(46rem, 100vw);
      }

      dialog::backdrop {
        background: var(--pn-scrim);
        backdrop-filter: blur(3px);
        animation: fade var(--pn-slow) var(--pn-ease);
      }

      header {
        display: flex;
        align-items: center;
        gap: var(--pn-space-3);
        min-height: 4rem;
        padding: var(--pn-space-3) var(--pn-space-3) var(--pn-space-3)
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
        padding: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
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

      @keyframes in-right {
        from {
          transform: translateX(2rem);
          opacity: 0;
        }
      }

      @keyframes in-up {
        from {
          transform: translateY(2rem);
          opacity: 0;
        }
      }

      @keyframes fade {
        from {
          opacity: 0;
        }
      }

      @media (max-width: 700px) {
        dialog,
        :host([wide]) dialog {
          width: 100vw;
          height: auto;
          max-height: 92dvh;
          margin: auto 0 0;
          border-left: none;
          border-top: 1px solid var(--pn-border);
          border-radius: var(--pn-radius-xl) var(--pn-radius-xl) 0 0;
        }

        dialog[open] {
          animation-name: in-up;
        }

        :host([flush]) dialog {
          height: 92dvh;
        }
      }
    `,
  ];

  @property() accessor heading = "";

  @query("dialog") accessor dialog: HTMLDialogElement | null = null;

  override firstUpdated() {
    this.dialog?.showModal();
  }

  override render() {
    return html`
      <dialog
        aria-label=${this.heading}
        @cancel=${(event: Event) => {
          event.preventDefault();
          close();
        }}
        @click=${(event: MouseEvent) => {
          if (event.target === this.dialog) {
            close();
          }
        }}
      >
        <header>
          <h2>${this.heading}</h2>
          <slot name="actions"></slot>
          <button class="icon-button" title="Close" @click=${() => close()}>
            ${icon("x")}
          </button>
        </header>
        <div class="body"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-sheet": PanelSheet;
  }
}
