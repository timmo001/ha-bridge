import { Schema } from "effect";

export class HomeAssistantError extends Schema.TaggedError<HomeAssistantError>()(
  "HomeAssistantError",
  { message: Schema.String },
) {}
