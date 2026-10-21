import type { EntityUpdate } from "@timmo001/effect-ha-bridge";
import type { Schema } from "effect";
import type {
  Dashboard,
  EntityWidget,
  PanelState,
  SecondaryInfo,
  TapAction,
} from "../../src/panel/Panel.js";

type Attributes = Readonly<Record<string, Schema.Json>>;

interface Fixture {
  readonly entityId: string;
  readonly name: string;
  readonly state: string;
  readonly attributes?: Attributes;
  // How long ago it last changed.
  readonly minutes: number;
}

const fixtures: ReadonlyArray<Fixture> = [
  {
    entityId: "light.living_room",
    name: "Living room",
    state: "on",
    attributes: {
      brightness: 186,
      color_temp_kelvin: 3200,
      min_color_temp_kelvin: 2200,
      max_color_temp_kelvin: 6500,
    },
    minutes: 42,
  },
  {
    entityId: "light.reading_lamp",
    name: "Reading lamp",
    state: "on",
    attributes: {
      brightness: 92,
      color_temp_kelvin: 2700,
      min_color_temp_kelvin: 2200,
      max_color_temp_kelvin: 6500,
    },
    minutes: 8,
  },
  { entityId: "light.kitchen", name: "Kitchen", state: "off", minutes: 95 },
  { entityId: "light.bedroom", name: "Bedroom", state: "off", minutes: 300 },
  {
    entityId: "light.porch",
    name: "Porch",
    state: "on",
    attributes: { brightness: 255 },
    minutes: 120,
  },
  {
    entityId: "switch.coffee_machine",
    name: "Coffee machine",
    state: "off",
    attributes: { device_class: "outlet" },
    minutes: 70,
  },
  {
    entityId: "fan.office",
    name: "Office fan",
    state: "on",
    attributes: { percentage: 40 },
    minutes: 25,
  },
  {
    entityId: "climate.hallway",
    name: "Hallway",
    state: "heat",
    attributes: {
      current_temperature: 20.5,
      temperature: 21,
      target_temp_step: 0.5,
      hvac_modes: ["off", "heat", "auto"],
    },
    minutes: 180,
  },
  {
    entityId: "cover.living_room_blinds",
    name: "Blinds",
    state: "open",
    attributes: { current_position: 70, device_class: "blind" },
    minutes: 210,
  },
  {
    entityId: "lock.front_door",
    name: "Front door",
    state: "locked",
    minutes: 33,
  },
  {
    entityId: "media_player.kitchen_speaker",
    name: "Kitchen speaker",
    state: "playing",
    attributes: {
      media_title: "Strobe",
      media_artist: "deadmau5",
      volume_level: 0.35,
    },
    minutes: 4,
  },
  {
    entityId: "sensor.outside_temperature",
    name: "Outside",
    state: "12.4",
    attributes: { unit_of_measurement: "°C", device_class: "temperature" },
    minutes: 2,
  },
  {
    entityId: "sensor.living_room_humidity",
    name: "Humidity",
    state: "48",
    attributes: { unit_of_measurement: "%", device_class: "humidity" },
    minutes: 6,
  },
  {
    entityId: "sensor.power_usage",
    name: "Power",
    state: "1.86",
    attributes: { unit_of_measurement: "kW", device_class: "power" },
    minutes: 1,
  },
  {
    entityId: "sensor.solar_production",
    name: "Solar",
    state: "3.42",
    attributes: { unit_of_measurement: "kW", device_class: "power" },
    minutes: 1,
  },
  {
    entityId: "sensor.phone_battery",
    name: "Phone battery",
    state: "76",
    attributes: { unit_of_measurement: "%", device_class: "battery" },
    minutes: 15,
  },
  {
    entityId: "binary_sensor.front_door",
    name: "Front door sensor",
    state: "off",
    attributes: { device_class: "door" },
    minutes: 33,
  },
  {
    entityId: "binary_sensor.hallway_motion",
    name: "Hallway motion",
    state: "on",
    attributes: { device_class: "motion" },
    minutes: 1,
  },
  { entityId: "person.alex", name: "Alex", state: "home", minutes: 240 },
  {
    entityId: "scene.movie_night",
    name: "Movie night",
    state: "2026-10-20T20:15:00+00:00",
    minutes: 1200,
  },
  {
    entityId: "input_boolean.guest_mode",
    name: "Guest mode",
    state: "off",
    minutes: 3000,
  },
  {
    entityId: "vacuum.robot",
    name: "Robot vacuum",
    state: "docked",
    minutes: 400,
  },
];

// The demo's entities as the bridge reports them, changed the given number
// of minutes before `now`.
export const entityUpdates = (now: number): ReadonlyArray<EntityUpdate> =>
  fixtures.map(({ entityId, name, state, attributes, minutes }) => {
    const changed = new Date(now - minutes * 60_000).toISOString();

    return {
      name,
      state: {
        entity_id: entityId,
        state,
        attributes: { friendly_name: name, ...attributes },
        last_changed: changed,
        last_updated: changed,
      },
    };
  });

