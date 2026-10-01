import { Schema } from "effect";

export const CameraSnapshot = Schema.Struct({
  contentType: Schema.String,
  data: Schema.Uint8Array,
});

export type CameraSnapshot = typeof CameraSnapshot.Type;
