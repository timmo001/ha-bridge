import { Schema } from "effect";
import { Target } from "@timmo001/effect-ha";

// What to read or watch. Every target field takes IDs or exact names, which
// the bridge resolves; `domain` keeps only entities in that domain, such as
// light.
export const TargetRequest = Schema.Struct({
  target: Target,
  domain: Schema.optional(Schema.String),
});

export type TargetRequest = typeof TargetRequest.Type;

// A target the bridge couldn't resolve: a name matching nothing or more than
// one item, or a command that needs exactly one entity matching several.
export class TargetError extends Schema.TaggedError<TargetError>()(
  "TargetError",
  { message: Schema.String },
) {}
