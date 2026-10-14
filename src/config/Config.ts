import {
  Config,
  Context,
  Effect,
  FileSystem,
  Layer,
  Option,
  Path,
  Redacted,
  Schema,
  Terminal,
} from "effect";
import { Prompt } from "effect/cli";
import type { SupervisorOptions } from "@timmo001/effect-ha";

export class ConfigError extends Schema.TaggedError<ConfigError>()(
  "ConfigError",
  { message: Schema.String },
) {}

export interface HomeAssistantConfig {
  readonly url: string;
  readonly token: Redacted.Redacted;
  // Set inside a Home Assistant app, where Supervisor requests go straight
  // to the Supervisor rather than through Core's proxy.
  readonly supervisor?: SupervisorOptions | undefined;
}

// Inside a Home Assistant app, Core is reached through the Supervisor's
// proxy with the app's token, and the Supervisor's API directly.
const supervisorConfig = (token: Redacted.Redacted): HomeAssistantConfig => ({
  url: "http://supervisor/core",
  token,
  supervisor: { url: "http://supervisor", token, direct: true },
});

const ConfigFile = Schema.Struct({
  homeassistant: Schema.Struct({
    url: Schema.String,
    token: Schema.String,
  }),
});

const decodeConfigFile = Schema.decodeUnknownEffect(ConfigFile);

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

export interface BridgeConfigService {
  readonly path: string;
  readonly load: Effect.Effect<HomeAssistantConfig, ConfigError>;
  readonly setup: Effect.Effect<
    HomeAssistantConfig,
    ConfigError,
    Terminal.Terminal
  >;
}

export class BridgeConfig extends Context.Service<
  BridgeConfig,
  BridgeConfigService
>()("BridgeConfig") {
  static readonly layer = Layer.effect(
    BridgeConfig,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const home = yield* Config.String("HOME").pipe(Config.withDefault(""));

      const configHome = yield* Config.String("XDG_CONFIG_HOME").pipe(
        Config.withDefault(path.join(home, ".config")),
      );

      const directory = path.join(configHome, "ha-bridge");
      const configPath = path.join(directory, "config.yml");
      const legacyPath = path.join(configHome, "go-automate", "config.yml");

      // Home Assistant apps get this; desktops never do.
      const supervisorToken = yield* Config.option(
        Config.Redacted("SUPERVISOR_TOKEN"),
      ).pipe(
        Effect.map(
          Option.filter((token) => Redacted.value(token).trim() !== ""),
        ),
      );

      const read = Effect.fn("BridgeConfig.read")(
        function* (file: string) {
          const exists = yield* fs.exists(file);

          if (!exists) {
            return Option.none<HomeAssistantConfig>();
          }

          const content = yield* fs.readFileString(file);

          const parsed = yield* Effect.try({
            try: () => Bun.YAML.parse(content),
            catch: (cause) =>
              new ConfigError({ message: `parse ${file}: ${String(cause)}` }),
          });

          const { homeassistant } = yield* decodeConfigFile(parsed);

          if (
            !isHttpUrl(homeassistant.url) ||
            homeassistant.token.trim() === ""
          ) {
            return Option.none<HomeAssistantConfig>();
          }

          return Option.some({
            url: homeassistant.url,
            token: Redacted.make(homeassistant.token.trim()),
          });
        },
        Effect.mapError(
          (cause) =>
            new ConfigError({ message: `read config: ${String(cause)}` }),
        ),
      );

      const save = Effect.fn("BridgeConfig.save")(
        function* (config: HomeAssistantConfig) {
          yield* fs.makeDirectory(directory, { recursive: true, mode: 0o700 });
          yield* fs.chmod(directory, 0o700);
          yield* fs.writeFileString(
            configPath,
            Bun.YAML.stringify({
              homeassistant: {
                url: config.url,
                token: Redacted.value(config.token),
              },
            }),
            { mode: 0o600 },
          );
          yield* fs.chmod(configPath, 0o600);
        },
        Effect.mapError(
          (cause) =>
            new ConfigError({ message: `save config: ${String(cause)}` }),
        ),
      );

      const load = Effect.gen(function* () {
        const current = yield* read(configPath);

        if (Option.isSome(current)) {
          return current.value;
        }

        const legacy = yield* read(legacyPath);

        if (Option.isSome(legacy)) {
          yield* save(legacy.value);
          yield* Effect.logInfo("Imported Go Automate config", configPath);

          return legacy.value;
        }

        if (Option.isSome(supervisorToken)) {
          return supervisorConfig(supervisorToken.value);
        }

        return yield* new ConfigError({
          message: `Home Assistant is not configured; run ha-bridge setup to create ${configPath}`,
        });
      });

      const setup = Effect.gen(function* () {
        const existing = yield* read(configPath).pipe(
          Effect.orElseSucceed(() => Option.none<HomeAssistantConfig>()),
        );

        const url = yield* Prompt.run(
          Prompt.String({
            message: "What is your Home Assistant URL?",
            default: Option.match(existing, {
              onNone: () => "",
              onSome: (config) => config.url,
            }),
            validate: (value) =>
              isHttpUrl(value.trim())
                ? Effect.succeed(value.trim())
                : Effect.fail("Please enter a valid URL"),
          }),
        );

        const token = yield* Prompt.run(
          Prompt.Password({
            message:
              "What is your Home Assistant token? (Create a long-lived access token in your Home Assistant profile)",
            validate: (value) =>
              value.trim() === ""
                ? Effect.fail("Please enter a valid token")
                : Effect.succeed(value.trim()),
          }),
        );

        const config = { url, token };
        yield* save(config);

        return config;
      }).pipe(
        Effect.catchTag("QuitError", () =>
          Effect.fail(new ConfigError({ message: "setup cancelled" })),
        ),
        Effect.provideService(FileSystem.FileSystem, fs),
        Effect.provideService(Path.Path, path),
      );

      return BridgeConfig.of({ path: configPath, load, setup });
    }),
  );
}
