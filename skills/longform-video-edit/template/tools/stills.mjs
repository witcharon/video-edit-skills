// Render check frames at output times (seconds) into out/stills/: npm run stills -- 12.5 105 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out/stills");
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), rspack: true });
const composition = await selectComposition({ serveUrl, id: "Main" });
for (const s of process.argv.slice(2)) {
  const frame = Math.round(Number(s) * composition.fps);
  await renderStill({ serveUrl, composition, frame, output: path.join(out, `${Number(s).toFixed(2).padStart(7, "0")}.png`), scale: 0.5 });
  console.log("still", s);
}
