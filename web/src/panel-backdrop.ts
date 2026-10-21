import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type { Background } from "../../src/panel/Panel.js";

// A URL as a quoted CSS url(), with the characters that could end it escaped.
export const cssUrl = (url: string) =>
  `url("${url.replace(/["\\\n\r]/g, (character) => `\\${character.charCodeAt(0).toString(16)} `)}")`;

// What sits behind the page: the theme's glow, nothing, a colour or an
// image. Fixed, so it stays put while the dashboard scrolls.
@customElement("panel-backdrop")
export class PanelBackdrop extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
      background: var(--pn-bg);
      transition: background var(--pn-slow) var(--pn-ease);
    }

    div {
      position: absolute;
      inset: 0;
    }

    .glow {
      background:
        radial-gradient(
          60rem 40rem at 88% -12%,
          var(--pn-bg-glow),
          transparent 70%
        ),
        radial-gradient(
          50rem 36rem at -10% 110%,
          color-mix(in oklch, var(--pn-accent) 10%, transparent),
          transparent 70%
        );
    }

    .image {
      background-position: center;
      background-size: cover;
    }

    .image.blurred {
      inset: -4rem;
    }

    .dim {
      background: var(--pn-bg);
    }
  `;

  @property({ attribute: false }) accessor background: Background | undefined;

  override render() {
    const background = this.background;

    switch (background?.kind) {
      case undefined:
      case "theme":
        return html`<div class="glow"></div>`;
      case "plain":
        return nothing;
      case "color":
        return html`<div
          style=${styleMap({ background: background.color ?? "" })}
        ></div>`;
      case "image":
        return background.image === undefined || background.image === ""
          ? html`<div class="glow"></div>`
          : html`<div
                class="image ${background.blur > 0 ? "blurred" : ""}"
                style=${styleMap({
                  backgroundImage: cssUrl(background.image),
                  filter:
                    background.blur > 0 ? `blur(${background.blur}px)` : "",
                })}
              ></div>
              <div
                class="dim"
                style=${styleMap({ opacity: String(background.dim / 100) })}
              ></div>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "panel-backdrop": PanelBackdrop;
  }
}
