import type {
  Accent,
  CustomTheme,
  Mode,
  Scheme,
  Settings,
} from "../../src/panel/Panel.js";

// The colours every other token is mixed from, in style.css.
export interface Palette {
  readonly scheme: Scheme;
  readonly background: string;
  readonly card: string;
  readonly text: string;
  readonly accent: string;
  // Text and icons drawn on the accent.
  readonly onAccent: string;
  readonly danger: string;
  readonly success: string;
}

// A built-in theme: one palette, or a light and a dark one that follow the
// mode setting.
export interface ThemeDefinition {
  readonly id: string;
  readonly name: string;
  readonly family: string;
  readonly light?: Palette;
  readonly dark?: Palette;
}

const light = (
  colours: Omit<Palette, "scheme" | "danger" | "success"> &
    Partial<Pick<Palette, "danger" | "success">>,
): Palette => ({
  scheme: "light",
  danger: "#d93a3a",
  success: "#2f9e5b",
  ...colours,
});

const dark = (
  colours: Omit<Palette, "scheme" | "danger" | "success"> &
    Partial<Pick<Palette, "danger" | "success">>,
): Palette => ({
  scheme: "dark",
  danger: "#f26b6b",
  success: "#5bd08a",
  ...colours,
});

const panelLight = light({
  background: "oklch(97.4% 0.006 85)",
  card: "oklch(99.5% 0.002 85)",
  text: "oklch(22% 0.012 75)",
  accent: "oklch(76% 0.16 75)",
  onAccent: "oklch(22% 0.04 75)",
});

const panelDark = dark({
  background: "oklch(16.5% 0.008 265)",
  card: "oklch(21% 0.01 265)",
  text: "oklch(95% 0.005 265)",
  accent: "oklch(78% 0.16 75)",
  onAccent: "oklch(18% 0.04 75)",
});

const homeAssistantLight = light({
  background: "#fafafa",
  card: "#ffffff",
  text: "#212121",
  accent: "#03a9f4",
  onAccent: "#ffffff",
  danger: "#db4437",
  success: "#43a047",
});

const homeAssistantDark = dark({
  background: "#111111",
  card: "#1c1c1c",
  text: "#e1e1e1",
  accent: "#03a9f4",
  onAccent: "#ffffff",
  danger: "#ef5350",
  success: "#66bb6a",
});

const iosLight = light({
  background: "#f2f2f7",
  card: "#ffffff",
  text: "#000000",
  accent: "#007aff",
  onAccent: "#ffffff",
  danger: "#ff3b30",
  success: "#34c759",
});

const iosDark = dark({
  background: "#000000",
  card: "#1c1c1e",
  text: "#ffffff",
  accent: "#0a84ff",
  onAccent: "#ffffff",
  danger: "#ff453a",
  success: "#30d158",
});

const catppuccinLatte = light({
  background: "#e6e9ef",
  card: "#eff1f5",
  text: "#4c4f69",
  accent: "#8839ef",
  onAccent: "#eff1f5",
  danger: "#d20f39",
  success: "#40a02b",
});

const catppuccinFrappe = dark({
  background: "#292c3c",
  card: "#303446",
  text: "#c6d0f5",
  accent: "#ca9ee6",
  onAccent: "#232634",
  danger: "#e78284",
  success: "#a6d189",
});

const catppuccinMacchiato = dark({
  background: "#1e2030",
  card: "#24273a",
  text: "#cad3f5",
  accent: "#c6a0f6",
  onAccent: "#181926",
  danger: "#ed8796",
  success: "#a6da95",
});

const catppuccinMocha = dark({
  background: "#181825",
  card: "#1e1e2e",
  text: "#cdd6f4",
  accent: "#cba6f7",
  onAccent: "#11111b",
  danger: "#f38ba8",
  success: "#a6e3a1",
});

const tokyoNight = dark({
  background: "#16161e",
  card: "#1a1b26",
  text: "#c0caf5",
  accent: "#7aa2f7",
  onAccent: "#16161e",
  danger: "#f7768e",
  success: "#9ece6a",
});

const tokyoNightStorm = dark({
  background: "#1f2335",
  card: "#24283b",
  text: "#c0caf5",
  accent: "#7aa2f7",
  onAccent: "#1f2335",
  danger: "#f7768e",
  success: "#9ece6a",
});

const tokyoNightMoon = dark({
  background: "#1e2030",
  card: "#222436",
  text: "#c8d3f5",
  accent: "#82aaff",
  onAccent: "#1e2030",
  danger: "#ff757f",
  success: "#c3e88d",
});

