import { defineConfig } from "blume";
import { cloudflare } from "blume/deploy";
import commandPages from "./commands-sidebar.json" with { type: "json" };

export default defineConfig({
  title: "Home Assistant Bridge",
  description:
    "One shared Home Assistant connection for your machine, served to local apps over a single socket.",
  logo: {
    image: {
      alt: "Home Assistant Bridge",
      dark: "/logo-dark.svg",
      light: "/logo-light.svg",
    },
    text: "Home Assistant Bridge",
  },
  content: {
    root: "src/content/docs",
  },
  markdown: {
    externalLinks: true,
  },
  github: {
    owner: "timmo001",
    repo: "ha-bridge",
    branch: "main",
    dir: "docs",
  },
  navigation: {
    repo: true,
    sidebar: [
      "/",
      "/install",
      "/configuration",
      "/running",
      {
        label: "Actions",
        root: "/actions",
        items: [
          "/actions/lights",
          "/actions/switches",
          "/actions/input-booleans",
          "/actions/input-numbers",
          "/actions/covers",
          "/actions/climate",
          "/actions/assist-satellites",
          "/actions/cameras",
          "/actions/buttons",
          "/actions/locks",
          "/actions/valves",
          "/actions/sirens",
          "/actions/remotes",
          "/actions/selects",
          "/actions/values",
          "/actions/counters",
          "/actions/scripts",
          "/actions/automations",
          "/actions/scenes",
          "/actions/timers",
          "/actions/groups",
          "/actions/fans",
          "/actions/humidifiers",
          "/actions/media-players",
          "/actions/vacuums",
          "/actions/alarms",
          "/actions/updates",
          "/actions/notifications",
          "/actions/todo-lists",
          "/actions/calendars",
          "/actions/conversation",
          "/actions/images",
          "/actions/alerts",
          "/actions/system",
          "/actions/supervisor",
          "/actions/commands",
          "/actions/home-assistant",
        ],
      },
      {
        label: "Using",
        items: [
          "/using/reading",
          "/using/search",
          "/using/templates",
          "/using/events",
          "/using/history",
          "/using/bar-json",
          "/using/completions",
          "/using/protocol",
        ],
      },
      "/libraries",
      {
        label: "Commands",
        root: "/commands",
        items: commandPages.filter((page) => page !== "/commands"),
        display: "group",
        collapsed: true,
      },
      {
        label: "Migrations",
        items: ["/from-go-automate"],
      },
    ],
  },
  redirects: [
    { from: "/migrating", to: "/from-go-automate" },
    { from: "/using/actions", to: "/actions" },
    { from: "/using/watching", to: "/using/reading" },
    { from: "/reference/bar-json", to: "/using/bar-json" },
    { from: "/reference/protocol", to: "/using/protocol" },
    { from: "/reference/commands/:slug*", to: "/commands/:slug*" },
  ],
  theme: {
    accent: {
      light: "#0277bd",
      dark: "#03a9f4",
    },
  },
  ai: {
    assistant: {
      enabled: false,
    },
  },
  agents: {
    agentReadability: true,
    contentSignals: {
      aiInput: true,
      aiTrain: false,
      search: true,
    },
    llmsTxt: true,
    mcp: {
      enabled: true,
      route: "/mcp",
    },
    webmcp: true,
  },
  deployment: cloudflare({
    site: "https://ha-bridge.timmo.dev",
  }),
  feedback: false,
  lastModified: "git",
  seo: {
    og: {
      enabled: true,
      logo: "src/assets/logo.svg",
      site: "ha-bridge.timmo.dev",
    },
  },
});
