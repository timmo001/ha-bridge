import { Schema } from "effect";

const Ids = Schema.Array(Schema.String);

// Registry items by kind. Entities take entity IDs; devices and areas take
// IDs or names. Nothing is expanded, so an area is the area itself, not
// what's in it.
export const RegistryItems = Schema.Struct({
  entity_id: Schema.optional(Ids),
  device_id: Schema.optional(Ids),
  area_id: Schema.optional(Ids),
});

export type RegistryItems = typeof RegistryItems.Type;

export const RegistryKind = Schema.Literals(["entity", "device", "area"]);

export type RegistryKind = typeof RegistryKind.Type;

// The labels, categories and area of an entity, device or area, with their
// names.
export const RegistryEntry = Schema.Struct({
  kind: RegistryKind,
  id: Schema.String,
  // The name set in Home Assistant, else the integration's; null when it
  // has neither.
  name: Schema.NullOr(Schema.String),
  // An entity's own area or a device's, null without one. An entity
  // without one follows its device's. Left out for areas.
  area: Schema.optionalKey(
    Schema.NullOr(
      Schema.Struct({
        area_id: Schema.String,
        name: Schema.NullOr(Schema.String),
      }),
    ),
  ),
  // An entity's device, null without one. Only for entities.
  device_id: Schema.optionalKey(Schema.NullOr(Schema.String)),
  labels: Schema.Array(
    Schema.Struct({
      label_id: Schema.String,
      name: Schema.NullOr(Schema.String),
    }),
  ),
  // The entity's category in each scope, such as automation. Only for
  // entities.
  categories: Schema.optionalKey(
    Schema.Array(
      Schema.Struct({
        scope: Schema.String,
        category_id: Schema.String,
        name: Schema.NullOr(Schema.String),
      }),
    ),
  ),
});

export type RegistryEntry = typeof RegistryEntry.Type;

// A label by ID or name.
export const LabelRequest = Schema.Struct({ label: Schema.String });

export type LabelRequest = typeof LabelRequest.Type;

// `color` is a theme colour, such as indigo, or a hex colour such as
// #ff0000. null clears a field.
const labelFields = {
  icon: Schema.optional(Schema.NullOr(Schema.String)),
  color: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
};

export const CreateLabelRequest = Schema.Struct({
  name: Schema.String,
  ...labelFields,
});

export type CreateLabelRequest = typeof CreateLabelRequest.Type;

// Changes only the fields it names.
export const UpdateLabelRequest = Schema.Struct({
  label: Schema.String,
  name: Schema.optional(Schema.String),
  ...labelFields,
});

export type UpdateLabelRequest = typeof UpdateLabelRequest.Type;

// Adds and removes labels, by ID or name, keeping the items' other labels.
export const ChangeLabelsRequest = Schema.Struct({
  ...RegistryItems.fields,
  add: Schema.optional(Ids),
  remove: Schema.optional(Ids),
});

export type ChangeLabelsRequest = typeof ChangeLabelsRequest.Type;

// A scope's categories: automation, script, scene or helpers in Home
// Assistant's own pages.
export const CategoriesRequest = Schema.Struct({ scope: Schema.String });

export type CategoriesRequest = typeof CategoriesRequest.Type;

// A category by ID or name, within its scope.
export const CategoryRequest = Schema.Struct({
  scope: Schema.String,
  category: Schema.String,
});

export type CategoryRequest = typeof CategoryRequest.Type;

export const CreateCategoryRequest = Schema.Struct({
  scope: Schema.String,
  name: Schema.String,
  icon: Schema.optional(Schema.NullOr(Schema.String)),
});

export type CreateCategoryRequest = typeof CreateCategoryRequest.Type;

// Changes only the fields it names; null clears the icon.
export const UpdateCategoryRequest = Schema.Struct({
  ...CategoryRequest.fields,
  name: Schema.optional(Schema.String),
  icon: Schema.optional(Schema.NullOr(Schema.String)),
});

export type UpdateCategoryRequest = typeof UpdateCategoryRequest.Type;

// Puts entities in a category, by ID or name, or takes them out of their
// category with null. Each entity keeps its categories in other scopes.
// The scope defaults to the entity's domain for automations, scripts and
// scenes; other entities, such as helpers, need it.
export const SetCategoryRequest = Schema.Struct({
  entity_id: Ids,
  scope: Schema.optional(Schema.String),
  category: Schema.NullOr(Schema.String),
});

export type SetCategoryRequest = typeof SetCategoryRequest.Type;

// Moves devices, by ID or name, to an area by ID or name, or out of their
// area with null.
export const SetDeviceAreaRequest = Schema.Struct({
  device_id: Ids,
  area: Schema.NullOr(Schema.String),
});

export type SetDeviceAreaRequest = typeof SetDeviceAreaRequest.Type;
