import { css } from "lit";

// Controls shared by every component: buttons, fields, chips and segmented
// pickers. Components add them to their own styles.
export const controls = css`
  :host {
    font-family: var(--pn-font);
  }

  /* The page's box sizing doesn't reach into shadow roots. */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    flex: none;
  }

  button {
    font: inherit;
    color: inherit;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--pn-space-2);
    min-height: 2.5rem;
    padding: 0 var(--pn-space-4);
    border: 1px solid var(--pn-border);
    border-radius: var(--pn-radius-full);
    background: var(--pn-surface-solid);
    color: var(--pn-text);
    font-size: var(--pn-text-s);
    font-weight: 560;
    text-decoration: none;
    cursor: pointer;
    transition:
      background var(--pn-fast) var(--pn-ease),
      border-color var(--pn-fast) var(--pn-ease),
      transform var(--pn-fast) var(--pn-ease);
    white-space: nowrap;
  }

  .button:hover {
    background: var(--pn-surface-hover);
    border-color: var(--pn-border-strong);
  }

  .button:active {
    transform: scale(0.97);
  }

  .button:disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .button.primary {
    background: var(--pn-text);
    border-color: transparent;
    color: var(--pn-bg);
  }

  .button.primary:hover {
    background: color-mix(in oklab, var(--pn-text) 88%, var(--pn-bg));
  }

  .button.accent {
    background: var(--pn-accent);
    border-color: transparent;
    color: var(--pn-accent-text);
  }

  .button.ghost {
    background: transparent;
    border-color: transparent;
  }

  .button.ghost:hover {
    background: var(--pn-surface-hover);
  }

  .button.danger {
    color: var(--pn-danger);
  }

  .button.danger:hover {
    background: var(--pn-danger-soft);
  }

  .icon-button {
    display: inline-grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--pn-radius-full);
    background: transparent;
    color: var(--pn-text-muted);
    cursor: pointer;
    transition:
      background var(--pn-fast) var(--pn-ease),
      color var(--pn-fast) var(--pn-ease);
  }

  .icon-button:hover {
    background: var(--pn-surface-hover);
    color: var(--pn-text);
  }

  .icon-button.small {
    width: 2rem;
    height: 2rem;
  }

  .icon-button.small .icon {
    width: 1rem;
    height: 1rem;
  }

  .icon-button:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  :focus-visible {
    outline: 2px solid var(--pn-accent-ring);
    outline-offset: 2px;
  }

  .field {
    display: grid;
    gap: var(--pn-space-2);
  }

  .field > span {
    font-size: var(--pn-text-xs);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--pn-text-muted);
  }

  .field > small {
    font-size: var(--pn-text-xs);
    color: var(--pn-text-faint);
  }

  input[type="text"],
  input[type="url"],
  input[type="search"],
  input[type="number"],
  textarea,
  select {
    width: 100%;
    min-height: 2.75rem;
    padding: var(--pn-space-2) var(--pn-space-3);
    border: 1px solid var(--pn-border-strong);
    border-radius: var(--pn-radius-m);
    background: var(--pn-surface-sunken);
    color: var(--pn-text);
    font: inherit;
    font-size: var(--pn-text-m);
    transition:
      border-color var(--pn-fast) var(--pn-ease),
      box-shadow var(--pn-fast) var(--pn-ease);
  }

  textarea {
    min-height: 10rem;
    resize: vertical;
    font-family: var(--pn-font-mono);
    font-size: var(--pn-text-s);
    line-height: 1.6;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--pn-accent);
    box-shadow: 0 0 0 3px var(--pn-accent-soft);
  }

  .segmented {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 3px;
    border-radius: var(--pn-radius-full);
    background: var(--pn-surface-sunken);
    border: 1px solid var(--pn-border);
    width: fit-content;
    max-width: 100%;
  }

  .segmented button {
    min-height: 2rem;
    padding: 0 var(--pn-space-3);
    border: none;
    border-radius: var(--pn-radius-full);
    background: transparent;
    color: var(--pn-text-muted);
    font-size: var(--pn-text-s);
    font-weight: 560;
    cursor: pointer;
    transition:
      background var(--pn-fast) var(--pn-ease),
      color var(--pn-fast) var(--pn-ease);
  }

  .segmented button[aria-pressed="true"] {
    background: var(--pn-surface-solid);
    color: var(--pn-text);
    box-shadow: var(--pn-shadow-s);
  }

  .switch {
    position: relative;
    flex: none;
    width: 2.75rem;
    height: 1.625rem;
    border: none;
    border-radius: var(--pn-radius-full);
    background: var(--pn-border-strong);
    cursor: pointer;
    transition: background var(--pn-fast) var(--pn-ease);
  }

  .switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: white;
    box-shadow: var(--pn-shadow-s);
    transition: transform var(--pn-fast) var(--pn-ease);
  }

  .switch[aria-checked="true"] {
    background: var(--pn-accent);
  }

  .switch[aria-checked="true"]::after {
    transform: translateX(1.125rem);
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--pn-space-3);
  }

  .spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--pn-space-3);
  }

  .muted {
    color: var(--pn-text-muted);
  }

  .eyebrow {
    font-size: var(--pn-text-2xs);
    font-weight: 650;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--pn-text-faint);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @keyframes shimmer {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: -100% 0;
    }
  }

  .skeleton {
    border-radius: var(--pn-radius-s);
    background: linear-gradient(
      90deg,
      var(--pn-surface-sunken) 25%,
      var(--pn-surface-hover) 50%,
      var(--pn-surface-sunken) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s linear infinite;
  }
`;
