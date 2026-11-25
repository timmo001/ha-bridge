import { Context, Effect, Layer, Schema } from "effect";
import {
  AreaRegistryEntry,
  Category,
  DeviceRegistryEntry,
  deviceName,
  EntityRegistryEntry,
  HomeAssistantError,
  Label,
  type HomeAssistantCommand,
} from "@timmo001/effect-ha";
import {
  type CategoriesRequest,
  type CategoryRequest,
  type ChangeLabelsRequest,
  type CreateCategoryRequest,
  type CreateLabelRequest,
  type LabelRequest,
  type RegistryEntry,
  type RegistryItems,
  type SetCategoryRequest,
  type SetDeviceAreaRequest,
  TargetError,
  type UpdateCategoryRequest,
  type UpdateLabelRequest,
} from "@timmo001/effect-ha-bridge";
import { HomeAssistant } from "./HomeAssistant.js";
import {
  areaRegistryEntry,
  defaultCategoryScope,
  deviceRegistryEntry,
  entityRegistryEntry,
  nextLabels,
  registryNames,
  sameLabels,
} from "./registryEntries.js";
import { type Candidate, resolveCandidate } from "./target.js";

type RegistryFailure = HomeAssistantError | TargetError;

export interface RegistryService {
  readonly entries: (
    items: RegistryItems,
  ) => Effect.Effect<ReadonlyArray<RegistryEntry>, RegistryFailure>;
  readonly labels: Effect.Effect<ReadonlyArray<Label>, HomeAssistantError>;
  readonly createLabel: (
    request: CreateLabelRequest,
  ) => Effect.Effect<Label, HomeAssistantError>;
  readonly updateLabel: (
    request: UpdateLabelRequest,
  ) => Effect.Effect<Label, RegistryFailure>;
  readonly deleteLabel: (
    request: LabelRequest,
  ) => Effect.Effect<void, RegistryFailure>;
  readonly changeLabels: (
    request: ChangeLabelsRequest,
  ) => Effect.Effect<ReadonlyArray<RegistryEntry>, RegistryFailure>;
  readonly categories: (
    request: CategoriesRequest,
  ) => Effect.Effect<ReadonlyArray<Category>, HomeAssistantError>;
  readonly createCategory: (
    request: CreateCategoryRequest,
  ) => Effect.Effect<Category, HomeAssistantError>;
  readonly updateCategory: (
    request: UpdateCategoryRequest,
  ) => Effect.Effect<Category, RegistryFailure>;
  readonly deleteCategory: (
    request: CategoryRequest,
  ) => Effect.Effect<void, RegistryFailure>;
  readonly setCategory: (
    request: SetCategoryRequest,
  ) => Effect.Effect<ReadonlyArray<RegistryEntry>, RegistryFailure>;
  readonly setDeviceArea: (
    request: SetDeviceAreaRequest,
  ) => Effect.Effect<ReadonlyArray<RegistryEntry>, RegistryFailure>;
}

// Decodes a reply, failing as a Home Assistant error.
const decodeWith =
  <A>(
    decode: (value: Schema.Json | null) => Effect.Effect<A, Schema.SchemaError>,
    label: string,
  ) =>
  (value: Schema.Json | null) =>
    decode(value).pipe(
      Effect.mapError(
        (error) =>
          new HomeAssistantError({
            message: `decode ${label}: ${error.message}`,
          }),
      ),
    );

const decodeLabels = decodeWith(
  Schema.decodeUnknownEffect(Schema.Array(Label)),
  "labels",
);

const decodeLabel = decodeWith(Schema.decodeUnknownEffect(Label), "label");

const decodeCategories = decodeWith(
  Schema.decodeUnknownEffect(Schema.Array(Category)),
  "categories",
);

const decodeCategory = decodeWith(
  Schema.decodeUnknownEffect(Category),
  "category",
);

