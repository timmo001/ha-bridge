import DOMPurify from "dompurify";
import { AsyncResult } from "effect/reactivity";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { marked } from "marked";
import type { MarkdownWidget } from "../../../src/panel/Panel.js";
import { AtomController } from "../AtomController.js";
import { template } from "../client.js";
import { controls } from "../ui.js";

// Notes, rendered as a Home Assistant template first so they can include
// states, then as Markdown.
@customElement("panel-markdown")
export class PanelMarkdown extends LitElement {
  static override styles = [
    controls,
    css`
      :host {
        display: block;
        height: 100%;
        overflow: auto;
        padding: var(--pn-space-4) var(--pn-space-5);
        scrollbar-width: thin;
      }

      .title {
        margin-bottom: var(--pn-space-2);
      }

      .body {
        font-size: var(--pn-text-m);
        line-height: 1.55;
      }

      .body > :first-child {
        margin-top: 0;
      }

      .body > :last-child {
        margin-bottom: 0;
      }

      h1,
      h2,
      h3 {
        margin: 0.6em 0 0.3em;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      h1 {
        font-size: var(--pn-text-2xl);
      }

      h2 {
        font-size: var(--pn-text-xl);
      }

      h3 {
        font-size: var(--pn-text-l);
      }

      p {
        margin: 0.5em 0;
      }

      a {
        color: var(--pn-accent-strong);
      }

      code {
        padding: 0.1em 0.35em;
        border-radius: 0.3em;
        background: var(--pn-surface-sunken);
        font-family: var(--pn-font-mono);
        font-size: 0.9em;
      }

      ul,
      ol {
        padding-left: 1.25em;
      }

      img {
        max-width: 100%;
        border-radius: var(--pn-radius-m);
      }

      .error {
        color: var(--pn-danger);
        font-size: var(--pn-text-s);
      }
    `,
  ];

  @property({ attribute: false }) accessor widget: MarkdownWidget | undefined;

  readonly #render = new AtomController(this, () =>
    template(this.widget?.content ?? ""),
  );

  override render() {
    const widget = this.widget;

    if (widget === undefined) {
      return nothing;
    }

    if (widget.content.trim() === "") {
      return html`<p class="muted">Write some Markdown in the editor.</p>`;
    }

    const result = this.#render.value;
    const rendered = AsyncResult.isSuccess(result) ? result.value : undefined;

    return html`
      ${
        widget.title
          ? html`<div class="eyebrow title">${widget.title}</div>`
          : nothing
      }
      ${
        rendered === undefined
          ? html`<div class="skeleton" style="height: 1rem; width: 70%"></div>`
          : "error" in rendered
            ? html`<p class="error">${rendered.error}</p>`
            : html`<div class="body">
                ${unsafeHTML(
                  DOMPurify.sanitize(
                    marked.parse(rendered.text, { async: false }),
                  ),
                )}
              </div>`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-markdown": PanelMarkdown;
  }
}
