import type {
  Dashboard,
  Section,
  Widget,
  WidgetType,
} from "../../src/panel/Panel.js";

// Changes to a dashboard, each returning the new dashboard to save.

export const newId = () => crypto.randomUUID().replaceAll("-", "").slice(0, 12);

export const newDashboard = (name: string): Dashboard => ({
  id: newId(),
  name,
  icon: "layout-grid",
  sections: [newSection("")],
});

export const newSection = (title: string): Section => ({
  id: newId(),
  title,
  columns: 4,
  widgets: [],
});

// A widget of the type with its defaults, ready for the editor.
export const newWidget = (type: WidgetType): Widget => {
  const base = { id: newId(), size: { columns: 1, rows: 1 } };

  switch (type) {
    case "entity":
      return {
        ...base,
        type,
        entityId: "",
        tap: "toggle",
        secondary: "state",
      };
    case "history":
      return {
        ...base,
        size: { columns: 2, rows: 2 },
        type,
        entityId: "",
        hours: 24,
      };
    case "markdown":
      return { ...base, size: { columns: 2, rows: 2 }, type, content: "" };
    case "image":
      return {
        ...base,
        size: { columns: 2, rows: 2 },
        type,
        url: "",
        fit: "cover",
      };
    case "frame":
      return { ...base, size: { columns: 2, rows: 3 }, type, url: "" };
    case "checklist":
      return { ...base, size: { columns: 2, rows: 3 }, type, items: [] };
    case "clock":
      return {
        ...base,
        size: { columns: 2, rows: 2 },
        type,
        showDate: true,
        showSeconds: false,
      };
  }
};

const mapSections = (
  dashboard: Dashboard,
  f: (section: Section) => ReadonlyArray<Section>,
): Dashboard => ({ ...dashboard, sections: dashboard.sections.flatMap(f) });

export const saveSection = (dashboard: Dashboard, next: Section): Dashboard =>
  dashboard.sections.some(({ id }) => id === next.id)
    ? mapSections(dashboard, (section) => [
        section.id === next.id ? next : section,
      ])
    : { ...dashboard, sections: [...dashboard.sections, next] };

export const removeSection = (dashboard: Dashboard, id: string): Dashboard =>
  mapSections(dashboard, (section) => (section.id === id ? [] : [section]));

const move = <A>(items: ReadonlyArray<A>, from: number, to: number) => {
  const next = [...items];
  const [item] = next.splice(from, 1);

  if (item !== undefined) {
    next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  }

  return next;
};

export const moveSection = (
  dashboard: Dashboard,
  id: string,
  by: number,
): Dashboard => {
  const from = dashboard.sections.findIndex((section) => section.id === id);

  return from === -1
    ? dashboard
    : { ...dashboard, sections: move(dashboard.sections, from, from + by) };
};

export const saveWidget = (
  dashboard: Dashboard,
  sectionId: string,
  next: Widget,
): Dashboard =>
  mapSections(dashboard, (section) => {
    if (section.id !== sectionId) {
      return [section];
    }

    const exists = section.widgets.some(({ id }) => id === next.id);

    return [
      {
        ...section,
        widgets: exists
          ? section.widgets.map((widget) =>
              widget.id === next.id ? next : widget,
            )
          : [...section.widgets, next],
      },
    ];
  });

export const removeWidget = (dashboard: Dashboard, widgetId: string) =>
  mapSections(dashboard, (section) => [
    {
      ...section,
      widgets: section.widgets.filter((widget) => widget.id !== widgetId),
    },
  ]);

// Moves a widget before the one with `beforeId`, or to the end of the
// section without one, from wherever it is on the dashboard.
export const placeWidget = (
  dashboard: Dashboard,
  widgetId: string,
  sectionId: string,
  beforeId: string | undefined,
): Dashboard => {
  const widget = dashboard.sections
    .flatMap((section) => section.widgets)
    .find(({ id }) => id === widgetId);

  if (widget === undefined || widgetId === beforeId) {
    return dashboard;
  }

  return mapSections(removeWidget(dashboard, widgetId), (section) => {
    if (section.id !== sectionId) {
      return [section];
    }

    const index = section.widgets.findIndex(({ id }) => id === beforeId);
    const widgets = [...section.widgets];

    widgets.splice(index === -1 ? widgets.length : index, 0, widget);

    return [{ ...section, widgets }];
  });
};

// Every entity the dashboard shows, sorted so the same set gives the same key.
export const dashboardEntities = (dashboard: Dashboard) =>
  [
    ...new Set(
      dashboard.sections.flatMap((section) =>
        section.widgets.flatMap((widget) =>
          (widget.type === "entity" || widget.type === "history") &&
          widget.entityId !== ""
            ? [widget.entityId]
            : [],
        ),
      ),
    ),
  ].sort();
