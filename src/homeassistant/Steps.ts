import { Clock, Context, Effect, Layer, Semaphore } from "effect";
import type { HomeAssistantError } from "@timmo001/effect-ha";
import {
  type StepRequest,
  type StepResult,
  TargetError,
} from "@timmo001/effect-ha-bridge";
import { HomeAssistant } from "./HomeAssistant.js";
import {
  nextValue,
  type Remembered,
  startValue,
  stepSpecs,
} from "./stepValue.js";

export interface StepsService {
  readonly step: (
    request: StepRequest,
  ) => Effect.Effect<
    ReadonlyArray<StepResult>,
    HomeAssistantError | TargetError
  >;
  // Drops what earlier steps set in the action's domain, so a stop, an open
  // or an exact value makes the next step start from the reported value.
  readonly forget: (action: string) => Effect.Effect<void>;
}

// Entities that can't report a value right now are skipped, so one offline
// light doesn't stop the rest of an area.
const offline = new Set(["unavailable", "unknown"]);

const memoryKey = (setting: string, entityId: string) =>
  `${setting} ${entityId}`;

// Raises and lowers numbers Home Assistant has no step action for, from the
// current value and the set action.
export class Steps extends Context.Service<Steps, StepsService>()("Steps") {
  static readonly layer = Layer.effect(
    Steps,
    Effect.gen(function* () {
      const homeAssistant = yield* HomeAssistant;
      const remembered = new Map<string, Remembered>();
      // One step at a time, so quick steps read each other's values and
      // reach Home Assistant in order.
      const lock = yield* Semaphore.make(1);

      const temperatureStep = homeAssistant.getConfig.pipe(
        Effect.map(({ unit_system }) =>
          unit_system["temperature"] === "°F" ? 1 : 0.5,
        ),
      );

      const step = Effect.fn("Steps.step")(function* (request: StepRequest) {
        const spec = stepSpecs[request.setting];
        const [domain = ""] = request.setting.split(".");

        const updates = yield* homeAssistant.getEntities({
          target: request.target,
          domain,
        });

        const states = updates
          .map(({ state }) => state)
          .filter((state) => !offline.has(state.state));

        if (states.length === 0) {
          return yield* new TargetError({
            message:
              updates.length === 0
                ? `The target matches no ${domain} entity`
                : `Every ${domain} entity the target matches is unavailable`,
          });
        }

        const now = yield* Clock.currentTimeMillis;

        const planned = [];

        for (const state of states) {
          const key = memoryKey(request.setting, state.entity_id);

          const start = startValue(
            spec.current(state),
            remembered.get(key),
            now,
            spec.moving(state),
          );

          if (start === undefined) {
            return yield* new TargetError({
              message: `${state.entity_id} has no ${spec.label}`,
            });
          }

          const size =
            request.step ??
            spec.ownStep(state) ??
            (spec.defaultStep === "temperature"
              ? yield* temperatureStep
              : spec.defaultStep);

          planned.push({
            key,
            entity_id: state.entity_id,
            value: nextValue({
              start,
              step: size,
              direction: request.direction,
              range: spec.range(state),
              whole: spec.whole,
            }),
          });
        }

        return yield* Effect.forEach(
          planned,
          ({ key, entity_id, value }) =>
            homeAssistant.callAction(spec.toAction(entity_id, value)).pipe(
              Effect.andThen(Clock.currentTimeMillis),
              Effect.map((at) => {
                remembered.set(key, { value, at });

                return { entity_id, value } satisfies StepResult;
              }),
            ),
          { concurrency: "unbounded" },
        );
      }, Semaphore.withPermit(lock));

      const forget = (action: string) =>
        Effect.sync(() => {
          const [domain = ""] = action.split(".");

          for (const key of remembered.keys()) {
            if (key.startsWith(`${domain}.`)) {
              remembered.delete(key);
            }
          }
        });

      return Steps.of({ step, forget });
    }),
  );
}
