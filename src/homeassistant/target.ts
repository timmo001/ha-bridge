import { Array as Arr, Effect } from "effect";
import {
  deviceName,
  displayName,
  friendlyName,
  targetFields,
  type EntityState,
  type Target,
  type TargetField,
} from "@timmo001/effect-ha";
import { TargetError } from "@timmo001/effect-ha-bridge";
import type { Registries } from "./registries.js";

// What each target field can be resolved against. `undefined` means the
// registry hasn't loaded, so values pass through as IDs.
interface Candidate {
  readonly id: string;
  readonly name: string;
}

const kinds: Record<TargetField, string> = {
  entity_id: "entity",
  device_id: "device",
  area_id: "area",
  floor_id: "floor",
  label_id: "label",
};

// `all` and `none` are Home Assistant's own target values.
const passthrough = new Set(["all", "none"]);

const entityIdPattern = /^[a-z0-9_]+\.[a-z0-9_]+$/;

const candidatesFor = (
  field: TargetField,
  registries: Registries,
  states: ReadonlyMap<string, EntityState>,
  domain: string | undefined,
): ReadonlyArray<Candidate> | undefined => {
  switch (field) {
    case "entity_id":
      return states.size === 0
        ? undefined
        : Array.from(states.values())
            .filter(
              (state) =>
                domain === undefined ||
                state.entity_id.startsWith(`${domain}.`),
            )
            .map((state) => ({
              id: state.entity_id,
              name: displayName(
                registries.namer,
                state.entity_id,
                friendlyName(state),
              ),
            }));
    case "device_id":
      return registries.devices?.map((device) => ({
        id: device.id,
        name: deviceName(device),
      }));
    case "area_id":
      return registries.areas?.map(({ area_id, name }) => ({
        id: area_id,
        name,
      }));
    case "floor_id":
      return registries.floors?.map(({ floor_id, name }) => ({
        id: floor_id,
        name,
      }));
    case "label_id":
      return registries.labels?.map(({ label_id, name }) => ({
        id: label_id,
        name,
      }));
  }
};

const resolveValue = (
  field: TargetField,
  value: string,
  candidates: ReadonlyArray<Candidate> | undefined,
  domain: string | undefined,
): Effect.Effect<string, TargetError> => {
  if (candidates === undefined || passthrough.has(value)) {
    return Effect.succeed(value);
  }

  // An entity's object ID counts as its ID within the domain.
  const objectId =
    field === "entity_id" && domain !== undefined
      ? `${domain}.${value}`
      : undefined;

  const byId = candidates.find(({ id }) => id === value || id === objectId);

  if (byId !== undefined) {
    return Effect.succeed(byId.id);
  }

  const lower = value.toLowerCase();
  const named = candidates.filter(({ name }) => name.toLowerCase() === lower);

  const [only, ...others] = named;

  if (only !== undefined && others.length === 0) {
    return Effect.succeed(only.id);
  }

  const kind = kinds[field];

  if (named.length > 1) {
    return Effect.fail(
      new TargetError({
        message: `"${value}" matches more than one ${kind}: ${named.map(({ id }) => id).join(", ")}`,
      }),
    );
  }

  // Entities without a state, such as disabled ones, are left to Home
  // Assistant.
  if (field === "entity_id" && entityIdPattern.test(value)) {
    return Effect.succeed(value);
  }

  return Effect.fail(
    new TargetError({ message: `No ${kind} matches "${value}"` }),
  );
};

export const valuesOf = (value: string | ReadonlyArray<string>) =>
  Arr.ensure(value);

// Replaces names in the target with IDs: an exact ID first, then an entity
// object ID in `domain`, then a unique case-insensitive name. `domain` also
// limits entity names to that domain.
export const resolveTarget = Effect.fn("resolveTarget")(function* (
  target: Target,
  context: {
    readonly registries: Registries;
    readonly states: ReadonlyMap<string, EntityState>;
    readonly domain?: string | undefined;
  },
) {
  const resolved: { -readonly [Field in TargetField]?: ReadonlyArray<string> } =
    {};

  for (const field of targetFields) {
    const value = target[field];

    if (value === undefined) {
      continue;
    }

    const candidates = candidatesFor(
      field,
      context.registries,
      context.states,
      context.domain,
    );

    resolved[field] = yield* Effect.forEach(valuesOf(value), (each) =>
      resolveValue(field, each, candidates, context.domain),
    );
  }

  return resolved;
});

export const isEmptyTarget = (target: Target) =>
  targetFields.every((field) => {
    const value = target[field];

    return value === undefined || valuesOf(value).length === 0;
  });

// Whether the target names one entity and nothing else, so it can only ever
// match that entity.
export const isSingleEntityTarget = (target: Target) =>
  targetFields.every((field) => {
    const count =
      target[field] === undefined ? 0 : valuesOf(target[field]).length;

    return count === (field === "entity_id" ? 1 : 0);
  });

// For commands that act on one entity: fails unless exactly one matches.
export const exactlyOne = <A>(
  items: ReadonlyArray<A>,
  idOf: (item: A) => string,
  what = "entity",
): Effect.Effect<A, TargetError> => {
  const [only, ...others] = items;

  if (only !== undefined && others.length === 0) {
    return Effect.succeed(only);
  }

  const ids = items.map(idOf);

  const listed =
    ids.length > 5
      ? `${ids.slice(0, 5).join(", ")} and ${ids.length - 5} more`
      : ids.join(", ");

  return Effect.fail(
    new TargetError({
      message:
        items.length === 0
          ? `The target matches no ${what}`
          : `The target needs to match one ${what} but matches ${items.length}: ${listed}`,
    }),
  );
};
