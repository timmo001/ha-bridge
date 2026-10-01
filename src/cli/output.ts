import {
  numberAttribute,
  stateWithUnit,
  stringAttribute,
  type EntityState,
} from "@timmo001/effect-ha-bridge";

export interface EntityBarOptions {
  readonly icon: string;
  readonly textOn: string;
  readonly textOff: string;
  readonly tooltipOn: string;
  readonly tooltipOff: string;
  readonly classOn: string;
  readonly classOff: string;
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

export const entityBar = (
  state: EntityState,
  name: string,
  options: EntityBarOptions,
) => {
  const on = state.state === "on";

  const text = appendBarText(
    options.icon || stateWithUnit(state),
    on ? options.textOn : options.textOff,
  );

  return encodeBar({
    text,
    tooltip:
      (on ? options.tooltipOn : options.tooltipOff) || stateWithUnit(state),
    className: (on ? options.classOn : options.classOff) || state.state,
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
