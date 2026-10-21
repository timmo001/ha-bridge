import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Script } from "node:vm";

const web = join(import.meta.dir, "..", "..", "web");

// Text files are kept as they are; images and other binary files as base64,
// as a macro can only return what serialises to JSON.
const textFile = /\.(html|js|css|svg)$/;

export interface BundledFile {
  readonly base64: boolean;
  readonly body: string;
}

// Builds the panel's web UI and returns its files. Imported as a Bun macro,
// so it runs while ha-bridge is bundled or loaded from source, and the files
// end up inlined in the binary. Bun.build can't run inside a macro, hence the
// child process.
export const bundleWeb = (): Record<string, BundledFile> => {
  const build = Bun.spawnSync([process.execPath, "run", "build"], {
    cwd: web,
    stdout: "ignore",
    stderr: "pipe",
  });

  if (!build.success) {
    throw new Error(`Couldn't build the panel: ${build.stderr.toString()}`);
  }

  const dist = join(web, "dist");

  // Bun's bundler can emit a script that doesn't parse, such as a private
  // field read left in a class whose fields it rewrote. That only shows as
  // a blank page, so fail the build here instead.
  for (const name of readdirSync(dist).filter((file) => file.endsWith(".js"))) {
    try {
      // Compiles without running.
      new Script(readFileSync(join(dist, name), "utf8"));
    } catch (cause) {
      throw new Error(`The panel's ${name} doesn't parse: ${String(cause)}`);
    }
  }

  return Object.fromEntries(
    readdirSync(dist).map((name) => {
      const base64 = !textFile.test(name);

      return [
        name,
        {
          base64,
          body: readFileSync(join(dist, name), base64 ? "base64" : "utf8"),
        },
      ];
    }),
  );
};
