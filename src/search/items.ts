import {
  deviceName,
  displayName,
  entityNameParts,
  friendlyName,
  stringAttribute,
  type EntityState,
} from "@timmo001/effect-ha";
import type {
  SearchKind,
  SearchMatch,
  SearchRequest,
} from "@timmo001/effect-ha-bridge";
import type { Registries } from "../homeassistant/registries.js";
import type { SearchKey } from "./Search.js";

export interface SearchItem {
  readonly kind: SearchKind;
  readonly id: string;
  // The name shown in results.
  readonly name: string;
  // The item's own name, searched with the highest weight.
  readonly ownName: string;
  readonly friendlyName?: string;
  readonly domain?: string;
  readonly deviceClass?: string;
  readonly device?: string;
  readonly parentDevice?: string;
  readonly areaId?: string;
  readonly area?: string;
  readonly floor?: string;
  // Domains and device classes of the item's entities, for filters.
  readonly domains: ReadonlySet<string>;
  readonly deviceClasses: ReadonlySet<string>;
}

type ItemKey = SearchKey<SearchItem>;

const nameKey: ItemKey = {
  name: "name",
  weight: 10,
  getFn: (item) => item.ownName,
};

// Each kind is searched on its own, as the frontend's quick bar does, so an
// area with few fields still ranks against entities with many. Weights follow
// the frontend's entity, device and area pickers.
export const searchKeys: Record<SearchKind, ReadonlyArray<ItemKey>> = {
  entity: [
    nameKey,
    { name: "friendly_name", weight: 8, getFn: (item) => item.friendlyName },
    { name: "device", weight: 7, getFn: (item) => item.device },
    { name: "parent_device", weight: 6, getFn: (item) => item.parentDevice },
    { name: "area", weight: 6, getFn: (item) => item.area },
    { name: "domain", weight: 6, getFn: (item) => item.domain },
    { name: "floor", weight: 3, getFn: (item) => item.floor },
    { name: "id", weight: 3, getFn: (item) => item.id },
  ],
  device: [
    nameKey,
    { name: "area", weight: 8, getFn: (item) => item.area },
    { name: "domain", weight: 4, getFn: (item) => [...item.domains] },
    { name: "parent_device", weight: 3, getFn: (item) => item.parentDevice },
    { name: "floor", weight: 3, getFn: (item) => item.floor },
  ],
  area: [
    nameKey,
    { name: "floor", weight: 6, getFn: (item) => item.floor },
    { name: "id", weight: 2, getFn: (item) => item.id },
  ],
};

const domainOf = (entityId: string) => entityId.slice(0, entityId.indexOf("."));

const addTo = (
  map: Map<string, Set<string>>,
  key: string | undefined,
  value: string | undefined,
) => {
  if (key === undefined || value === undefined) {
    return;
  }

  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
};

const none: ReadonlySet<string> = new Set();