const tile = (
  id: string,
  entityId: string,
  options: {
    readonly columns?: number;
    readonly rows?: number;
    readonly tap?: TapAction;
    readonly secondary?: SecondaryInfo;
  } = {},
): EntityWidget => ({
  id,
  type: "entity",
  entityId,
  size: { columns: options.columns ?? 1, rows: options.rows ?? 1 },
  tap: options.tap ?? "toggle",
  secondary: options.secondary ?? "state",
});

const home: Dashboard = {
  id: "home",
  name: "Home",
  icon: "house",
  sections: [
    {
      id: "overview",
      title: "Good evening",
      subtitle: "3 lights on · Front door locked",
      columns: 6,
      widgets: [
        {
          id: "clock",
          type: "clock",
          size: { columns: 2, rows: 2 },
          showDate: true,
          showSeconds: false,
        },
        tile("outside", "sensor.outside_temperature", {
          rows: 2,
          tap: "details",
        }),
        tile("power", "sensor.power_usage", { rows: 2, tap: "details" }),
        {
          id: "note",
          type: "markdown",
          size: { columns: 2, rows: 2 },
          title: "Today",
          content:
            "### Bins go out tonight\nIt's **{{ states('sensor.outside_temperature') }} °C** outside and the house is drawing {{ states('sensor.power_usage') }} kW.\n\n- Dentist at 15:30\n- Pick up parcel",
        },
      ],
    },
    {
      id: "living-room",
      title: "Living room",
      columns: 6,
      widgets: [
        tile("living-room-light", "light.living_room", { columns: 2 }),
        tile("reading-lamp", "light.reading_lamp", { columns: 2 }),
        tile("blinds", "cover.living_room_blinds", { columns: 2 }),
        tile("speaker", "media_player.kitchen_speaker", {
          columns: 2,
          tap: "details",
        }),
        tile("fan", "fan.office"),
        tile("coffee", "switch.coffee_machine"),
        tile("kitchen-light", "light.kitchen"),
        tile("movie-night", "scene.movie_night", { secondary: "none" }),
      ],
    },
    {
      id: "climate",
      title: "Climate & energy",
      columns: 6,
      widgets: [
        {
          id: "outside-history",
          type: "history",
          entityId: "sensor.outside_temperature",
          size: { columns: 3, rows: 2 },
          hours: 24,
        },
        {
          id: "power-history",
          type: "history",
          entityId: "sensor.power_usage",
          size: { columns: 3, rows: 2 },
          hours: 24,
        },
        tile("hallway", "climate.hallway", { columns: 2, tap: "details" }),
        tile("humidity", "sensor.living_room_humidity", { tap: "details" }),
        tile("solar", "sensor.solar_production", { tap: "details" }),
        tile("battery", "sensor.phone_battery", { tap: "details" }),
        tile("vacuum", "vacuum.robot"),
      ],
    },
    {
      id: "security",
      title: "Security",
      columns: 6,
      widgets: [
        tile("front-door", "lock.front_door", { columns: 2 }),
        tile("door-sensor", "binary_sensor.front_door", {
          tap: "details",
          secondary: "last-changed",
        }),
        tile("motion", "binary_sensor.hallway_motion", {
          tap: "details",
          secondary: "last-changed",
        }),
        tile("alex", "person.alex", { tap: "details" }),
        tile("porch", "light.porch"),
        {
          id: "shopping",
          type: "checklist",
          size: { columns: 2, rows: 3 },
          title: "Shopping",
          items: [
            { id: "oat-milk", text: "Oat milk", done: false },
            { id: "coffee-beans", text: "Coffee beans", done: false },
            { id: "batteries", text: "Batteries (AA)", done: true },
            { id: "bin-bags", text: "Bin bags", done: false },
          ],
        },
      ],
    },
  ],
};

// Dashboards and settings the demo starts with.
export const demoPanel: PanelState = {
  settings: {
    theme: "panel",
    mode: "system",
    accent: "theme",
    density: "comfortable",
    background: { kind: "theme", blur: 0, dim: 30 },
    customThemes: [
      {
        id: "ocean",
        name: "Ocean",
        scheme: "dark",
        background: "#0b1d2a",
        card: "#11293b",
        text: "#d8ecf7",
        accent: "#4fd1c5",
      },
    ],
    kiosk: false,
    clock24h: true,
  },
  dashboards: [
    home,
    {
      id: "kitchen",
      name: "Kitchen",
      icon: "chef-hat",
      sections: [
        {
          id: "kitchen",
          title: "Kitchen",
          columns: 4,
          widgets: [
            tile("kitchen-main", "light.kitchen", { columns: 2 }),
            tile("kitchen-coffee", "switch.coffee_machine", { columns: 2 }),
          ],
        },
      ],
    },
    { id: "energy", name: "Energy", icon: "zap", sections: [] },
  ],
};
