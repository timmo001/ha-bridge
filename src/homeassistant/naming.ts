import { Schema } from "effect";

// Mirrors the Home Assistant frontend computeEntityName / formatEntityName
// model from the entity naming migration (home-assistant/epics#44).
const separator = " ";

const stripSuffixes = [" ", ": ", " - "];

const OptionalString = Schema.optionalKey(Schema.NullOr(Schema.String));

export const EntityRegistryDisplay = Schema.Struct({
  entities: Schema.Array(
    Schema.Struct({
      ei: Schema.String,
      di: OptionalString,
      en: OptionalString,
    }),
  ),
});

export const DeviceRegistry = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: OptionalString,
    name_by_user: OptionalString,
  }),
);

export interface EntityNamer {
  readonly entityNames: ReadonlyMap<
    string,
    { readonly deviceId: string; readonly name: string }
  >;
  readonly deviceNames: ReadonlyMap<string, string>;
}

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
    devices.map((device) => [
      device.id,
      device.name_by_user?.trim() || device.name?.trim() || "",
    ]),
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

export const displayName = (
  namer: EntityNamer | undefined,
  entityId: string,
  fallback: string,
): string => {
  const entry = namer?.entityNames.get(entityId);

  if (namer === undefined || entry === undefined) {
    return fallback;
  }

  const deviceName = namer.deviceNames.get(entry.deviceId);

  if (deviceName === undefined) {
    return entry.name || fallback;
  }

  let entityName = entry.name;

  if (deviceName === entityName) {
    entityName = "";
  } else if (deviceName !== "" && entityName !== "") {
    entityName =
      stripPrefixFromEntityName(entityName, deviceName) || entityName;
  }

  return (
    [deviceName, entityName].filter((part) => part !== "").join(separator) ||
    fallback
  );
};
