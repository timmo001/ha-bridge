import { defineConfig } from "blume";
import { cloudflare } from "blume/deploy";
import commandPages from "./commands-sidebar.json" with { type: "json" };

export default defineConfig({
  title: "Home Assistant Bridge",
  description:
    "One shared Home Assistant connection for your machine, served to local apps over a single socket.",
  logo: {
    image: "/favicon.svg",
    text: "Home Assistant Bridge",
  },
  content: {
    root: "src/content/docs",
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
          "/actions/home-assistant",
        ],
      },
      {
        label: "Using",
        items: ["/using/watching", "/using/completions"],
      },
      "/libraries",
      {
        label: "Reference",
        display: "group",
        collapsed: true,
        items: [
          {
            label: "Commands",
            root: "/reference/commands",
            items: commandPages.filter((page) => page !== "/reference/commands"),
            display: "group",
            collapsed: true,
          },
          "/reference/bar-json",
          "/reference/protocol",
        ],
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
