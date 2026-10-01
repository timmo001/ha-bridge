import { defineConfig } from "blume";
import { cloudflare } from "blume/deploy";

export default defineConfig({
  title: "ha-bridge",
  description:
    "One shared Home Assistant connection for your machine, served to local apps over a single socket.",
  logo: {
    image: "/favicon.svg",
    text: "ha-bridge",
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
        label: "Using",
        items: ["/using/actions", "/using/watching", "/using/completions"],
      },
      {
        label: "Reference",
        items: [
          "/reference/commands",
          "/reference/bar-json",
          "/reference/protocol",
        ],
      },
      "/libraries",
      "/migrating",
    ],
  },
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
