import { Atom } from "effect/reactivity";
import type { WidgetType } from "../../src/panel/Panel.js";
import { registry } from "./AtomController.js";

// The settings pages, each at /settings/<section>. Themes and dashboards
// also have a page each, at /settings/<section>/<id>.
export type SettingsSection = "appearance" | "themes" | "dashboards" | "backup";

export const settingsSections: ReadonlyArray<SettingsSection> = [
  "appearance",
  "themes",
  "dashboards",
  "backup",
];

// Where the panel is: a dashboard by ID, the first one, or a settings page.
export type Route =
  | { readonly page: "dashboard"; readonly id: string | undefined }
  | {
      readonly page: "settings";
      readonly section: SettingsSection;
      // A custom theme or dashboard; "new" for a theme not made yet.
      readonly id?: string;
    };

const base = () => new URL(".", document.baseURI).pathname;

const isSection = (value: string | undefined): value is SettingsSection =>
  settingsSections.some((section) => section === value);

const parse = (): Route => {
  const path = location.pathname.slice(base().length).replace(/\/$/, "");
  const [first, second, third] = path.split("/");

  if (first === "settings") {
    return isSection(second)
      ? {
          page: "settings",
          section: second,
          id: third === undefined ? undefined : decodeURIComponent(third),
        }
      : { page: "settings", section: "appearance" };
  }

  return {
    page: "dashboard",
    id:
      first === "d" && second !== undefined
        ? decodeURIComponent(second)
        : undefined,
  };
};

export const route = Atom.make<Route>(parse()).pipe(Atom.keepAlive);

addEventListener("popstate", () => registry.set(route, parse()));

export const href = (next: Route) => {
  if (next.page === "settings") {
    return `${base()}settings/${next.section}${
      next.id === undefined ? "" : `/${encodeURIComponent(next.id)}`
    }`;
  }

  return `${base()}${next.id === undefined ? "" : `d/${encodeURIComponent(next.id)}`}`;
};

export const navigate = (next: Route) => {
  history.pushState(null, "", href(next));
  registry.set(route, next);
  registry.set(overlays, []);
  scrollTo({ top: 0 });
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
      readonly kind: "section";
      readonly dashboardId: string;
      readonly sectionId?: string;
    };

// The open views, newest last. Opening one stacks it on the others, so
// closing it returns to the one before.
export const overlays = Atom.make<ReadonlyArray<Overlay>>([]).pipe(
  Atom.keepAlive,
);

export const open = (next: Overlay) =>
  registry.set(
    overlays,
    next.kind === "none" ? [] : [...registry.get(overlays), next],
  );

// Closes the newest view, or the given one and every view opened from it.
export const close = (view?: Overlay) => {
  const stack = registry.get(overlays);
  const index = view === undefined ? stack.length - 1 : stack.indexOf(view);

  if (index >= 0) {
    registry.set(overlays, stack.slice(0, index));
  }
};

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
