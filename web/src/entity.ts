import type { Action } from "@timmo001/effect-ha";
import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import { Predicate } from "effect";

export type EntityState = EntityUpdate["state"];

export const domainOf = (entityId: string) => entityId.split(".")[0] ?? "";

export const attribute = (state: EntityState, name: string) =>
  state.attributes?.[name];

export const stringAttribute = (state: EntityState, name: string) => {
  const value = attribute(state, name);

  return Predicate.isString(value) ? value : undefined;
};

export const numberAttribute = (state: EntityState, name: string) => {
  const value = attribute(state, name);

  return Predicate.isNumber(value) && Number.isFinite(value)
    ? value
    : undefined;
};

export const isUnavailable = (state: EntityState) =>
  state.state === "unavailable" || state.state === "unknown";

// States that light a tile up: something is on, open, playing or alerting.
const activeStates = new Set([
  "on",
  "open",
  "opening",
  "closing",
  "unlocked",
  "unlocking",
  "playing",
  "home",
  "heat",
  "cool",
  "heat_cool",
  "auto",
  "dry",
  "fan_only",
  "cleaning",
  "mowing",
  "triggered",
  "pending",
  "arming",
  "active",
]);

export const isActive = (state: EntityState) => activeStates.has(state.state);

// Domains whose entities turn on and off with homeassistant.toggle.
const toggleDomains = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "automation",
  "script",
  "siren",
  "humidifier",
  "media_player",
  "cover",
  "lock",
  "valve",
  "group",
  "climate",
  "vacuum",
]);

const pressDomains = new Set(["button", "input_button", "scene"]);

export const canToggle = (entityId: string) =>
  toggleDomains.has(domainOf(entityId)) || pressDomains.has(domainOf(entityId));

// What tapping a toggleable tile calls.
export const toggleAction = (state: EntityState): Action | undefined => {
  const domain = domainOf(state.entity_id);
  const target = { entity_id: state.entity_id };

  switch (domain) {
    case "button":
    case "input_button":
      return { action: `${domain}.press`, target };
    case "scene":
      return { action: "scene.turn_on", target };
    case "script":
      return { action: "script.toggle", target };
    case "lock":
      return {
        action: state.state === "locked" ? "lock.unlock" : "lock.lock",
        target,
      };
    case "cover":
    case "valve":
      return { action: `${domain}.toggle`, target };
    case "media_player":
      return { action: "media_player.media_play_pause", target };
    case "climate":
      return {
        action: state.state === "off" ? "climate.turn_on" : "climate.turn_off",
        target,
      };
    case "vacuum":
      return {
        action:
          state.state === "cleaning" ? "vacuum.return_to_base" : "vacuum.start",
        target,
      };
    default:
      return toggleDomains.has(domain)
        ? { action: "homeassistant.toggle", target }
        : undefined;
  }
};

const deviceClassIcons = {
  temperature: "thermometer",
  humidity: "droplets",
  moisture: "droplets",
  battery: "battery",
  power: "zap",
  energy: "zap",
  voltage: "zap",
  current: "zap",
  illuminance: "sun",
  motion: "activity",
  occupancy: "user",
  presence: "user",
  door: "door-closed",
  garage_door: "door-closed",
  window: "frame",
  smoke: "flame",
  gas: "flame",
  carbon_dioxide: "wind",
  pm25: "wind",
  connectivity: "wifi",
  plug: "plug",
  outlet: "plug",
  tv: "tv",
  speaker: "speaker",
  blind: "blinds",
  shade: "blinds",
  shutter: "blinds",
  curtain: "blinds",
  awning: "blinds",
} satisfies Record<string, string>;

const domainIcons = {
  light: "lightbulb",
  switch: "toggle",
  input_boolean: "toggle",
  fan: "fan",
  climate: "thermometer",
  water_heater: "flame",
  cover: "blinds",
  lock: "lock",
  media_player: "speaker",
  camera: "camera",
  sensor: "gauge",
  binary_sensor: "circle-dot",
  person: "user",
  device_tracker: "map-pin",
  zone: "map-pin",
  sun: "sun",
  weather: "cloud-sun",
  automation: "bot",
  script: "wand",
  scene: "sparkles",
  button: "mouse-pointer-click",
  input_button: "mouse-pointer-click",
  alarm_control_panel: "shield",
  vacuum: "bot",
  calendar: "calendar",
  update: "refresh",
  humidifier: "droplets",
  siren: "bell",
  timer: "clock",
  input_number: "gauge",
  number: "gauge",
  input_select: "list-checks",
  select: "list-checks",
  input_text: "type",
  text: "type",
  valve: "waves",
  lawn_mower: "trees",
  remote: "tv",
} satisfies Record<string, string>;

