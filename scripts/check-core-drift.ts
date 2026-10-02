// Compares the actions Home Assistant Core ships built in with what
// @timmo001/effect-ha builds, for a release: new or removed actions, changed
// fields, and actions with no builder. Core's services.yaml files are the
// source; a snapshot from the last check shows what changed since.
import { BunRuntime, BunServices } from "@effect/platform-bun";
import * as EffectHa from "@timmo001/effect-ha";
import { YAML } from "bun";
import {
  Console,
  Data,
  Effect,
  FileSystem,
  Option,
  Path,
  Predicate,
  Schema,
} from "effect";
import { Command, Flag } from "effect/cli";

const snapshotFile = "scripts/core-actions.json";

// Integration types whose actions count as built in. Other domains count
// once effect-ha covers them.
const builtInTypes = new Set(["system", "helper", "entity"]);

// Actions left out on purpose, with why.
const ignored = new Map([
  ["vacuum.turn_on", "listed in services.yaml but never registered"],
  ["vacuum.turn_off", "listed in services.yaml but never registered"],
  ["vacuum.toggle", "listed in services.yaml but never registered"],
  ["weather.get_forecast", "listed in services.yaml but never registered"],
  ["notify.notify", "a legacy notify action, sent with Notify.legacy"],
  [
    "notify.persistent_notification",
    "a legacy notify action, sent with Notify.legacy",
  ],
  ["tts.say", "legacy, replaced by tts.speak"],
  ["hassio.addon_start", "legacy, replaced by hassio.app_start"],
  ["hassio.addon_stop", "legacy, replaced by hassio.app_stop"],
  ["hassio.addon_restart", "legacy, replaced by hassio.app_restart"],
  ["hassio.addon_stdin", "legacy, replaced by hassio.app_stdin"],
]);

const placeholderText = "placeholder";

// Stands in for any argument: a target, string, number, date or options
// object. Arrow functions have no non-configurable keys for `ownKeys` to list.
interface Placeholder {
  (): Placeholder;
}

const placeholder: Placeholder = new Proxy((): Placeholder => placeholder, {
  get: (_target, key) =>
    key === Symbol.toPrimitive
      ? () => placeholderText
      : Predicate.isSymbol(key)
        ? undefined
        : placeholder,
  has: () => false,
  ownKeys: () => [],
});

const BuiltAction = Schema.Struct({
  action: Schema.String.check(Schema.isPattern(/^[a-z0-9_]+\.[a-z0-9_]+$/)),
});

// Builders build actions; others, such as `responseFrom`, return effects.
type Builder = (
  ...args: ReadonlyArray<Placeholder>
) => Partial<typeof BuiltAction.Encoded>;

type NamespaceMember = Builder | Schema.Json;

const isBuilder = (input: unknown): input is Builder =>
  Predicate.isFunction(input);

// A namespace of builders, such as `Light`. Schemas and classes are left out.
const isNamespace = (
  input: unknown,
): input is Readonly<Record<string, NamespaceMember>> =>
  Predicate.isObject(input) &&
  Object.getPrototypeOf(input) === Object.prototype;

const decodeBuiltAction = Schema.decodeUnknownOption(BuiltAction);

// Calls every builder on effect-ha's namespaces, such as `Light.turnOn`, with
// placeholders and keeps the actions they build. Names built from arguments,
// such as `script.<name>`, are left out.
const coveredActions = (): ReadonlySet<string> => {
  const covered = new Set<string>(
    EffectHa.YamlReloadDomain.literals.map(
      (domain) => EffectHa.reloadYaml(domain).action,
    ),
  );

  for (const namespace of Object.values(EffectHa).filter(isNamespace)) {
    for (const builder of Object.values(namespace).filter(isBuilder)) {
      try {
        const built = decodeBuiltAction(
          builder(placeholder, placeholder, placeholder, placeholder),
        );

        if (
          Option.isSome(built) &&
          !built.value.action.includes(placeholderText)
        ) {
          covered.add(built.value.action);
        }
      } catch {
        // Builders that need real arguments, such as a calendar event's
        // dates, are checked by hand.
      }
    }
  }

  return covered;
};

const FieldsYaml = Schema.Record(Schema.String, Schema.Unknown);

// Keys starting with `.` hold YAML anchors, not actions.
const ServicesYaml = Schema.NullOr(
  Schema.Record(Schema.String, Schema.Unknown),
);

const ServiceYaml = Schema.NullOr(
  Schema.Struct({ fields: Schema.optionalKey(Schema.NullOr(FieldsYaml)) }),
);

// A collapsible section, which holds fields of its own.
const isSection = Schema.is(Schema.Struct({ fields: FieldsYaml }));

const Manifest = Schema.Struct({
  integration_type: Schema.optionalKey(Schema.String),
});

// Field names, including those in collapsible sections.
const fieldNames = (fields: typeof FieldsYaml.Type | null | undefined) =>
  Object.entries(fields ?? {})
    .flatMap(([name, field]) =>
      isSection(field) ? Object.keys(field.fields) : [name],
    )
    .toSorted();

