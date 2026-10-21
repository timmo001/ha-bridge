import { css, html, type TemplateResult } from "lit";

// The pieces settings pages are built from: cards of labelled rows.
export const settingsStyles = css`
  :host {
    display: grid;
    gap: var(--pn-space-6);
    align-content: start;
  }

  section {
    display: grid;
    gap: var(--pn-space-3);
  }

  h2 {
    margin: 0;
    font-size: var(--pn-text-xl);
    font-weight: 680;
    letter-spacing: -0.02em;
  }

  h3 {
    margin: 0;
    font-size: var(--pn-text-m);
    font-weight: 650;
  }

  .lead {
    margin: -0.25rem 0 0;
    color: var(--pn-text-muted);
  }

  .card {
    display: grid;
    border: 1px solid var(--pn-border);
    border-radius: var(--pn-radius-xl);
    background: var(--pn-surface);
    box-shadow: var(--pn-shadow-s);
    backdrop-filter: blur(16px);
    overflow: hidden;
  }

  .card.padded {
    gap: var(--pn-space-5);
    padding: var(--pn-space-5);
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--pn-space-4);
    min-height: 4.5rem;
    padding: var(--pn-space-4) var(--pn-space-5);
  }

  .item + .item {
    border-top: 1px solid var(--pn-border);
  }

  .item.stacked {
    display: grid;
    align-items: stretch;
  }

  .label {
    display: grid;
    gap: 0.125rem;
  }

  .label strong {
    font-size: var(--pn-text-m);
    font-weight: 600;
  }

  .label span {
    color: var(--pn-text-muted);
    font-size: var(--pn-text-s);
  }

  .segmented .icon {
    width: 1rem;
    height: 1rem;
  }

  .segmented button {
    display: inline-flex;
    align-items: center;
    gap: var(--pn-space-2);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: var(--pn-space-1);
    width: fit-content;
    margin-bottom: calc(-1 * var(--pn-space-2));
    color: var(--pn-text-muted);
    font-size: var(--pn-text-s);
    font-weight: 560;
    text-decoration: none;
  }

  .back:hover {
    color: var(--pn-text);
  }

  .back .icon {
    width: 1rem;
    height: 1rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--pn-space-2);
  }

  .actions .spacer {
    flex: 1;
  }

  .message {
    font-size: var(--pn-text-s);
  }

  .message.error {
    color: var(--pn-danger);
  }

  .message.ok {
    color: var(--pn-success);
  }
`;

export const item = (title: string, about: string, control: TemplateResult) =>
  html`<div class="item">
    <div class="label">
      <strong>${title}</strong>
      <span>${about}</span>
    </div>
    ${control}
  </div>`;

export const toggle = (
  value: boolean,
  label: string,
  onChange: (value: boolean) => void,
) =>
  html`<button
    class="switch"
    role="switch"
    aria-label=${label}
    aria-checked=${value ? "true" : "false"}
    @click=${() => onChange(!value)}
  ></button>`;

export const textField = (
  label: string,
  value: string,
  onInput: (value: string) => void,
  placeholder = "",
) =>
  html`<label class="field">
    <span>${label}</span>
    <input
      type="text"
      .value=${value}
      placeholder=${placeholder}
      @input=${(event: InputEvent) => {
        if (event.target instanceof HTMLInputElement) {
          onInput(event.target.value);
        }
      }}
    />
  </label>`;