// The icon a tile shows: its own, then one for its device class, then its
// domain's.
export const entityIcon = (
  state: EntityState | undefined,
  entityId: string,
) => {
  const domain = domainOf(entityId);

  if (state !== undefined) {
    if (domain === "lock" && state.state !== "locked") {
      return "lock-open";
    }

    if (domain === "light" && state.state === "off") {
      return "lightbulb-off";
    }

    if (domain === "alarm_control_panel" && state.state.startsWith("armed")) {
      return "shield-check";
    }

    if (domain === "binary_sensor" || domain === "cover") {
      const deviceClass = stringAttribute(state, "device_class");

      if (deviceClass === "door" || deviceClass === "garage_door") {
        return state.state === "on" || state.state === "open"
          ? "door-open"
          : "door-closed";
      }
    }

    const deviceClass = stringAttribute(state, "device_class");

    const fromClass =
      deviceClass === undefined
        ? undefined
        : lookup(deviceClassIcons, deviceClass);

    if (fromClass !== undefined) {
      return fromClass;
    }
  }

  return lookup(domainIcons, domain) ?? "circle-dot";
};

// The value for a key the record may not have.
const lookup = <V>(record: Readonly<Record<string, V>>, key: string) =>
  Object.hasOwn(record, key) ? record[key] : undefined;

const words = (value: string) =>
  value.replaceAll("_", " ").replace(/^./, (first) => first.toUpperCase());

// The state as a tile shows it, with its unit.
export const stateText = (state: EntityState | undefined) => {
  if (state === undefined) {
    return "Not found";
  }

  if (isUnavailable(state)) {
    return words(state.state);
  }

  const domain = domainOf(state.entity_id);

  if (domain === "light" && state.state === "on") {
    const brightness = numberAttribute(state, "brightness");

    return brightness === undefined
      ? "On"
      : `${Math.round((brightness / 255) * 100)}%`;
  }

  if (domain === "cover") {
    const position = numberAttribute(state, "current_position");

    if (position !== undefined && state.state === "open" && position < 100) {
      return `Open ${position}%`;
    }
  }

  if (domain === "climate") {
    const current = numberAttribute(state, "current_temperature");
    const unit = "°";

    return current === undefined
      ? words(state.state)
      : `${words(state.state)} · ${current}${unit}`;
  }

  if (domain === "media_player" && state.state === "playing") {
    const title = stringAttribute(state, "media_title");

    if (title !== undefined) {
      return title;
    }
  }

  if (domain === "binary_sensor") {
    return binaryText(state);
  }

  const unit = stringAttribute(state, "unit_of_measurement");
  const number = Number(state.state);

  if (state.state !== "" && Number.isFinite(number)) {
    const formatted = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: Math.abs(number) < 100 ? 1 : 0,
    }).format(number);

    return unit === undefined ? formatted : `${formatted} ${unit}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(state.state)) {
    return relativeTime(state.state);
  }

  return words(state.state);
};

const binaryLabels = {
  door: ["Open", "Closed"],
  garage_door: ["Open", "Closed"],
  window: ["Open", "Closed"],
  opening: ["Open", "Closed"],
  motion: ["Motion", "Clear"],
  occupancy: ["Occupied", "Clear"],
  presence: ["Home", "Away"],
  moisture: ["Wet", "Dry"],
  smoke: ["Smoke", "Clear"],
  gas: ["Gas", "Clear"],
  connectivity: ["Connected", "Disconnected"],
  battery: ["Low", "Normal"],
  lock: ["Unlocked", "Locked"],
  plug: ["Plugged in", "Unplugged"],
  problem: ["Problem", "OK"],
} satisfies Record<string, readonly [string, string]>;

const binaryText = (state: EntityState) => {
  const labels = lookup(
    binaryLabels,
    stringAttribute(state, "device_class") ?? "",
  );

  const on = state.state === "on";

  return labels === undefined ? (on ? "On" : "Off") : labels[on ? 0 : 1];
};

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

// How long ago, or how far ahead, an ISO time is.
export const relativeTime = (iso: string, now = Date.now()) => {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const absolute = Math.abs(seconds);

  if (absolute < 45) {
    return "Just now";
  }

  if (absolute < 3600) {
    return relative.format(Math.round(seconds / 60), "minute");
  }

  if (absolute < 86_400) {
    return relative.format(Math.round(seconds / 3600), "hour");
  }

  return relative.format(Math.round(seconds / 86_400), "day");
};

// The name a tile shows: the widget's title, the bridge's resolved name,
// then the entity ID.
export const entityName = (
  update: EntityUpdate | undefined,
  entityId: string,
  title?: string,
) => (title !== undefined && title !== "" ? title : update?.name || entityId);
