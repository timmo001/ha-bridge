import type {
  AreaRegistry,
  DeviceRegistry,
  EntityNamer,
  EntityRegistryDisplay,
  FloorRegistry,
  LabelRegistry,
} from "@timmo001/effect-ha";

// The registries the bridge caches. Each is undefined until it loads, and
// keeps its last value when a refresh fails.
export interface Registries {
  readonly entities: typeof EntityRegistryDisplay.Type | undefined;
  readonly devices: typeof DeviceRegistry.Type | undefined;
  readonly areas: AreaRegistry | undefined;
  readonly floors: FloorRegistry | undefined;
  readonly labels: LabelRegistry | undefined;
  // Built from the entity and device registries when both are loaded.
  readonly namer: EntityNamer | undefined;
}

export const emptyRegistries: Registries = {
  entities: undefined,
  devices: undefined,
  areas: undefined,
  floors: undefined,
  labels: undefined,
  namer: undefined,
};

export const unavailableRegistries = (registries: Registries): Array<string> =>
  (
    [
      ["entity_registry", registries.entities],
      ["device_registry", registries.devices],
      ["area_registry", registries.areas],
      ["floor_registry", registries.floors],
      ["label_registry", registries.labels],
    ] as const
  ).flatMap(([name, value]) => (value === undefined ? [name] : []));
