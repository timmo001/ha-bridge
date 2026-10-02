import { Schema } from "effect";

// Mirrors the Home Assistant frontend computeEntityName / formatEntityName
// model from the entity naming migration (home-assistant/epics#44).
const separator = " ";

const stripSuffixes = [" ", ": ", " - "];

const OptionalString = Schema.optionalKey(Schema.NullOr(Schema.String));

// `config/entity_registry/list_for_display` uses compact keys: `ei` entity ID,
// `di` device ID, `ai` area ID and `en` name. Disabled entities are left out.
export const EntityRegistryDisplay = Schema.Struct({
  entities: Schema.Array(
    Schema.Struct({
      ei: Schema.String,
      di: OptionalString,
      ai: OptionalString,
      en: OptionalString,
    }),
  ),
});

// Child devices (Home Assistant 2026.9+) come back stripped, with
// `parent_device_id` set.
export const DeviceRegistry = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: OptionalString,
    name_by_user: OptionalString,
    area_id: OptionalString,
    parent_device_id: OptionalString,
    disabled_by: OptionalString,
    manufacturer: OptionalString,
    model: OptionalString,
  }),
);

export interface EntityNamer {
  readonly entityNames: ReadonlyMap<
    string,
    { readonly deviceId: string; readonly name: string }
  >;
  readonly deviceNames: ReadonlyMap<string, string>;
  // Child device ID to parent device ID.
  readonly parentDeviceIds: ReadonlyMap<string, string>;
}

export const deviceName = (device: {
  readonly name?: string | null;
  readonly name_by_user?: string | null;
}): string => device.name_by_user?.trim() || device.name?.trim() || "";

export const entityNamerFrom = (
  display: typeof EntityRegistryDisplay.Type,
  devices: typeof DeviceRegistry.Type,
): EntityNamer => ({
  entityNames: new Map(
    display.entities.map((entry) => [
      entry.ei,
      { deviceId: entry.di ?? "", name: entry.en ?? "" },
    ]),
  ),
  deviceNames: new Map(
    devices.map((device) => [device.id, deviceName(device)]),
  ),
  parentDeviceIds: new Map(
    devices.flatMap((device) =>
      device.parent_device_id ? [[device.id, device.parent_device_id]] : [],
    ),
  ),
});

const capitalizeFirst = (value: string): string => {
  const characters = Array.from(value);

  if (characters.length === 0) {
    return value;
  }

  const upper = Array.from(characters[0].toUpperCase())[0];

  return upper + characters.slice(1).join("");
};

export const stripPrefixFromEntityName = (
  entityName: string,
  prefix: string,
): string => {
  const lowerName = entityName.toLowerCase();

  for (const suffix of stripSuffixes) {
    const prefixWithSuffix = prefix.toLowerCase() + suffix;

    if (!lowerName.startsWith(prefixWithSuffix)) {
      continue;
    }

    const newName = entityName.slice(prefixWithSuffix.length);

    if (newName === "") {
      continue;
    }

    // Keep the casing when the first word already has an upper-case letter,
    // for example a brand name.
    const space = newName.indexOf(" ");
    const firstWord = space >= 0 ? newName.slice(0, space) : "";

    return firstWord.toLowerCase() === firstWord
      ? capitalizeFirst(newName)
      : newName;
  }

  return "";
};

export interface EntityNameParts {
  // Undefined when the entity is named after its device.
  readonly entity: string | undefined;
  readonly device: string | undefined;
  readonly parentDevice: string | undefined;
}

// Like the frontend's computeEntityNameList with every part kept, so it
// ignores `next_name_part`. Undefined when the entity is not in the registry.
export const entityNameParts = (
  namer: EntityNamer | undefined,
  entityId: string,
): EntityNameParts | undefined => {
  const entry = namer?.entityNames.get(entityId);

  if (namer === undefined || entry === undefined) {
    return undefined;
  }

  const device = namer.deviceNames.get(entry.deviceId);

  if (device === undefined) {
    return {
      entity: entry.name || undefined,
      device: undefined,
      parentDevice: undefined,
    };
  }

  const parentId = namer.parentDeviceIds.get(entry.deviceId);

  const parentDevice =
    parentId === undefined ? undefined : namer.deviceNames.get(parentId);

  let entity: string | undefined = entry.name;

  if (entity === "" || entity === device) {
    entity = undefined;
  } else if (device !== "") {
    entity = stripPrefixFromEntityName(entity, device) || entity;
  }

  return {
    entity,
    device: device || undefined,
    parentDevice: parentDevice || undefined,
  };
};

// The name Home Assistant dashboards show by default: parent device, device
// and entity name.
export const displayName = (
  namer: EntityNamer | undefined,
  entityId: string,
  fallback: string,
): string => {
  const parts = entityNameParts(namer, entityId);

  if (parts === undefined) {
    return fallback;
  }

  return (
    [parts.parentDevice, parts.device, parts.entity]
      .filter((part) => part !== undefined)
      .join(separator) || fallback
  );
};
