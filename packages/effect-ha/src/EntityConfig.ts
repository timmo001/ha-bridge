import { Effect, Option, Schema } from "effect";
import { HttpBody } from "effect/http";
import { HomeAssistantError } from "./HomeAssistantError.js";
import {
  requireOk,
  restRequest,
  restResponse,
  type RestOptions,
} from "./Rest.js";

// Domains whose items Home Assistant's editor reads and writes:
// automations.yaml and scripts.yaml.
export const ConfigDomain = Schema.Literals(["automation", "script"]);

export type ConfigDomain = typeof ConfigDomain.Type;

// One automation's or script's config, as its YAML holds it.
export const ConfigItem = Schema.Record(Schema.String, Schema.Json);

export type ConfigItem = typeof ConfigItem.Type;

const decodeConfigItem = Schema.decodeUnknownEffect(
  Schema.fromJsonString(ConfigItem),
);

// The editor's key for an item: an automation's `id`, or a script's key in
// scripts.yaml. Both are the entity's unique ID.
const configPath = (domain: ConfigDomain, id: string) =>
  `config/${domain}/config/${encodeURIComponent(id)}`;

// The item from automations.yaml or scripts.yaml, or none when it isn't
// there, such as one defined in configuration.yaml or a package. Needs an
// admin token.
export const editorConfig = Effect.fn("HomeAssistant.editorConfig")(function* (
  options: RestOptions,
  domain: ConfigDomain,
  id: string,
) {
  const path = configPath(domain, id);
  const response = yield* restResponse(options, "GET", path);

  if (response.status === 404) {
    return Option.none<ConfigItem>();
  }

  const text = yield* (yield* requireOk(path, response)).text.pipe(
    Effect.mapError(
      (error) => new HomeAssistantError({ message: error.message }),
    ),
  );

  return Option.some(
    yield* decodeConfigItem(text).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode ${domain} config: ${error.message}`,
          }),
      ),
    ),
  );
});

// Writes the item, replacing all of it, or adds it when the key is new.
// Home Assistant validates it first, then reloads it. Needs an admin token.
export const saveEditorConfig = Effect.fn("HomeAssistant.saveEditorConfig")(
  function* (
    options: RestOptions,
    domain: ConfigDomain,
    id: string,
    config: ConfigItem,
  ) {
    yield* restRequest(options, "POST", configPath(domain, id), {
      body: HttpBody.jsonUnsafe(config),
    });
  },
);

// Removes the item and its entity. Needs an admin token.
export const deleteEditorConfig = Effect.fn("HomeAssistant.deleteEditorConfig")(
  function* (options: RestOptions, domain: ConfigDomain, id: string) {
    yield* restRequest(options, "DELETE", configPath(domain, id));
  },
);
