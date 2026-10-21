import { Atom } from "effect/reactivity";
import type { WidgetType } from "../../src/panel/Panel.js";
import { registry } from "./AtomController.js";

// Where the panel is: a dashboard by ID, the first one, or settings.
export type Route =
  | { readonly page: "dashboard"; readonly id: string | undefined }
  | { readonly page: "settings" };

const base = () => new URL(".", document.baseURI).pathname;

const parse = (): Route => {
  const path = location.pathname.slice(base().length).replace(/\/$/, "");

  if (path === "settings") {
    return { page: "settings" };
  }

  const [, id] = /^d\/([^/]+)$/.exec(path) ?? [];

  return { page: "dashboard", id };
};

export const route = Atom.make<Route>(parse()).pipe(Atom.keepAlive);

addEventListener("popstate", () => registry.set(route, parse()));

export const href = (next: Route) =>
  `${base()}${next.page === "settings" ? "settings" : next.id === undefined ? "" : `d/${next.id}`}`;

export const navigate = (next: Route) => {
  history.pushState(null, "", href(next));
  registry.set(route, next);
};

// Whether the dashboard shows its editing controls.
export const editing = Atom.make(false).pipe(Atom.keepAlive);

// The sheet open over the page, if any.
export type Overlay =
  | { readonly kind: "none" }
  | { readonly kind: "details"; readonly entityId: string }
  | {
      readonly kind: "widget";
      readonly dashboardId: string;
      readonly sectionId: string;
      // The widget being edited, or the type of a new one.
      readonly widgetId?: string;
      readonly type?: WidgetType;
    }
  | {
      readonly kind: "add-widget";
      readonly dashboardId: string;
      readonly sectionId: string;
    }
  | {
      readonly kind: "section";
      readonly dashboardId: string;
      readonly sectionId?: string;
    }
  | { readonly kind: "dashboard"; readonly dashboardId?: string }
  // A custom theme, or a new one without an ID.
  | { readonly kind: "theme"; readonly themeId?: string };

export const overlay = Atom.make<Overlay>({ kind: "none" }).pipe(
  Atom.keepAlive,
);

export const open = (next: Overlay) => registry.set(overlay, next);

export const close = () => registry.set(overlay, { kind: "none" });

// A minute-by-minute clock, or second-by-second for clocks showing seconds.
export const now = Atom.family((every: number) =>
  Atom.make((get) => {
    const timer = setInterval(() => get.setSelf(Date.now()), every);
    get.addFinalizer(() => clearInterval(timer));

    return Date.now();
  }),
);

// Whether the device prefers a dark theme, for themes that follow it.
export const prefersDark = Atom.make((get) => {
  const query = matchMedia("(prefers-color-scheme: dark)");
  const update = () => get.setSelf(query.matches);

  query.addEventListener("change", update);
  get.addFinalizer(() => query.removeEventListener("change", update));

  return query.matches;
}).pipe(Atom.keepAlive);
