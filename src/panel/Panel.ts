import { Effect, Schema } from "effect";

// Dashboards and the panel's look, as the panel saves them. Every field past
// the ID has a default, so a file written by an older panel still loads.

const withDefault = <S extends Schema.Top>(schema: S, value: S["Type"]) =>
  schema.pipe(Schema.withDecodingDefaultKey(Effect.succeed(value)));

export const Id = Schema.String.check(Schema.isMinLength(1));

// How many of the section's columns and rows a widget covers.
export const WidgetSize = Schema.Struct({
  columns: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 6 })),
  rows: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 6 })),
});

export type WidgetSize = typeof WidgetSize.Type;

const widgetFields = {
  id: Id,
  size: withDefault(WidgetSize, { columns: 1, rows: 1 }),
  // Shown above the widget's content; the entity's name when left out on an
  // entity widget.
  title: Schema.optional(Schema.String),
};

// What tapping an entity tile does.
export const TapAction = Schema.Literals(["toggle", "details", "none"]);

export type TapAction = typeof TapAction.Type;

// The second line of an entity tile.
export const SecondaryInfo = Schema.Literals(["state", "last-changed", "none"]);

export type SecondaryInfo = typeof SecondaryInfo.Type;

export const EntityWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("entity"),
  entityId: Schema.String,
  // A Lucide icon name in kebab case, such as lamp-desk, instead of the one
  // picked from the entity's domain and device class.
  icon: Schema.optional(Schema.String),
  tap: withDefault(TapAction, "toggle"),
  secondary: withDefault(SecondaryInfo, "state"),
});

export type EntityWidget = typeof EntityWidget.Type;

// Markdown rendered as a Home Assistant template first, so it can show
// states, such as {{ states('sensor.outside_temperature') }}.
export const MarkdownWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("markdown"),
  content: withDefault(Schema.String, ""),
});

export type MarkdownWidget = typeof MarkdownWidget.Type;

export const ImageFit = Schema.Literals(["cover", "contain"]);

export const ImageWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("image"),
  url: Schema.String,
  fit: withDefault(ImageFit, "cover"),
});

export type ImageWidget = typeof ImageWidget.Type;

// Another page, embedded.
export const FrameWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("frame"),
  url: Schema.String,
});

export type FrameWidget = typeof FrameWidget.Type;

// A numeric entity's recent states as a line.
export const HistoryWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("history"),
  entityId: Schema.String,
  hours: withDefault(
    Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 168 })),
    24,
  ),
});

export type HistoryWidget = typeof HistoryWidget.Type;

export const ChecklistItem = Schema.Struct({
  id: Id,
  text: Schema.String,
  done: withDefault(Schema.Boolean, false),
});

export type ChecklistItem = typeof ChecklistItem.Type;

export const ChecklistWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("checklist"),
  items: withDefault(Schema.Array(ChecklistItem), []),
});

export type ChecklistWidget = typeof ChecklistWidget.Type;

export const ClockWidget = Schema.Struct({
  ...widgetFields,
  type: Schema.Literal("clock"),
  showDate: withDefault(Schema.Boolean, true),
  showSeconds: withDefault(Schema.Boolean, false),
});

export type ClockWidget = typeof ClockWidget.Type;

export const Widget = Schema.Union([
  EntityWidget,
  MarkdownWidget,
  ImageWidget,
  FrameWidget,
  HistoryWidget,
  ChecklistWidget,
  ClockWidget,
]);

export type Widget = typeof Widget.Type;

export type WidgetType = Widget["type"];

export const widgetTypes: ReadonlyArray<WidgetType> = [
  "entity",
  "history",
  "markdown",
  "clock",
  "checklist",
  "image",
  "frame",
];