class CoreDrift extends Data.TaggedError("CoreDrift")<{
  readonly message: string;
}> {}

type Snapshot = Readonly<Record<string, ReadonlyArray<string>>>;

const SnapshotSchema = Schema.fromJsonString(
  Schema.Record(Schema.String, Schema.Array(Schema.String)),
);

const coreActions = Effect.fn("coreActions")(function* (
  core: string,
  coveredDomains: ReadonlySet<string>,
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const components = path.join(core, "homeassistant", "components");
  const actions: Record<string, ReadonlyArray<string>> = {};

  for (const domain of (yield* fs.readDirectory(components)).toSorted()) {
    const servicesFile = path.join(components, domain, "services.yaml");

    if (domain.includes(".") || !(yield* fs.exists(servicesFile))) {
      continue;
    }

    const manifest = yield* fs
      .readFileString(path.join(components, domain, "manifest.json"))
      .pipe(
        Effect.flatMap(
          Schema.decodeUnknownEffect(Schema.fromJsonString(Manifest)),
        ),
      );

    if (
      !builtInTypes.has(manifest.integration_type ?? "hub") &&
      !coveredDomains.has(domain)
    ) {
      continue;
    }

    const services = yield* Schema.decodeUnknownEffect(ServicesYaml)(
      YAML.parse(yield* fs.readFileString(servicesFile)),
    );

    for (const [service, value] of Object.entries(services ?? {})) {
      if (service.startsWith(".")) {
        continue;
      }

      const description = yield* Schema.decodeUnknownEffect(ServiceYaml)(value);

      actions[`${domain}.${service}`] = fieldNames(description?.fields);
    }
  }

  return actions;
});

const difference = (
  left: Iterable<string>,
  right: ReadonlySet<string> | ReadonlyMap<string, unknown>,
) => [...left].filter((item) => !right.has(item)).toSorted();

const report = (title: string, lines: ReadonlyArray<string>) =>
  lines.length === 0
    ? Effect.void
    : Console.log(
        [`${title}:`, ...lines.map((line) => `  ${line}`), ""].join("\n"),
      );

const check = Command.make(
  "check-core-drift",
  {
    core: Flag.String("core").pipe(
      Flag.withDescription("Home Assistant Core checkout"),
      Flag.withDefault("../core"),
    ),
    update: Flag.Boolean("update").pipe(
      Flag.withDescription("Save Core's actions as the new snapshot"),
      Flag.withDefault(false),
    ),
  },
  (input) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const covered = coveredActions();

      const coveredDomains = new Set(
        [...covered].map((action) => action.split(".")[0] ?? action),
      );

      const current = yield* coreActions(input.core, coveredDomains);

      const currentNames = new Set(Object.keys(current));

      if (input.update) {
        yield* fs.writeFileString(
          snapshotFile,
          `${JSON.stringify(current, null, 2)}\n`,
        );

        yield* Console.log(
          `Saved ${currentNames.size} actions to ${snapshotFile}`,
        );

        return;
      }

      const snapshot: Snapshot = (yield* fs.exists(snapshotFile))
        ? yield* Schema.decodeEffect(SnapshotSchema)(
            yield* fs.readFileString(snapshotFile),
          )
        : {};

      const snapshotNames = new Set(Object.keys(snapshot));

      const changedFields = Object.entries(current).flatMap(
        ([action, fields]) => {
          const before = snapshot[action];

          if (before === undefined) {
            return [];
          }

          const added = difference(fields, new Set(before));
          const removed = difference(before, new Set(fields));

          return added.length === 0 && removed.length === 0
            ? []
            : [
                [
                  action,
                  ...added.map((field) => `+${field}`),
                  ...removed.map((field) => `-${field}`),
                ].join(" "),
              ];
        },
      );

      const sections = [
        [
          "New in Core since the snapshot",
          difference(currentNames, snapshotNames),
        ],
        [
          "Removed from Core since the snapshot",
          difference(snapshotNames, currentNames),
        ],
        ["Changed fields since the snapshot", changedFields],
        [
          "In Core with no effect-ha builder",
          difference(currentNames, covered).filter(
            (action) => !ignored.has(action),
          ),
        ],
        [
          "Built by effect-ha but not in Core",
          difference(covered, currentNames),
        ],
      ] as const;

      for (const [title, lines] of sections) {
        yield* report(title, lines);
      }

      yield* report(
        "Ignored",
        [...ignored].flatMap(([action, reason]) =>
          currentNames.has(action) ? [`${action}: ${reason}`] : [],
        ),
      );

      const drift = sections.reduce(
        (total, [, lines]) => total + lines.length,
        0,
      );

      if (drift > 0) {
        return yield* new CoreDrift({
          message: `${drift} differences; update effect-ha, then run with --update`,
        });
      }

      yield* Console.log(
        `No drift across ${currentNames.size} actions (${covered.size} built)`,
      );
    }),
);

check.pipe(
  Command.run({ version: "0.0.0" }),
  Effect.provide(BunServices.layer),
  BunRuntime.runMain,
);
