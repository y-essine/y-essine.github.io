// Evaluates components/shapes/*.ts and dumps the point clouds to out/shapes.js
// for preview.html. No deps, no Next build: the sources are type-stripped with
// Node into out/js/*.mjs first, so the import below can be timed as plain JS
// (parse + evaluate), which is the work every page load pays for.
import { stripTypeScriptTypes } from "node:module";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const shapesDir = path.resolve(here, "../../components/shapes");
const jsDir = path.join(here, "out/js");
mkdirSync(jsDir, { recursive: true });
for (const file of readdirSync(shapesDir).filter((f) => f.endsWith(".ts"))) {
  const js = stripTypeScriptTypes(readFileSync(path.join(shapesDir, file), "utf8"))
    // Shapes use extensionless imports ("./utils"); point them at the .mjs copies.
    .replace(/(from\s+["'])(\.\/[^"']+)(["'])/g, "$1$2.mjs$3");
  writeFileSync(path.join(jsDir, file.replace(/\.ts$/, ".mjs")), js);
}

const t0 = performance.now();
const mod = await import(`${pathToFileURL(path.join(jsDir, "index.mjs")).href}?t=${Date.now()}`);
console.log(`shapes module evaluated in ${(performance.now() - t0).toFixed(1)}ms (cold: parse + generate all shapes)`);

// Names follow ALL_SHAPES order in components/shapes/index.ts.
const names = (process.env.SHAPE_NAMES || "sphere,cube,torus,heart,mail,kanji").split(",");
const shapes = mod.ALL_SHAPES.map((pts, i) => ({
  name: names[i] ?? `shape${i}`,
  points: pts.map((p) => [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)]),
}));

// The on-demand shapes (components/shapes/extra/*_data.ts, baked by
// gen-extras.mjs): flat triples in half units. `sway` marks the flat ones the
// site shows facing the viewer instead of spinning, `depthFloor` their minimum
// depth-fade range, and `stage` the ones that need the enlarged canvas. Keep both in sync with components/morphing-object-extras.ts.
const EXTRA = {
  fomo: { sway: true, depthFloor: 110 }, mailtrace: { sway: true, depthFloor: 110 },
  meme_paper: { sway: true, depthFloor: 110 }, rocket: {}, burst: { stage: 3 },
  yessine: { sway: true, stage: 3, depthFloor: 170 },
};
const extraDir = path.join(shapesDir, "extra");
for (const [name, flags] of Object.entries(EXTRA)) {
  const src = readFileSync(path.join(extraDir, `${name}_data.ts`), "utf8");
  const flat = src.slice(src.indexOf("= [") + 3, src.lastIndexOf("]")).split(",").filter((v) => v.trim()).map((v) => +v / 2);
  const points = [];
  for (let i = 0; i < flat.length; i += 3) points.push(flat.slice(i, i + 3));
  shapes.push({ name, points, extra: true, ...flags });
}

// Quick stats: catches wrong point counts, NaNs and points piled on one spot.
for (const s of shapes) {
  const keys = new Set(s.points.map((p) => p.map((v) => v.toFixed(1)).join(",")));
  const bad = s.points.filter((p) => p.some((v) => !Number.isFinite(v))).length;
  const ext = [0, 1, 2].map((a) => {
    const vals = s.points.map((p) => p[a]);
    return `${Math.min(...vals).toFixed(0)}..${Math.max(...vals).toFixed(0)}`;
  });
  console.log(
    `${s.name.padEnd(10)} n=${s.points.length} distinct=${keys.size} nonfinite=${bad} x=${ext[0]} y=${ext[1]} z=${ext[2]}`
  );
}

writeFileSync(path.join(here, "out/shapes.js"), `window.SHAPES = ${JSON.stringify(shapes)};\n`);