const tokyoNightDay = light({
  background: "#d0d5e3",
  card: "#e1e2e7",
  text: "#3760bf",
  accent: "#2e7de9",
  onAccent: "#e1e2e7",
  danger: "#f52a65",
  success: "#587539",
});

const nordDark = dark({
  background: "#2e3440",
  card: "#3b4252",
  text: "#eceff4",
  accent: "#88c0d0",
  onAccent: "#2e3440",
  danger: "#bf616a",
  success: "#a3be8c",
});

const nordLight = light({
  background: "#e5e9f0",
  card: "#eceff4",
  text: "#2e3440",
  accent: "#5e81ac",
  onAccent: "#eceff4",
  danger: "#bf616a",
  success: "#8fac76",
});

const gruvboxDark = dark({
  background: "#1d2021",
  card: "#282828",
  text: "#ebdbb2",
  accent: "#fabd2f",
  onAccent: "#282828",
  danger: "#fb4934",
  success: "#b8bb26",
});

const gruvboxLight = light({
  background: "#f2e5bc",
  card: "#fbf1c7",
  text: "#3c3836",
  accent: "#d65d0e",
  onAccent: "#fbf1c7",
  danger: "#cc241d",
  success: "#79740e",
});

const rosePine = dark({
  background: "#191724",
  card: "#1f1d2e",
  text: "#e0def4",
  accent: "#ebbcba",
  onAccent: "#191724",
  danger: "#eb6f92",
  success: "#9ccfd8",
});

const rosePineMoon = dark({
  background: "#232136",
  card: "#2a273f",
  text: "#e0def4",
  accent: "#c4a7e7",
  onAccent: "#232136",
  danger: "#eb6f92",
  success: "#9ccfd8",
});

const rosePineDawn = light({
  background: "#f2e9e1",
  card: "#fffaf3",
  text: "#575279",
  accent: "#d7827e",
  onAccent: "#fffaf3",
  danger: "#b4637a",
  success: "#286983",
});

const solarizedDark = dark({
  background: "#002b36",
  card: "#073642",
  text: "#93a1a1",
  accent: "#268bd2",
  onAccent: "#fdf6e3",
  danger: "#dc322f",
  success: "#859900",
});

const solarizedLight = light({
  background: "#eee8d5",
  card: "#fdf6e3",
  text: "#586e75",
  accent: "#268bd2",
  onAccent: "#fdf6e3",
  danger: "#dc322f",
  success: "#859900",
});

export const themes: ReadonlyArray<ThemeDefinition> = [
  {
    id: "panel",
    name: "Panel",
    family: "Panel",
    light: panelLight,
    dark: panelDark,
  },
  {
    id: "home-assistant",
    name: "Home Assistant",
    family: "Home Assistant",
    light: homeAssistantLight,
    dark: homeAssistantDark,
  },
  {
    id: "midnight",
    name: "Midnight",
    family: "Home Assistant",
    dark: dark({
      background: "#141518",
      card: "#1e2025",
      text: "#e3e6ec",
      accent: "#5294e2",
      onAccent: "#ffffff",
    }),
  },
  {
    id: "noctis",
    name: "Noctis",
    family: "Home Assistant",
    dark: dark({
      background: "#252934",
      card: "#2b2f3a",
      text: "#ffffff",
      accent: "#5294e2",
      onAccent: "#ffffff",
      danger: "#ff6060",
      success: "#4ec9b0",
    }),
  },
  {
    id: "ios",
    name: "iOS",
    family: "Home Assistant",
    light: iosLight,
    dark: iosDark,
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    family: "Catppuccin",
    light: catppuccinLatte,
    dark: catppuccinMocha,
  },
  {
    id: "catppuccin-latte",
    name: "Latte",
    family: "Catppuccin",
    light: catppuccinLatte,
  },
  {
    id: "catppuccin-frappe",
    name: "Frappé",
    family: "Catppuccin",
    dark: catppuccinFrappe,
  },
  {
    id: "catppuccin-macchiato",
    name: "Macchiato",
    family: "Catppuccin",
    dark: catppuccinMacchiato,
  },
  {
    id: "catppuccin-mocha",
    name: "Mocha",
    family: "Catppuccin",
    dark: catppuccinMocha,
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    family: "Tokyo Night",
    light: tokyoNightDay,
    dark: tokyoNight,
  },
  {
    id: "tokyo-night-storm",
    name: "Storm",
    family: "Tokyo Night",
    dark: tokyoNightStorm,
  },
  {
    id: "tokyo-night-moon",
    name: "Moon",
    family: "Tokyo Night",
    dark: tokyoNightMoon,
  },
  {
    id: "tokyo-night-day",
    name: "Day",
    family: "Tokyo Night",
    light: tokyoNightDay,
  },
  {
    id: "nord",
    name: "Nord",
    family: "Nord",
    light: nordLight,
    dark: nordDark,
  },
  {
    id: "dracula",
    name: "Dracula",
    family: "More",
    dark: dark({
      background: "#21222c",
      card: "#282a36",
      text: "#f8f8f2",
      accent: "#bd93f9",
      onAccent: "#21222c",
      danger: "#ff5555",
      success: "#50fa7b",
    }),
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    family: "More",
    light: gruvboxLight,
    dark: gruvboxDark,
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    family: "Rosé Pine",
    light: rosePineDawn,
    dark: rosePine,
  },
  {
    id: "rose-pine-moon",
    name: "Moon",
    family: "Rosé Pine",
    dark: rosePineMoon,
  },
  {
    id: "rose-pine-dawn",
    name: "Dawn",
    family: "Rosé Pine",
    light: rosePineDawn,
  },
  {
    id: "solarized",
    name: "Solarized",
    family: "More",
    light: solarizedLight,
    dark: solarizedDark,
  },
  {
    id: "one-dark",
    name: "One Dark",
    family: "More",
    dark: dark({
      background: "#21252b",
      card: "#282c34",
      text: "#abb2bf",
      accent: "#61afef",
      onAccent: "#21252b",
      danger: "#e06c75",
      success: "#98c379",
    }),
  },
];

