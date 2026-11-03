import { Schema } from "effect";
import { Target, UpdateFeature } from "@timmo001/effect-ha";

// Which updates to read: every update entity, or only those the target
// refers to. Takes IDs or names, like every target.
export const UpdatesRequest = Schema.Struct({
  target: Schema.optional(Target),
  // Only those with a newer version waiting that isn't skipped.
  available: Schema.optional(Schema.Boolean),
});

export type UpdatesRequest = typeof UpdatesRequest.Type;

// One update entity: Core, the OS, the Supervisor, an app, a device's
// firmware or anything else an integration offers updates for.
export const UpdateStatus = Schema.Struct({
  entity_id: Schema.String,
  // The name Home Assistant dashboards show.
  name: Schema.String,
  // What gets updated, such as Home Assistant Core, when the integration
  // says.
  title: Schema.NullOr(Schema.String),
  // on with an update waiting, off when up to date or the latest version is
  // skipped, unavailable or unknown otherwise.
  state: Schema.String,
  installed_version: Schema.NullOr(Schema.String),
  latest_version: Schema.NullOr(Schema.String),
  skipped_version: Schema.NullOr(Schema.String),
  in_progress: Schema.Boolean,
  // From 0 to 100 while installing, when the integration reports it.
  update_percentage: Schema.NullOr(Schema.Finite),
  auto_update: Schema.Boolean,
  release_summary: Schema.NullOr(Schema.String),
  release_url: Schema.NullOr(Schema.String),
  features: Schema.Array(UpdateFeature),
});

export type UpdateStatus = typeof UpdateStatus.Type;

// The target must match exactly one update entity.
export const UpdateRequest = Schema.Struct({ target: Target });

export type UpdateRequest = typeof UpdateRequest.Type;

// One update in full.
export const UpdateDetails = Schema.Struct({
  ...UpdateStatus.fields,
  // The integration behind it, such as hassio or esphome, when the entity
  // is in the registry.
  integration: Schema.NullOr(Schema.String),
  // Markdown, for entities that support release notes and have some.
  release_notes: Schema.NullOr(Schema.String),
});

export type UpdateDetails = typeof UpdateDetails.Type;

// Checks every update entity for new versions, or only those the target
// refers to. With a Supervisor and an admin token, the Supervisor checks
// first and reloads its app store, as Settings > Updates does.
export const CheckUpdatesRequest = Schema.Struct({
  target: Schema.optional(Target),
});

export type CheckUpdatesRequest = typeof CheckUpdatesRequest.Type;

// How a check for updates went.
export const UpdatesCheck = Schema.Struct({
  // Whether the Supervisor checked first: skipped without a Supervisor or
  // an admin token.
  supervisor: Schema.Literals(["checked", "no-supervisor", "not-admin"]),
  // The update entities asked to check again.
  entities: Schema.Array(Schema.String),
});

export type UpdatesCheck = typeof UpdatesCheck.Type;