export const Section = Schema.Struct({
  id: Id,
  title: withDefault(Schema.String, ""),
  subtitle: Schema.optional(Schema.String),
  // The section's grid columns at full width; narrower screens use fewer.
  columns: withDefault(
    Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 6 })),
    4,
  ),
  widgets: withDefault(Schema.Array(Widget), []),
});

export type Section = typeof Section.Type;

// What shows behind a dashboard: the theme's own glow, its plain background,
// a colour, or an image, blurred and dimmed so tiles stay readable.
export const BackgroundKind = Schema.Literals([
  "theme",
  "plain",
  "color",
  "image",
]);

export type BackgroundKind = typeof BackgroundKind.Type;

export const Background = Schema.Struct({
  kind: withDefault(BackgroundKind, "theme"),
  // A CSS colour, for the color kind.
  color: Schema.optional(Schema.String),
  // An image URL, for the image kind.
  image: Schema.optional(Schema.String),
  // Pixels of blur over the image.
  blur: withDefault(
    Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 40 })),
    0,
  ),
  // Percent of the theme's background laid over the image.
  dim: withDefault(
    Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 90 })),
    30,
  ),
});

export type Background = typeof Background.Type;

export const defaultBackground: Background = {
  kind: "theme",
  blur: 0,
  dim: 30,
};

export const Dashboard = Schema.Struct({
  id: Id,
  name: Schema.String,
  // A Lucide icon name in kebab case, such as house.
  icon: withDefault(Schema.String, "layout-grid"),
  sections: withDefault(Schema.Array(Section), []),
  // Replaces the panel's background on this dashboard.
  background: Schema.optional(Background),
});

export type Dashboard = typeof Dashboard.Type;

// Light or dark, for themes that come in both, or whichever the device uses.
export const Mode = Schema.Literals(["system", "light", "dark"]);

export type Mode = typeof Mode.Type;

export const Scheme = Schema.Literals(["light", "dark"]);

export type Scheme = typeof Scheme.Type;

// A theme someone made, from a few colours the rest are mixed from.
export const CustomTheme = Schema.Struct({
  id: Id,
  name: Schema.String,
  scheme: withDefault(Scheme, "dark"),
  background: Schema.String,
  card: Schema.String,
  text: Schema.String,
  accent: Schema.String,
});

export type CustomTheme = typeof CustomTheme.Type;

// The theme's own accent, or one of these laid over it.
export const Accent = Schema.Literals([
  "theme",
  "amber",
  "coral",
  "rose",
  "violet",
  "blue",
  "teal",
  "lime",
]);

export type Accent = typeof Accent.Type;

export const Density = Schema.Literals(["comfortable", "compact"]);

export type Density = typeof Density.Type;

// How the panel looks and behaves. Nothing here reaches Home Assistant.
export const Settings = Schema.Struct({
  // A built-in theme's ID, or a custom theme's.
  theme: withDefault(Schema.String, "panel"),
  mode: withDefault(Mode, "system"),
  accent: withDefault(Accent, "theme"),
  density: withDefault(Density, "comfortable"),
  background: withDefault(Background, defaultBackground),
  customThemes: withDefault(Schema.Array(CustomTheme), []),
  // Hides the sidebar and editing controls, for a wall tablet.
  kiosk: withDefault(Schema.Boolean, false),
  clock24h: withDefault(Schema.Boolean, true),
});

export type Settings = typeof Settings.Type;

export const defaultSettings: Settings = {
  theme: "panel",
  mode: "system",
  accent: "theme",
  density: "comfortable",
  background: defaultBackground,
  customThemes: [],
  kiosk: false,
  clock24h: true,
};

export const PanelState = Schema.Struct({
  settings: withDefault(Settings, defaultSettings),
  dashboards: withDefault(Schema.Array(Dashboard), []),
});

export type PanelState = typeof PanelState.Type;

// A dashboard that doesn't exist, or a reorder that doesn't name every one.
export class PanelError extends Schema.TaggedError<PanelError>()("PanelError", {
  message: Schema.String,
}) {}
