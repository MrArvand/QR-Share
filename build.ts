import { copyFileSync, mkdirSync, rmSync, watch } from "node:fs";
import { join } from "node:path";

const ROOT = import.meta.dir;
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");
const STATIC_FILES = ["manifest.json", "popup.html", "popup.css"];

async function runBuild(): Promise<void> {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  const result = await Bun.build({
    entrypoints: [join(ROOT, "src", "popup.ts")],
    outdir: DIST,
    target: "browser",
    minify: true,
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  for (const file of STATIC_FILES) {
    copyFileSync(join(PUBLIC, file), join(DIST, file));
  }

  await import("./scripts/gen-icons.ts");

  console.log("Build complete → dist/");
}

if (process.argv.includes("--watch")) {
  console.log("Watching for changes…");

  let running = false;
  const trigger = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      await runBuild();
    } catch (err) {
      console.error(err);
    } finally {
      running = false;
    }
  };

  for (const dir of ["src", "public", "scripts"]) {
    watch(join(ROOT, dir), trigger);
  }
  await runBuild();
} else {
  await runBuild();
}
