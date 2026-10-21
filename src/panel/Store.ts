import {
  Context,
  Effect,
  FileSystem,
  Layer,
  Path,
  Schema,
  Stream,
  SubscriptionRef,
} from "effect";
import {
  type Dashboard,
  PanelError,
  PanelState,
  type Settings,
} from "./Panel.js";

const PanelFile = Schema.fromJsonString(PanelState);

const decodeFile = Schema.decodeUnknownEffect(PanelFile);

const encodeFile = Schema.encodeEffect(PanelFile);

const fail = (message: string) => Effect.fail(new PanelError({ message }));

export interface PanelStoreService {
  readonly path: string;
  // The saved state, then each change.
  readonly changes: Stream.Stream<PanelState>;
  readonly saveDashboard: (
    dashboard: Dashboard,
  ) => Effect.Effect<void, PanelError>;
  readonly deleteDashboard: (id: string) => Effect.Effect<void, PanelError>;
  readonly orderDashboards: (
    ids: ReadonlyArray<string>,
  ) => Effect.Effect<void, PanelError>;
  readonly saveSettings: (
    settings: Settings,
  ) => Effect.Effect<void, PanelError>;
}

// The panel's dashboards and settings, kept in one JSON file. Changes are
// written one at a time, each to a temporary file renamed over the last, so
// a crash mid-write leaves the previous version.
export class PanelStore extends Context.Service<
  PanelStore,
  PanelStoreService
>()("PanelStore") {
  static readonly layer = (file: string) =>
    Layer.effect(
      PanelStore,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const initial = yield* fs.exists(file).pipe(
          Effect.flatMap((exists) =>
            exists
              ? fs.readFileString(file).pipe(Effect.flatMap(decodeFile))
              : decodeFile("{}"),
          ),
          Effect.mapError(
            (cause) =>
              new PanelError({
                message: `read ${file}: ${cause.message}`,
              }),
          ),
        );

        const state = yield* SubscriptionRef.make(initial);

        const write = (next: PanelState) =>
          Effect.gen(function* () {
            const content = yield* encodeFile(next);
            const temporary = `${file}.tmp`;

            yield* fs.makeDirectory(path.dirname(file), { recursive: true });
            yield* fs.writeFileString(temporary, `${content}\n`);
            yield* fs.rename(temporary, file);
          }).pipe(
            Effect.mapError(
              (cause) =>
                new PanelError({
                  message: `save ${file}: ${cause.message}`,
                }),
            ),
          );

        const change = (
          f: (current: PanelState) => Effect.Effect<PanelState, PanelError>,
        ) =>
          SubscriptionRef.updateEffect(state, (current) =>
            f(current).pipe(Effect.tap(write)),
          );

        return PanelStore.of({
          path: file,
          changes: SubscriptionRef.changes(state),
          saveDashboard: (dashboard) =>
            change((current) => {
              const exists = current.dashboards.some(
                ({ id }) => id === dashboard.id,
              );

              return Effect.succeed({
                ...current,
                dashboards: exists
                  ? current.dashboards.map((existing) =>
                      existing.id === dashboard.id ? dashboard : existing,
                    )
                  : [...current.dashboards, dashboard],
              });
            }),
          deleteDashboard: (id) =>
            change((current) =>
              current.dashboards.some((dashboard) => dashboard.id === id)
                ? Effect.succeed({
                    ...current,
                    dashboards: current.dashboards.filter(
                      (dashboard) => dashboard.id !== id,
                    ),
                  })
                : fail(`no dashboard ${id}`),
            ),
          orderDashboards: (ids) =>
            change((current) => {
              const byId = new Map(
                current.dashboards.map((dashboard) => [
                  dashboard.id,
                  dashboard,
                ]),
              );

              const ordered = ids.flatMap((id) => {
                const dashboard = byId.get(id);

                return dashboard === undefined ? [] : [dashboard];
              });

              return ordered.length === current.dashboards.length &&
                new Set(ids).size === ids.length
                ? Effect.succeed({ ...current, dashboards: ordered })
                : fail("the order must name every dashboard once");
            }),
          saveSettings: (settings) =>
            change((current) => Effect.succeed({ ...current, settings })),
        });
      }),
    );
}
