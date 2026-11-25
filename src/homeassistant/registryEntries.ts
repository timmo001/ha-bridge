import {
  type AreaRegistryEntry,
  type Category,
  type DeviceRegistryEntry,
  deviceName,
  type EntityRegistryEntry,
  type Label,
} from "@timmo001/effect-ha";
import type { RegistryEntry } from "@timmo001/effect-ha-bridge";

// The names a registry entry shows for the IDs it holds.
export interface RegistryNames {
  readonly labels: ReadonlyMap<string, string>;
  readonly areas: ReadonlyMap<string, string>;
  // By scope, then category ID.
  readonly categories: ReadonlyMap<string, ReadonlyMap<string, string>>;
}

export const registryNames = (
  labels: ReadonlyArray<Label>,
  areas: ReadonlyArray<AreaRegistryEntry>,
  categories: ReadonlyArray<readonly [string, ReadonlyArray<Category>]>,
): RegistryNames => ({
  labels: new Map(labels.map(({ label_id, name }) => [label_id, name])),
  areas: new Map(areas.map(({ area_id, name }) => [area_id, name])),
  categories: new Map(
    categories.map(([scope, list]) => [
      scope,
      new Map(list.map(({ category_id, name }) => [category_id, name])),
    ]),
  ),
});

const labelsOf = (ids: ReadonlyArray<string>, names: RegistryNames) =>
  ids.map((label_id) => ({
    label_id,
    name: names.labels.get(label_id) ?? null,
  }));

const areaOf = (areaId: string | null | undefined, names: RegistryNames) =>
  areaId === null || areaId === undefined
    ? null
    : { area_id: areaId, name: names.areas.get(areaId) ?? null };

export const entityRegistryEntry = (
  entry: EntityRegistryEntry,
  names: RegistryNames,
): RegistryEntry => ({
  kind: "entity",
  id: entry.entity_id,
  name: entry.name ?? entry.original_name ?? null,
  area: areaOf(entry.area_id, names),
  device_id: entry.device_id ?? null,
  labels: labelsOf(entry.labels, names),
  categories: Object.entries(entry.categories).map(([scope, category_id]) => ({
    scope,
    category_id,
    name: names.categories.get(scope)?.get(category_id) ?? null,
  })),
});

export const deviceRegistryEntry = (
  device: DeviceRegistryEntry,
  names: RegistryNames,
): RegistryEntry => ({
  kind: "device",
  id: device.id,
  name: deviceName(device) || null,
  area: areaOf(device.area_id, names),
  labels: labelsOf(device.labels, names),
});

export const areaRegistryEntry = (
  area: AreaRegistryEntry,
  names: RegistryNames,
): RegistryEntry => ({
  kind: "area",
  id: area.area_id,
  name: area.name,
  labels: labelsOf(area.labels, names),
});

// The labels after the change: those kept in their order, then the added
// ones that weren't there.
export const nextLabels = (
  current: ReadonlyArray<string>,
  add: ReadonlyArray<string>,
  remove: ReadonlyArray<string>,
): ReadonlyArray<string> => {
  const removed = new Set(remove);

  return Array.from(
    new Set([...current.filter((id) => !removed.has(id)), ...add]),
  );
};

// Home Assistant keeps labels as a set, so order doesn't count.
export const sameLabels = (
  a: ReadonlyArray<string>,
  b: ReadonlyArray<string>,
) => {
  const set = new Set(a);

  return set.size === new Set(b).size && b.every((id) => set.has(id));
};

// The domains whose Home Assistant pages have their own category scope.
// Helpers share the helpers scope, and other entities have no page with
// categories.
const domainScopes = new Set(["automation", "script", "scene"]);

export const defaultCategoryScope = (entityId: string) => {
  const domain = entityId.split(".")[0] ?? "";

  return domainScopes.has(domain) ? domain : undefined;
};
