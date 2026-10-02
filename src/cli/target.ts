import type { Target } from "@timmo001/effect-ha";
import { Argument, type Command, Flag } from "effect/cli";

const targetFlag = (name: string, description: string) =>
  Flag.String(name).pipe(Flag.withDescription(description), Flag.atLeast(0));

// Target flags, which take IDs or names.
export const targetFlags = {
  entity: targetFlag("entity", "Entity ID or name; repeat for more"),
  device: targetFlag("device", "Device ID or name; repeat for more"),
  area: targetFlag("area", "Area ID or name; repeat for more"),
  floor: targetFlag("floor", "Floor ID or name; repeat for more"),
  label: targetFlag("label", "Label ID or name; repeat for more"),
};

// What a command acts on. Positionals are entity IDs; with a domain, an ID
// without a dot gets that domain's prefix. Keep this as the command config's
// last key: positionals are read in key order, and these take every remaining
// one.
export const targetConfig = (domain: string | undefined) => ({
  entities: Argument.String("entity_id").pipe(
    Argument.withDescription(
      domain === undefined
        ? "Entity ID, such as light.desk; repeat for more"
        : `Entity ID, with or without the ${domain}. prefix; repeat for more`,
    ),
    Argument.atLeast(0),
  ),
  ...targetFlags,
});

export type TargetInput = Command.Command.Config.Infer<typeof targetFlags> & {
  readonly entities?: ReadonlyArray<string>;
};

export const toTarget = (
  domain: string | undefined,
  input: TargetInput,
): Target => {
  const fields = {
    entity_id: [
      ...(input.entities ?? []).map((id) =>
        domain === undefined || id.includes(".") ? id : `${domain}.${id}`,
      ),
      ...input.entity,
    ],
    device_id: input.device,
    area_id: input.area,
    floor_id: input.floor,
    label_id: input.label,
  };

  return Object.fromEntries(
    Object.entries(fields).filter(([, values]) => values.length > 0),
  );
};
