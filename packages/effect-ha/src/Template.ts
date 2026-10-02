import { Schema } from "effect";

// A template for Home Assistant to render, with `render_template`.
export const TemplateRequest = Schema.Struct({
  template: Schema.String,
  variables: Schema.optional(Schema.Record(Schema.String, Schema.Json)),
  // Fail on undefined variables instead of rendering them empty.
  strict: Schema.optional(Schema.Boolean),
  // Seconds the first render may take.
  timeout: Schema.optional(Schema.Finite),
});

export type TemplateRequest = typeof TemplateRequest.Type;

// A render: the result, parsed into a number, list or object where it reads
// as one, or an error or warning from rendering.
export const TemplateUpdate = Schema.Union([
  Schema.Struct({ result: Schema.Json }),
  Schema.Struct({ error: Schema.String, level: Schema.String }),
]);

export type TemplateUpdate = typeof TemplateUpdate.Type;

// A template's first render, with any warnings from rendering it.
export const TemplateRender = Schema.Struct({
  result: Schema.Json,
  warnings: Schema.Array(Schema.String),
});

export type TemplateRender = typeof TemplateRender.Type;
