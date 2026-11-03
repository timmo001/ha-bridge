import { Effect, Schema } from "effect";
import { type SupervisorOptions, supervisorRequest } from "./Rest.js";

// What an update entity can do, from its `supported_features` bit flags.
export const UpdateFeature = Schema.Literals([
  "install",
  "specific_version",
  "progress",
  "backup",
  "release_notes",
]);

export type UpdateFeature = typeof UpdateFeature.Type;

const featureFlags: ReadonlyArray<readonly [UpdateFeature, number]> = [
  ["install", 1],
  ["specific_version", 2],
  ["progress", 4],
  ["backup", 8],
  ["release_notes", 16],
];

export const updateFeatures = (
  supported: number,
): ReadonlyArray<UpdateFeature> =>
  featureFlags.flatMap(([feature, flag]) =>
    (supported & flag) === flag ? [feature] : [],
  );

// Has the Supervisor check for new versions of Core, the OS, itself and its
// plugins, and reload the app store, as Settings > Updates > Check for
// updates does through its update entities. Needs an admin token, or an app
// with the Supervisor's manager role.
export const refreshSupervisorUpdates = Effect.fn(
  "HomeAssistant.refreshSupervisorUpdates",
)(function* (options: SupervisorOptions) {
  yield* supervisorRequest(options, "refresh_updates", {}, "POST");
});
