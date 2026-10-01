import { Schema } from "effect";
import { EntityState } from "@timmo001/effect-ha";

// An entity's state with the display name the bridge resolved for it.
export const EntityUpdate = Schema.Struct({
  state: EntityState,
  name: Schema.String,
});

export type EntityUpdate = typeof EntityUpdate.Type;
