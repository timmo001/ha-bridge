import { Schema } from "effect";
import { ConfigDomain, ConfigItem } from "@timmo001/effect-ha";

// Why a config can't be read or written: the bridge's token doesn't belong
// to an admin, or the item isn't in automations.yaml or scripts.yaml, so
// Home Assistant's editor can't change it. The bridge checks before asking.
export class ConfigUnavailable extends Schema.TaggedError<ConfigUnavailable>()(
  "ConfigUnavailable",
  {
    reason: Schema.Literals(["admin", "not_editable"]),
    message: Schema.String,
  },
) {}

// An automation or script by entity ID, such as automation.morning.
export const EntityConfigRequest = Schema.Struct({
  domain: ConfigDomain,
  entity_id: Schema.String,
});

export type EntityConfigRequest = typeof EntityConfigRequest.Type;

export const EntityConfig = Schema.Struct({
  domain: ConfigDomain,
  entity_id: Schema.String,
  // The editor's key: an automation's `id`, or a script's key in
  // scripts.yaml. Null when the entity has no unique ID.
  id: Schema.NullOr(Schema.String),
  // Whether it's in automations.yaml or scripts.yaml, which the editor and
  // the update and delete RPCs can change. Others are defined in
  // configuration.yaml or a package.
  editable: Schema.Boolean,
  // The config it was loaded from, as its YAML holds it.
  config: ConfigItem,
});

export type EntityConfig = typeof EntityConfig.Type;

// A new automation or script. An automation's key is made up when left
// out; a script's comes from its alias.
export const CreateEntityConfigRequest = Schema.Struct({
  domain: ConfigDomain,
  id: Schema.optional(Schema.String),
  config: ConfigItem,
});

export type CreateEntityConfigRequest = typeof CreateEntityConfigRequest.Type;

// Replaces all of an automation's or script's config.
export const UpdateEntityConfigRequest = Schema.Struct({
  domain: ConfigDomain,
  entity_id: Schema.String,
  config: ConfigItem,
});

export type UpdateEntityConfigRequest = typeof UpdateEntityConfigRequest.Type;

// Where a saved config lives. Home Assistant reloads it after saving, so a
// new item's entity appears shortly after.
export const SavedEntityConfig = Schema.Struct({
  domain: ConfigDomain,
  id: Schema.String,
});

export type SavedEntityConfig = typeof SavedEntityConfig.Type;

// An automation or script config to check without saving it.
export const ValidateEntityConfigRequest = Schema.Struct({
  domain: ConfigDomain,
  config: ConfigItem,
});

export type ValidateEntityConfigRequest =
  typeof ValidateEntityConfigRequest.Type;

export const ConfigPart = Schema.Literals([
  "triggers",
  "conditions",
  "actions",
]);

export const ReferenceKind = Schema.Literals([
  "entity",
  "action",
  "device",
  "area",
  "floor",
  "label",
]);

export const ConfigValidation = Schema.Struct({
  // True when there are no errors and no unknown references.
  valid: Schema.Boolean,
  // Parts Home Assistant rejects, with its reason, or that are missing.
  errors: Schema.Array(
    Schema.Struct({ part: ConfigPart, message: Schema.String }),
  ),
  // What the config names that Home Assistant doesn't have. Templates
  // aren't read.
  unknown: Schema.Array(
    Schema.Struct({ kind: ReferenceKind, id: Schema.String }),
  ),
});

export type ConfigValidation = typeof ConfigValidation.Type;