const decodeEntityEntries = decodeWith(
  Schema.decodeUnknownEffect(
    Schema.Record(Schema.String, Schema.NullOr(EntityRegistryEntry)),
  ),
  "entity registry entries",
);

const decodeEntityUpdate = decodeWith(
  Schema.decodeUnknownEffect(
    Schema.Struct({ entity_entry: EntityRegistryEntry }),
  ),
  "entity registry entry",
);

const decodeDevices = decodeWith(
  Schema.decodeUnknownEffect(Schema.Array(DeviceRegistryEntry)),
  "device registry",
);

const decodeDevice = decodeWith(
  Schema.decodeUnknownEffect(DeviceRegistryEntry),
  "device registry entry",
);

const decodeAreas = decodeWith(
  Schema.decodeUnknownEffect(Schema.Array(AreaRegistryEntry)),
  "area registry",
);

const decodeArea = decodeWith(
  Schema.decodeUnknownEffect(AreaRegistryEntry),
  "area registry entry",
);

const unique = (values: ReadonlyArray<string> | undefined) =>
  Array.from(new Set(values ?? []));

const labelCandidates = (labels: ReadonlyArray<Label>): Array<Candidate> =>
  labels.map(({ label_id, name }) => ({ id: label_id, name }));

const areaCandidates = (
  areas: ReadonlyArray<AreaRegistryEntry>,
): Array<Candidate> =>
  areas.map(({ area_id, name }) => ({ id: area_id, name }));

const categoryCandidates = (
  categories: ReadonlyArray<Category>,
): Array<Candidate> =>
  categories.map(({ category_id, name }) => ({ id: category_id, name }));

const resolveEach = (
  kind: string,
  values: ReadonlyArray<string>,
  candidates: ReadonlyArray<Candidate>,
) =>
  Effect.forEach(unique(values), (value) =>
    resolveCandidate(kind, value, candidates),
  );

