// Render check frames at output times (seconds) into out/stills/: npm run stills -- 12.5 105 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out/stills");
mkdirSync(out, { recursive: true });
// The bundle copies public/ (the base video can be gigabytes): build it next to the project, not in the system temp folder, and delete it after.
process.env.TMPDIR = path.join(root, ".tmp");
mkdirSync(process.env.TMPDIR, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), rspack: true, symlinkPublicDir: true });
const composition = await selectComposition({ serveUrl, id: "Main" });
for (const s of process.argv.slice(2)) {
  const frame = Math.round(Number(s) * composition.fps);
  await renderStill({ serveUrl, composition, frame, output: path.join(out, `${Number(s).toFixed(2).padStart(7, "0")}.png`), scale: 0.5 });
  console.log("still", s);
}
rmSync(serveUrl, { recursive: true, force: true });
