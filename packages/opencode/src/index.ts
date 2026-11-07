/**
 * The ha-bridge OpenCode plugin: Home Assistant through the bridge socket as
 * the `ha-bridge` Code Mode namespace. It reads the tools from
 * `ha-bridge agent tools --json` and runs each with `ha-bridge agent call`,
 * so they always match the binary on the PATH. Modelled on upkeep's plugin.
 */
import { Plugin } from "@opencode/plugin/effect";
import { Tool } from "@opencode/schema/tool";
import { Effect, Result, Schema } from "effect";
import { loadManifest, type ManifestTool, runHaBridge } from "./haBridge";
import { strictInput } from "./input";

const namespace = "ha-bridge";

const decodeJson = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Unknown),
);

/** Tool input as JSON; each tool's own schema has already checked it. */
const Input = Schema.Record(Schema.String, Schema.Json);

const decodeInput = Schema.decodeUnknownEffect(Input);

const isNonEmptyString = Schema.is(Schema.NonEmptyString);

/**
 * What the permission covers: the tool, narrowed by its resource input when
 * it names one, so "always allow" on call_action covers one action.
 */
const permissionTarget = (tool: ManifestTool, input: typeof Input.Type) => {
  const value = tool.resource === undefined ? undefined : input[tool.resource];

  return isNonEmptyString(value) ? `${tool.name} ${value}` : tool.name;
};

export default Plugin.define({
  id: "ha-bridge",
  effect: (context) =>
    Effect.gen(function* () {
      if (Bun.which("ha-bridge") === null) return;

      const manifest = yield* loadManifest.pipe(Effect.result);

      if (Result.isFailure(manifest)) {
        return yield* Effect.logWarning(
          `ha-bridge: no Code Mode tools: ${manifest.failure.message}`,
        );
      }

      // No socket means no bridge on this machine, so leave the namespace out.
      if (!manifest.success.available) return;

      const sessionDirectory = (call: Tool.Context) =>
        context.session.get({ sessionID: call.sessionID }).pipe(
          Effect.map((session) => session.location.directory),
          Effect.mapError(
            (error) =>
              new Tool.Error({
                message: "Could not read the session's directory",
                error,
              }),
          ),
        );

      // OpenCode's prompt only shows the action for plugin permissions, so
      // the action names the tool and what it acts on; rules match it with
      // `ha-bridge.write *`.
      const assertWrite = (
        tool: ManifestTool,
        call: Tool.Context,
        input: typeof Input.Type,
        stdin: string,
      ) => {
        if (tool.access !== "write") return Effect.void;

        const target = permissionTarget(tool, input);
        const resource = `${namespace}_${target}`;

        return context.permission.assert({
          sessionID: call.sessionID,
          agent: call.agent,
          action: `${namespace}.write ${target}`,
          resources: [resource],
          // An empty save list keeps "always" from being stored, so the next call asks again.
          save: tool.alwaysAsk ? [] : [resource],
          metadata: { command: `ha-bridge ${tool.argv.join(" ")} ${stdin}` },
          source: { type: "tool", messageID: call.messageID, id: call.id },
        });
      };

      const execute =
        (tool: ManifestTool) =>
        (input: typeof Input.Type, call: Tool.Context) =>
          Effect.gen(function* () {
            const stdin = JSON.stringify(input);

            yield* assertWrite(tool, call, input, stdin);

            const stdout = yield* runHaBridge(tool.argv, {
              cwd: yield* sessionDirectory(call),
              stdin: tool.stdin ? stdin : undefined,
              timeout: tool.timeoutMillis,
              env: { OPENCODE_SESSION_ID: call.sessionID },
            });

            if (!tool.json) return { output: stdout.trimEnd() };

            return {
              output: yield* decodeJson(stdout).pipe(
                Effect.mapError(
                  (error) =>
                    new Tool.Error({
                      message: `ha-bridge ${tool.name} did not print JSON: ${error.message}`,
                    }),
                ),
              ),
            };
          });

      yield* context.tool.transform((draft) => {
        draft.namespace({
          name: namespace,
          description:
            "Home Assistant through the ha-bridge socket: read entities, history, logbook, logs, updates and automation or script configs, render templates, test conditions, search, check for updates, and call actions or fire events. Targets take entity_id, device_id, area_id, floor_id or label_id.",
        });

        for (const tool of manifest.success.tools) {
          const run = execute(tool);

          draft.add({
            name: tool.name,
            description: tool.description,
            input: strictInput(tool.input),
            output: tool.json ? Schema.Unknown : Schema.String,
            options:
              tool.access === "write"
                ? {
                    namespace,
                    codemode: true,
                    pinned: tool.pinned,
                    permission: `${namespace}.write`,
                  }
                : { namespace, codemode: true, pinned: tool.pinned },
            execute: (input, call) =>
              decodeInput(input).pipe(
                Effect.mapError(
                  (error) =>
                    new Tool.Error({
                      message: `Invalid input: ${error.message}`,
                    }),
                ),
                Effect.flatMap((decoded) => run(decoded, call)),
              ),
          });
        }
      });
    }),
});
