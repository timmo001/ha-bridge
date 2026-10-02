import { Predicate, Schema } from "effect";
import {
  numberAttribute,
  stateWithUnit,
  stringAttribute,
  type EntityState,
} from "@timmo001/effect-ha";
import type { SearchMatch } from "@timmo001/effect-ha-bridge";
import type { CommandMatch } from "../search/commands.js";

export interface EntityBarOptions {
  readonly icon: string;
  readonly text: string;
  readonly textOn: string;
  readonly textOff: string;
  readonly tooltip: string;
  readonly tooltipOn: string;
  readonly tooltipOff: string;
  readonly className: string;
  readonly classOn: string;
  readonly classOff: string;
  readonly onStates: ReadonlyArray<string>;
}

interface BarPayload {
  readonly text: string;
  readonly tooltip: string;
  readonly className: string;
  readonly name: string;
}

// Keys stay in the order Go Automate's sorted map output used, so bar
// consumers see the same lines.
export const encodeBar = ({ text, tooltip, className, name }: BarPayload) =>
  JSON.stringify(
    name === ""
      ? { class: className, text, tooltip }
      : { class: className, name, text, tooltip },
  );

const appendBarText = (baseText: string, label: string) => {
  if (label === "") {
    return baseText;
  }

  return baseText === "" ? label : `${baseText} ${label}`;
};

// Field paths and templates read the state plus these derived values.
const fieldSource = (state: EntityState, name: string): Schema.Json => ({
  ...state,
  name,
  unit: stringAttribute(state, "unit_of_measurement") ?? "",
  state_with_unit: stateWithUnit(state),
});

const isJsonArray = Schema.is(Schema.Array(Schema.Json));

const isJsonObject = Schema.is(Schema.Record(Schema.String, Schema.Json));

const fieldStep = (
  value: Schema.Json | undefined,
  key: string,
): Schema.Json | undefined => {
  if (isJsonArray(value)) {
    return /^\d+$/.test(key) ? value[Number(key)] : undefined;
  }

  return isJsonObject(value) && Object.hasOwn(value, key)
    ? value[key]
    : undefined;
};

// Dotted path such as attributes.hs_color.0; number parts index lists.
const fieldValue = (source: Schema.Json, path: string) =>
  path.split(".").reduce(fieldStep, source);

const fieldText = (value: Schema.Json | undefined) =>
  Predicate.isString(value)
    ? value
    : Predicate.isNullish(value)
      ? ""
      : JSON.stringify(value);

const renderTemplate = (template: string, source: Schema.Json) =>
  template.replaceAll(/\{([^{}]+)\}/g, (_, path: string) =>
    fieldText(fieldValue(source, path)),
  );

// One field's raw text, with objects and lists as JSON.
export const entityField = (state: EntityState, name: string, path: string) =>
  fieldText(fieldValue(fieldSource(state, name), path));

// Every requested path, with null for missing ones so each key is present.
export const entityFieldValues = (
  state: EntityState,
  name: string,
  paths: ReadonlyArray<string>,
): Record<string, Schema.Json> => {
  const source = fieldSource(state, name);

  return Object.fromEntries(
    paths.map((path) => [path, fieldValue(source, path) ?? null]),
  );
};

// A set flag wins even when its template renders empty.
export const entityBar = (
  state: EntityState,
  name: string,
  options: EntityBarOptions,
) => {
  const source = fieldSource(state, name);
  const render = (template: string) => renderTemplate(template, source);

  const pick = (template: string, fallback: string) =>
    template === "" ? fallback : render(template);

  const on = (
    options.onStates.length === 0 ? ["on"] : options.onStates
  ).includes(state.state);

  const text = appendBarText(
    pick(options.icon || options.text, stateWithUnit(state)),
    render(on ? options.textOn : options.textOff),
  );

  return encodeBar({
    text,
    tooltip: pick(
      (on ? options.tooltipOn : options.tooltipOff) || options.tooltip,
      stateWithUnit(state),
    ),
    className: pick(
      (on ? options.classOn : options.classOff) || options.className,
      state.state,
    ),
    name,
  });
};

const fanModeLabels = new Map([
  ["1", "Low"],
  ["2", "High"],
]);

export const climateStateText = (state: EntityState) => {
  if (state.state === "unavailable") {
    return "unavailable";
  }

  const parts = [state.state === "cool" ? "Cool" : state.state];
  const fanMode = stringAttribute(state, "fan_mode") ?? "";
  const fanLabel = fanModeLabels.get(fanMode) ?? fanMode;

  if (fanLabel !== "") {
    parts.push(fanLabel);
  }

  const temperature = numberAttribute(state, "temperature");

  if (temperature !== undefined) {
    parts.push(`${temperature} °C`);
  }

  return parts.join(" • ");
};

export const coverStateText = (state: EntityState) => {
  if (state.state === "unavailable") {
    return "unavailable";
  }

  const tiltPosition = numberAttribute(state, "current_tilt_position");

  return tiltPosition === undefined
    ? state.state
    : `${state.state} • ${tiltPosition}%`;
};

export const stateTextBar = (
  state: EntityState,
  name: string,
  toText: (state: EntityState) => string,
) => {
  const text = toText(state);

  return encodeBar({ text, tooltip: text, className: state.state, name });
};

// Tab-separated kind, ID, name and context, one result per line.
export const searchLine = (result: SearchMatch | CommandMatch) => {
  const columns =
    result.kind === "command"
      ? [
          `ha-bridge ${result.id}`,
          result.description,
          result.alias === undefined ? "" : `ha-bridge ${result.alias}`,
        ]
      : [
          result.id,
          result.name,
          [
            result.kind === "device" ? result.parentDevice : undefined,
            result.area,
            result.floor,
          ]
            .filter((part) => part !== undefined)
            .join(", "),
        ];

  return [result.kind, ...columns].join("\t").trimEnd();
};