// The accents that can replace a theme's own, as OKLCH hue and chroma.
export const accents: ReadonlyArray<
  readonly [Exclude<Accent, "theme">, number, number]
> = [
  ["amber", 75, 0.16],
  ["coral", 38, 0.16],
  ["rose", 8, 0.16],
  ["violet", 295, 0.16],
  ["blue", 252, 0.16],
  ["teal", 185, 0.12],
  ["lime", 128, 0.17],
];

const hex = /^#([\da-f]{6})$/i;

// Dark text on light colours and light text on dark ones, for a custom
// theme's accent.
export const readableOn = (colour: string) => {
  const [, digits] = hex.exec(colour) ?? [];

  if (digits === undefined) {
    return "#ffffff";
  }

  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(digits.slice(offset, offset + 2), 16) / 255;

    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#111111" : "#ffffff";
};

export const customPalette = (theme: CustomTheme): Palette =>
  (theme.scheme === "light" ? light : dark)({
    background: theme.background,
    card: theme.card,
    text: theme.text,
    accent: theme.accent,
    onAccent: readableOn(theme.accent),
  });

// The palette the settings pick on a device that prefers dark or not.
export const resolvePalette = (settings: Settings, prefersDark: boolean) => {
  const custom = settings.customThemes.find(({ id }) => id === settings.theme);

  const builtIn =
    themes.find(({ id }) => id === settings.theme) ?? themes[0] ?? undefined;

  const wantsDark = schemeFor(settings.mode, prefersDark) === "dark";

  const palette =
    custom === undefined
      ? wantsDark
        ? (builtIn?.dark ?? builtIn?.light ?? panelDark)
        : (builtIn?.light ?? builtIn?.dark ?? panelLight)
      : customPalette(custom);

  const accent = accents.find(([name]) => name === settings.accent);

  if (accent === undefined) {
    return palette;
  }

  const [, hue, chroma] = accent;

  return {
    ...palette,
    accent: `oklch(${palette.scheme === "dark" ? 78 : 70}% ${chroma} ${hue})`,
    onAccent: `oklch(20% 0.04 ${hue})`,
  };
};

const schemeFor = (mode: Mode, prefersDark: boolean): Scheme =>
  mode === "system" ? (prefersDark ? "dark" : "light") : mode;

// Whether a theme follows the mode setting, rather than being only light or
// only dark.
export const hasBothSchemes = (theme: ThemeDefinition) =>
  theme.light !== undefined && theme.dark !== undefined;

// Puts the palette on the page, where style.css mixes every other token from
// it.
export const applyPalette = (root: HTMLElement, palette: Palette) => {
  root.dataset.scheme = palette.scheme;
  root.style.setProperty("--pn-base-bg", palette.background);
  root.style.setProperty("--pn-base-card", palette.card);
  root.style.setProperty("--pn-base-text", palette.text);
  root.style.setProperty("--pn-accent", palette.accent);
  root.style.setProperty("--pn-accent-text", palette.onAccent);
  root.style.setProperty("--pn-danger", palette.danger);
  root.style.setProperty("--pn-success", palette.success);
  root
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", palette.background);
};
