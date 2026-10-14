import { Predicate, type Schema } from "effect";
import type { ConfigDomain, ConfigItem } from "@timmo001/effect-ha";
import type {
  ConfigPart,
  ConfigValidation,
  ReferenceKind,
} from "@timmo001/effect-ha-bridge";

type Part = typeof ConfigPart.Type;

type Kind = typeof ReferenceKind.Type;

export type Reference = ConfigValidation["unknown"][number];

export const configPartNames: ReadonlyArray<Part> = [
  "triggers",
  "conditions",
  "actions",
];

// The parts `validate_config` checks, taking the singular keys older configs
// use, and the ones Home Assistant would refuse to load without. A
// blueprint's parts come from the blueprint, so none are required.
export const configParts = (domain: ConfigDomain, config: ConfigItem) => {
  const parts: Partial<Record<Part, Schema.Json>> =
    domain === "script"
      ? { actions: config.sequence }
      : {
          triggers: config.triggers ?? config.trigger,
          conditions: config.conditions ?? config.condition,
          actions: config.actions ?? config.action,
        };

  const present = Object.fromEntries(
    Object.entries(parts).filter(([, value]) => value !== undefined),
  );

  const required: ReadonlyArray<Part> =
    config.use_blueprint !== undefined
      ? []
      : domain === "script"
        ? ["actions"]
        : ["triggers", "actions"];

  return {
    present,
    missing: required.filter((part) => parts[part] === undefined),
  };
};

const idPattern = /^[a-z0-9_]+\.[a-z0-9_]+$/;

const isTemplate = (value: string) =>
  value.includes("{{") || value.includes("{%");

const idKeys = new Map<string, Kind>([
  ["entity_id", "entity"],
  ["device_id", "device"],
  ["area_id", "area"],
  ["floor_id", "floor"],
  ["label_id", "label"],
]);

// Values here are data for something else, such as event data or script
// fields, so an ID-shaped key in them names nothing.
const valueKeys = new Set([
  "event_data",
  "variables",
  "trigger_variables",
  "fields",
]);

// Action data is read only for the ID keys directly in it.
const dataKeys = new Set(["data", "data_template"]);

const idsIn = (kind: Kind, value: Schema.Json): Array<string> => {
  const values = Predicate.isString(value)
    ? kind === "entity"
      ? value.split(",")
      : [value]
    : Array.isArray(value)
      ? value.filter(Predicate.isString)
      : [];

  return values
    .map((id) => id.trim())
    .filter((id) =>
      kind === "entity" ? idPattern.test(id) : id !== "" && !isTemplate(id),
    );
};

const isConfigObject = (
  value: Schema.Json,
): value is { readonly [key: string]: Schema.Json } =>
  Predicate.isObject(value) && !Array.isArray(value);

// The entities, actions, devices, areas, floors and labels a config names
// outright. Templates aren't read, and steps with `enabled: false` are
// skipped as they never run.
export const configReferences = (config: Schema.Json): Array<Reference> => {
  const found = new Map<string, Reference>();

  const add = (kind: Kind, id: string) =>
    found.set(`${kind}:${id}`, { kind, id });

  const visit = (value: Schema.Json): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);

      return;
    }

    if (!isConfigObject(value) || value.enabled === false) {
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      const kind = idKeys.get(key);

      if (kind !== undefined) {
        idsIn(kind, child).forEach((id) => add(kind, id));
      } else if (key === "action" || key === "service") {
        if (Predicate.isString(child)) {
          if (idPattern.test(child)) {
            add("action", child);
          }
        } else {
          visit(child);
        }
      } else if (key === "zone" && Predicate.isString(child)) {
        idsIn("entity", child).forEach((id) => add("entity", id));
      } else if (dataKeys.has(key)) {
        if (isConfigObject(child)) {
          for (const [dataKey, dataValue] of Object.entries(child)) {
            const dataKind = idKeys.get(dataKey);

            if (dataKind !== undefined) {
              idsIn(dataKind, dataValue).forEach((id) => add(dataKind, id));
            }
          }
        }
      } else if (!valueKeys.has(key)) {
        visit(child);
      }
    }
  };

  visit(config);

  return Array.from(found.values());
};

// Entities in these domains can be made by an action as it runs, so one
// that doesn't exist yet isn't a mistake. Spook leaves them out too.
const createdAtRuntime = [
  "device_tracker.",
  "group.",
  "persistent_notification.",
];

// The IDs Home Assistant has of each kind. A kind left out isn't checked.
export type KnownIds = Partial<Record<Kind, ReadonlySet<string>>>;

export const unknownReferences = (
  references: ReadonlyArray<Reference>,
  known: KnownIds,
): Array<Reference> =>
  references.filter((reference) => {
    const ids = known[reference.kind];

    return (
      ids !== undefined &&
      !ids.has(reference.id) &&
      !(
        reference.kind === "entity" &&
        createdAtRuntime.some((prefix) => reference.id.startsWith(prefix))
      )
    );
  });