// Labels, categories and device areas, read and written through Home
// Assistant's registries as its settings pages do. Every read asks Home
// Assistant rather than the bridge's cache, so a change made a moment ago
// is never lost.
export class Registry extends Context.Service<Registry, RegistryService>()(
  "Registry",
) {
  static readonly layer = Layer.effect(
    Registry,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;

      const send = (command: HomeAssistantCommand) =>
        Effect.flatMap(homeAssistant.session, (current) =>
          current.request(command),
        );

      // Home Assistant refuses every registry write from anyone else, only
      // saying "Unauthorized", so check first.
      const requireAdmin = (what: string) =>
        Effect.gen(function* () {
          const user = yield* homeAssistant.currentUser;

          if (!user.is_admin) {
            return yield* new HomeAssistantError({
              message: `${what} needs an admin user, and the bridge's token belongs to ${user.name ?? user.id}, who isn't one`,
            });
          }
        });

      const labels = send({ type: "config/label_registry/list" }).pipe(
        Effect.flatMap(decodeLabels),
        Effect.map((list) =>
          list.toSorted((a, b) => a.name.localeCompare(b.name)),
        ),
      );

      const areaList = send({ type: "config/area_registry/list" }).pipe(
        Effect.flatMap(decodeAreas),
      );

      const deviceList = send({ type: "config/device_registry/list" }).pipe(
        Effect.flatMap(decodeDevices),
      );

      const categoryList = (scope: string) =>
        send({ type: "config/category_registry/list", scope }).pipe(
          Effect.flatMap(decodeCategories),
        );

      const categories = Effect.fn("Registry.categories")(function* (
        request: CategoriesRequest,
      ) {
        return (yield* categoryList(request.scope)).toSorted((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      // The entities' registry entries, in the order asked. Fails for any
      // Home Assistant doesn't have.
      const entityEntries = Effect.fn("Registry.entityEntries")(function* (
        entityIds: ReadonlyArray<string>,
      ) {
        if (entityIds.length === 0) {
          return [];
        }

        const found = yield* send({
          type: "config/entity_registry/get_entries",
          entity_ids: entityIds,
        }).pipe(Effect.flatMap(decodeEntityEntries));

        const missing = entityIds.filter((id) => found[id] == null);

        if (missing.length > 0) {
          return yield* new TargetError({
            message: `Home Assistant has no registry entry for ${missing.join(", ")}`,
          });
        }

        return entityIds.flatMap((id) => {
          const entry = found[id];

          return entry == null ? [] : [entry];
        });
      });

      const pick = <A>(
        items: ReadonlyArray<A>,
        idOf: (item: A) => string,
        ids: ReadonlyArray<string>,
      ) =>
        ids.flatMap((id) => {
          const item = items.find((candidate) => idOf(candidate) === id);

          return item === undefined ? [] : [item];
        });

      const deviceEntries = Effect.fn("Registry.deviceEntries")(function* (
        values: ReadonlyArray<string>,
      ) {
        if (values.length === 0) {
          return [];
        }

        const devices = yield* deviceList;

        const ids = yield* resolveEach(
          "device",
          values,
          devices.map((device) => ({
            id: device.id,
            name: deviceName(device),
          })),
        );

        return pick(devices, (device) => device.id, unique(ids));
      });

      const areaEntries = (
        areas: ReadonlyArray<AreaRegistryEntry>,
        values: ReadonlyArray<string>,
      ) =>
        Effect.map(resolveEach("area", values, areaCandidates(areas)), (ids) =>
          pick(areas, (area) => area.area_id, unique(ids)),
        );

      // Each item with the names of its labels, categories and area.
      const describe = Effect.fn("Registry.describe")(function* (
        items: {
          readonly entities: ReadonlyArray<EntityRegistryEntry>;
          readonly devices: ReadonlyArray<DeviceRegistryEntry>;
          readonly areas: ReadonlyArray<AreaRegistryEntry>;
        },
        known: {
          readonly labels: ReadonlyArray<Label>;
          readonly areas: ReadonlyArray<AreaRegistryEntry>;
        },
      ) {
        const scopes = unique(
          items.entities.flatMap((entry) => Object.keys(entry.categories)),
        );

        const scoped = yield* Effect.forEach(
          scopes,
          (scope) =>
            Effect.map(categoryList(scope), (list) => [scope, list] as const),
          { concurrency: "unbounded" },
        );

        const names = registryNames(known.labels, known.areas, scoped);

        return [
          ...items.entities.map((entry) => entityRegistryEntry(entry, names)),
          ...items.devices.map((device) => deviceRegistryEntry(device, names)),
          ...items.areas.map((area) => areaRegistryEntry(area, names)),
        ];
      });

      const lookups = Effect.all(
        { labels, areas: areaList },
        { concurrency: "unbounded" },
      );

      const readItems = Effect.fn("Registry.readItems")(function* (
        items: RegistryItems,
        areas: ReadonlyArray<AreaRegistryEntry>,
      ) {
        const entityIds = unique(items.entity_id);
        const deviceValues = unique(items.device_id);
        const areaValues = unique(items.area_id);

        if (entityIds.length + deviceValues.length + areaValues.length === 0) {
          return yield* new TargetError({
            message: "give at least one entity, device or area",
          });
        }

        return yield* Effect.all(
          {
            entities: entityEntries(entityIds),
            devices: deviceEntries(deviceValues),
            areas: areaEntries(areas, areaValues),
          },
          { concurrency: "unbounded" },
        );
      });

      const entries = Effect.fn("Registry.entries")(function* (
        items: RegistryItems,
      ) {
        const known = yield* lookups;

        return yield* describe(yield* readItems(items, known.areas), known);
      });

      const updateEntity = (
        command: Omit<
          Extract<
            HomeAssistantCommand,
            { readonly type: "config/entity_registry/update" }
          >,
          "type"
        >,
      ) =>
        send({ type: "config/entity_registry/update", ...command }).pipe(
          Effect.flatMap(decodeEntityUpdate),
          Effect.map(({ entity_entry }) => entity_entry),
        );

      const updateDevice = (
        command: Omit<
          Extract<
            HomeAssistantCommand,
            { readonly type: "config/device_registry/update" }
          >,
          "type"
        >,
      ) =>
        send({ type: "config/device_registry/update", ...command }).pipe(
          Effect.flatMap(decodeDevice),
        );

      const updateArea = (areaId: string, labels: ReadonlyArray<string>) =>
        send({
          type: "config/area_registry/update",
          area_id: areaId,
          labels,
        }).pipe(Effect.flatMap(decodeArea));

      const findLabel = (label: string) =>
        Effect.flatMap(labels, (list) =>
          resolveCandidate("label", label, labelCandidates(list)),
        );

      const createLabel = Effect.fn("Registry.createLabel")(function* (
        request: CreateLabelRequest,
      ) {
        yield* requireAdmin("Creating a label");

        return yield* send({
          type: "config/label_registry/create",
          ...request,
        }).pipe(Effect.flatMap(decodeLabel));
      });

      const updateLabel = Effect.fn("Registry.updateLabel")(function* ({
        label,
        ...fields
      }: UpdateLabelRequest) {
        yield* requireAdmin("Changing a label");
        const labelId = yield* findLabel(label);

        return yield* send({
          type: "config/label_registry/update",
          label_id: labelId,
          ...fields,
        }).pipe(Effect.flatMap(decodeLabel));
      });

      const deleteLabel = Effect.fn("Registry.deleteLabel")(function* (
        request: LabelRequest,
      ) {
        yield* requireAdmin("Deleting a label");
        const labelId = yield* findLabel(request.label);

        yield* send({
          type: "config/label_registry/delete",
          label_id: labelId,
        });
      });

      // Reads each item's labels first, so only the labels named change, and
      // leaves items that already have them alone.
      const changeLabels = Effect.fn("Registry.changeLabels")(function* (
        request: ChangeLabelsRequest,
      ) {
        if ((request.add ?? []).length + (request.remove ?? []).length === 0) {
          return yield* new HomeAssistantError({
            message: "give at least one label to add or remove",
          });
        }

        yield* requireAdmin("Changing labels");
        const known = yield* lookups;
        const candidates = labelCandidates(known.labels);
        const add = yield* resolveEach("label", request.add ?? [], candidates);

        const remove = yield* resolveEach(
          "label",
          request.remove ?? [],
          candidates,
        );

        const both = add.filter((id) => remove.includes(id));

        if (both.length > 0) {
          return yield* new HomeAssistantError({
            message: `${both.join(", ")} can't be both added and removed`,
          });
        }

        const items = yield* readItems(request, known.areas);

        const changed = <A extends { readonly labels: ReadonlyArray<string> }>(
          item: A,
          update: (
            labels: ReadonlyArray<string>,
          ) => Effect.Effect<A, HomeAssistantError>,
        ) => {
          const next = nextLabels(item.labels, add, remove);

          return sameLabels(item.labels, next)
            ? Effect.succeed(item)
            : update(next);
        };

        const updated = {
          entities: yield* Effect.forEach(items.entities, (entry) =>
            changed(entry, (next) =>
              updateEntity({ entity_id: entry.entity_id, labels: next }),
            ),
          ),
          devices: yield* Effect.forEach(items.devices, (device) =>
            changed(device, (next) =>
              updateDevice({ device_id: device.id, labels: next }),
            ),
          ),
          areas: yield* Effect.forEach(items.areas, (area) =>
            changed(area, (next) => updateArea(area.area_id, next)),
          ),
        };

        return yield* describe(updated, known);
      });

      const findCategory = (scope: string, category: string) =>
        Effect.flatMap(categoryList(scope), (list) =>
          resolveCandidate(
            `${scope} category`,
            category,
            categoryCandidates(list),
          ),
        );

      const createCategory = Effect.fn("Registry.createCategory")(function* (
        request: CreateCategoryRequest,
      ) {
        yield* requireAdmin("Creating a category");

        return yield* send({
          type: "config/category_registry/create",
          ...request,
        }).pipe(Effect.flatMap(decodeCategory));
      });

      const updateCategory = Effect.fn("Registry.updateCategory")(function* ({
        category,
        ...fields
      }: UpdateCategoryRequest) {
        yield* requireAdmin("Changing a category");
        const categoryId = yield* findCategory(fields.scope, category);

        return yield* send({
          type: "config/category_registry/update",
          category_id: categoryId,
          ...fields,
        }).pipe(Effect.flatMap(decodeCategory));
      });

      const deleteCategory = Effect.fn("Registry.deleteCategory")(function* (
        request: CategoryRequest,
      ) {
        yield* requireAdmin("Deleting a category");

        const categoryId = yield* findCategory(request.scope, request.category);

        yield* send({
          type: "config/category_registry/delete",
          scope: request.scope,
          category_id: categoryId,
        });
      });

      // Only the one scope changes, so each entity keeps its categories in
      // the others.
      const setCategory = Effect.fn("Registry.setCategory")(function* (
        request: SetCategoryRequest,
      ) {
        const entityIds = unique(request.entity_id);

        if (entityIds.length === 0) {
          return yield* new TargetError({
            message: "give at least one entity",
          });
        }

        const unscoped = entityIds.filter(
          (id) =>
            request.scope === undefined &&
            defaultCategoryScope(id) === undefined,
        );

        if (unscoped.length > 0) {
          return yield* new HomeAssistantError({
            message: `give a scope, such as helpers, for ${unscoped.join(", ")}; only automations, scripts and scenes have their own`,
          });
        }

        yield* requireAdmin("Changing categories");
        const known = yield* lookups;
        const current = yield* entityEntries(entityIds);

        const scopeOf = (entityId: string) =>
          request.scope ?? defaultCategoryScope(entityId) ?? "";

        const category = request.category;

        const categoryIds = new Map(
          yield* Effect.forEach(unique(entityIds.map(scopeOf)), (scope) =>
            Effect.map(
              category === null
                ? Effect.succeed(null)
                : findCategory(scope, category),
              (id) => [scope, id] as const,
            ),
          ),
        );

        const updated = yield* Effect.forEach(current, (entry) => {
          const scope = scopeOf(entry.entity_id);
          const categoryId = categoryIds.get(scope) ?? null;

          return (entry.categories[scope] ?? null) === categoryId
            ? Effect.succeed(entry)
            : updateEntity({
                entity_id: entry.entity_id,
                categories: { [scope]: categoryId },
              });
        });

        return yield* describe(
          { entities: updated, devices: [], areas: [] },
          known,
        );
      });

      const setDeviceArea = Effect.fn("Registry.setDeviceArea")(function* (
        request: SetDeviceAreaRequest,
      ) {
        if (unique(request.device_id).length === 0) {
          return yield* new TargetError({
            message: "give at least one device",
          });
        }

        yield* requireAdmin("Moving devices");
        const known = yield* lookups;

        const areaId =
          request.area === null
            ? null
            : yield* resolveCandidate(
                "area",
                request.area,
                areaCandidates(known.areas),
              );

        const devices = yield* deviceEntries(request.device_id);

        const updated = yield* Effect.forEach(devices, (device) =>
          (device.area_id ?? null) === areaId
            ? Effect.succeed(device)
            : updateDevice({ device_id: device.id, area_id: areaId }),
        );

        return yield* describe(
          { entities: [], devices: updated, areas: [] },
          known,
        );
      });

      return Registry.of({
        entries,
        labels,
        createLabel,
        updateLabel,
        deleteLabel,
        changeLabels,
        categories,
        createCategory,
        updateCategory,
        deleteCategory,
        setCategory,
        setDeviceArea,
      });
    }),
  );
}
