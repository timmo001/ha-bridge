import { Schema } from "effect";

export class HomeAssistantError extends Schema.TaggedError<HomeAssistantError>()(
  "HomeAssistantError",
  {
    message: Schema.String,
    // The HTTP status, when a REST or Supervisor request answered one.
    status: Schema.optionalKey(Schema.Finite),
  },
) {}