export const searchItems = (
  states: Iterable<EntityState>,
  registries: Registries,
): Array<SearchItem> => {
  const devices = new Map(
    (registries.devices ?? []).map((device) => [device.id, device]),
  );

  const areas = new Map(
    (registries.areas ?? []).map((area) => [area.area_id, area]),
  );

  const floors = new Map(
    (registries.floors ?? []).map((floor) => [floor.floor_id, floor.name]),
  );

  const entries = new Map(
    (registries.entities?.entities ?? []).map((entry) => [entry.ei, entry]),
  );

  // A child device without its own area is in its parent's area.
  const deviceAreaId = (id: string | undefined) => {
    const device = id === undefined ? undefined : devices.get(id);

    if (device === undefined) {
      return undefined;
    }

    if (device.area_id) {
      return device.area_id;
    }

    return device.parent_device_id
      ? devices.get(device.parent_device_id)?.area_id || undefined
      : undefined;
  };

  const areaContext = (areaId: string | undefined) => {
    const area = areaId === undefined ? undefined : areas.get(areaId);

    return {
      areaId: area?.area_id,
      area: area?.name,
      floor: area?.floor_id ? floors.get(area.floor_id) : undefined,
    };
  };

  const deviceDomains = new Map<string, Set<string>>();
  const deviceClasses = new Map<string, Set<string>>();
  const areaDomains = new Map<string, Set<string>>();
  const areaClasses = new Map<string, Set<string>>();
  const deviceFallbackNames = new Map<string, string>();

  const entities = Array.from(states, (state): SearchItem => {
    const entry = entries.get(state.entity_id);
    const deviceId = entry?.di || undefined;
    const domain = domainOf(state.entity_id);
    const deviceClass = stringAttribute(state, "device_class");
    const friendly = friendlyName(state);
    const parts = entityNameParts(registries.namer, state.entity_id);
    const context = areaContext(entry?.ai || deviceAreaId(deviceId));

    addTo(deviceDomains, deviceId, domain);
    addTo(deviceClasses, deviceId, deviceClass);
    addTo(areaDomains, context.areaId, domain);
    addTo(areaClasses, context.areaId, deviceClass);

    if (deviceId !== undefined && friendly !== "") {
      deviceFallbackNames.set(
        deviceId,
        deviceFallbackNames.get(deviceId) ?? friendly,
      );
    }

    return {
      kind: "entity",
      id: state.entity_id,
      name: displayName(
        registries.namer,
        state.entity_id,
        friendly || state.entity_id,
      ),
      ownName: parts?.entity ?? parts?.device ?? friendly,
      friendlyName: friendly || undefined,
      domain,
      deviceClass,
      device: parts?.device,
      parentDevice: parts?.parentDevice,
      ...context,
      domains: new Set([domain]),
      deviceClasses: new Set(deviceClass === undefined ? [] : [deviceClass]),
    };
  });

  const deviceItems = (registries.devices ?? [])
    .filter((device) => !device.disabled_by)
    .map((device): SearchItem => {
      const name =
        deviceName(device) ||
        deviceFallbackNames.get(device.id) ||
        "Unnamed device";

      const parent = device.parent_device_id
        ? devices.get(device.parent_device_id)
        : undefined;

      return {
        kind: "device",
        id: device.id,
        name,
        ownName: name,
        parentDevice: parent === undefined ? undefined : deviceName(parent),
        ...areaContext(deviceAreaId(device.id)),
        domains: deviceDomains.get(device.id) ?? none,
        deviceClasses: deviceClasses.get(device.id) ?? none,
      };
    });

  const areaItems = (registries.areas ?? []).map((area): SearchItem => ({
    kind: "area",
    id: area.area_id,
    name: area.name,
    ownName: area.name,
    ...areaContext(area.area_id),
    // The area's own name is already searched as its name.
    area: undefined,
    domains: areaDomains.get(area.area_id) ?? none,
    deviceClasses: areaClasses.get(area.area_id) ?? none,
  }));

  return [...entities, ...deviceItems, ...areaItems];
};

const normalise = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export const matchesFilters =
  (request: SearchRequest) =>
  (item: SearchItem): boolean => {
    if (request.kinds !== undefined && !request.kinds.includes(item.kind)) {
      return false;
    }

    if (request.domain !== undefined && !item.domains.has(request.domain)) {
      return false;
    }

    if (
      request.deviceClass !== undefined &&
      !item.deviceClasses.has(request.deviceClass)
    ) {
      return false;
    }

    if (request.area !== undefined) {
      const area = normalise(request.area);

      return (
        item.areaId === request.area ||
        (item.area !== undefined && normalise(item.area) === area) ||
        (item.kind === "area" && normalise(item.name) === area)
      );
    }

    return true;
  };

export const toSearchMatch = (
  item: SearchItem,
  score: number,
  matched: ReadonlyArray<string>,
): SearchMatch => ({
  kind: item.kind,
  id: item.id,
  name: item.name,
  score,
  matched: [...matched],
  domain: item.domain,
  deviceClass: item.deviceClass,
  device: item.device,
  parentDevice: item.parentDevice,
  area: item.area,
  floor: item.floor,
});
