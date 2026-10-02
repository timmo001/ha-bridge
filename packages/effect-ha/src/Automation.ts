import { Schema } from "effect";

const Variables = Schema.Record(Schema.String, Schema.Json);

// One automation trigger config, or a list of them, as in YAML.
const TriggerConfig = Schema.Union([Variables, Schema.Array(Variables)]);

// One automation condition config, as in YAML. Combine several with an `and`
// condition.
const ConditionConfig = Variables;

// Triggers to listen for, as in an automation's `triggers`. Needs an admin
// token.
export const TriggerRequest = Schema.Struct({
  trigger: TriggerConfig,
  // Variables the triggers' templates read.
  variables: Schema.optional(Variables),
});

export type TriggerRequest = typeof TriggerRequest.Type;

// A trigger firing: the `trigger` variable and others an automation would
// see, and the context that caused it.
export const TriggerEvent = Schema.Struct({
  variables: Variables,
  context: Schema.NullOr(Schema.Json),
});

export type TriggerEvent = typeof TriggerEvent.Type;

// A condition to check, as in an automation's `conditions`. Needs an admin
// token.
export const ConditionRequest = Schema.Struct({
  condition: ConditionConfig,
  // Variables the conditions' templates read.
  variables: Schema.optional(Variables),
});

export type ConditionRequest = typeof ConditionRequest.Type;

// A condition to keep checking. Home Assistant checks it every second.
export const WatchConditionRequest = Schema.Struct({
  condition: ConditionConfig,
});

export type WatchConditionRequest = typeof WatchConditionRequest.Type;

// Template errors are recorded rather than failing the check, such as an
// undefined variable.
const templateErrors = Schema.optionalKey(Schema.Array(Schema.String));

// Whether the conditions pass.
export const ConditionResult = Schema.Struct({
  result: Schema.Boolean,
  template_errors: templateErrors,
});

export type ConditionResult = typeof ConditionResult.Type;

// A change in whether the conditions pass, or an error checking them.
export const ConditionUpdate = Schema.Union([
  ConditionResult,
  Schema.Struct({ error: Schema.String, template_errors: templateErrors }),
]);

export type ConditionUpdate = typeof ConditionUpdate.Type;
