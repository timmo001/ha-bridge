import type { Target } from "@timmo001/effect-ha";
import { Argument, type Command, Flag } from "effect/cli";

const targetFlag = (name: string, description: string) =>
  Flag.String(name).pipe(Flag.withDescription(description), Flag.atLeast(0));

// Target flags, which take IDs or names. The exclude flags leave matches out.
export const targetFlags = {
  entity: targetFlag("entity", "Entity ID or name; repeat for more"),
  device: targetFlag("device", "Device ID or name; repeat for more"),
  area: targetFlag("area", "Area ID or name; repeat for more"),
  floor: targetFlag("floor", "Floor ID or name; repeat for more"),
  label: targetFlag("label", "Label ID or name; repeat for more"),
  excludeEntity: targetFlag(
    "exclude-entity",
    "Entity ID or name to leave out; repeat for more",
  ),
  excludeDevice: targetFlag(
    "exclude-device",
    "Device ID or name to leave out; repeat for more",
  ),
  excludeArea: targetFlag(
    "exclude-area",
    "Area ID or name to leave out; repeat for more",
  ),
  excludeFloor: targetFlag(
    "exclude-floor",
    "Floor ID or name to leave out; repeat for more",
  ),
  excludeLabel: targetFlag(
    "exclude-label",
    "Label ID or name to leave out; repeat for more",
  ),
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

const withDomain = (domain: string | undefined, id: string) =>
  domain === undefined || id.includes(".") ? id : `${domain}.${id}`;

const present = (fields: Readonly<Record<string, ReadonlyArray<string>>>) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, values]) => values.length > 0),
  );

export const toTarget = (
  domain: string | undefined,
  input: TargetInput,
): Target => {
  const fields = present({
    entity_id: [
      ...(input.entities ?? []).map((id) => withDomain(domain, id)),
      ...input.entity,
    ],
    device_id: input.device,
    area_id: input.area,
    floor_id: input.floor,
    label_id: input.label,
  });

  const exclude = present({
    entity_id: input.excludeEntity.map((id) => withDomain(domain, id)),
    device_id: input.excludeDevice,
    area_id: input.excludeArea,
    floor_id: input.excludeFloor,
    label_id: input.excludeLabel,
  });

  return Object.keys(exclude).length === 0 ? fields : { ...fields, exclude };
};
