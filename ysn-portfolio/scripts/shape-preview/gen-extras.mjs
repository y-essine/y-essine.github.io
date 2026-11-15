// Offline generator for the on-demand shapes in components/shapes/extra/:
// project logos, the YESSINE word, the burst it re-forms from, and the rocket.
// Run: node --no-warnings gen-extras.mjs   (needs ImageMagick's `magick`)
//
// Everything expensive happens here: rasterising, spreading 500 points evenly
// and ordering them for morphing (the same orderForMorph the built-in shapes
// use), so at runtime a shape is a small array that is uploaded as-is.
// Also bakes the contact e-mail for the console greeting.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const shapesDir = path.join(root, "components/shapes");
const outDir = path.join(shapesDir, "extra");
mkdirSync(outDir, { recursive: true });

const N_POINTS = 500; // keep in sync with components/shapes/constants.ts
// Stored as integers in half units; morphing-object-extras.ts scales back.
const STORE_SCALE = 2;

// orderForMorph straight from the app source, type-stripped.
const jsDir = path.join(here, "out/js");
mkdirSync(jsDir, { recursive: true });
for (const file of ["utils.ts", "constants.ts", "types.ts"]) {
  const js = stripTypeScriptTypes(readFileSync(path.join(shapesDir, file), "utf8"))
    .replace(/(from\s+["'])(\.\/[^"']+)(["'])/g, "$1$2.mjs$3");
  writeFileSync(path.join(jsDir, file.replace(/\.ts$/, ".mjs")), js);
}
const { orderForMorph } = await import(`${pathToFileURL(path.join(jsDir, "utils.mjs")).href}?t=${Date.now()}`);

// Deterministic, so regenerating gives the same files.
let seed = 0x9e3779b9;
const random = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// --- raster masks -----------------------------------------------------------

/** Runs magick and parses its binary PGM output into { w, h, data }. */
const pgm = (args) => {
  const buf = execFileSync("magick", [...args, "-depth", "8", "pgm:-"], { maxBuffer: 1 << 26 });
  // "P5\n<w> <h>\n255\n" then w*h bytes.
  let pos = 0;
  const token = () => {
    while (buf[pos] === 0x0a || buf[pos] === 0x20) pos++;
    let s = "";
    while (buf[pos] !== 0x0a && buf[pos] !== 0x20) s += String.fromCharCode(buf[pos++]);
    return s;
  };
  token();
  const w = +token(), h = +token();
  token();
  return { w, h, data: buf.subarray(pos + 1, pos + 1 + w * h) };
};

/** Bright pixels of a logo. `crop` (fractions) isolates the mark. */
const logoMask = (file, { threshold = 0.8, crop = [0, 0, 1, 1], size = 220 } = {}) => {
  const img = pgm([path.join(root, "public/logos", file), "-background", "black", "-alpha", "remove",
    "-colorspace", "Gray", "-filter", "Lanczos", "-resize", `${size}x${size}`]);
  const [x0, y0, x1, y1] = crop;
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const inside = x >= x0 * img.w && x < x1 * img.w && y >= y0 * img.h && y < y1 * img.h;
      const v = img.data[y * img.w + x] / 255;
      img.data[y * img.w + x] = inside && v >= threshold ? 255 : 0;
    }
  }
  return img;
};

const textMask = (text, font, kerning) =>
  pgm(["-background", "black", "-fill", "white", "-font", font, "-pointsize", "150",
    "-kerning", `${kerning}`, `label:${text}`]);

// --- even sampling ----------------------------------------------------------

/** `n` evenly spread points inside a mask (Lloyd relaxation from a far-point seed). */
const sampleMask = (mask, n) => {
  const px = [];
  for (let y = 0; y < mask.h; y++) {
    for (let x = 0; x < mask.w; x++) if (mask.data[y * mask.w + x] > 127) px.push([x + 0.5, y + 0.5]);
  }
  if (px.length < n) throw new Error(`mask has only ${px.length} pixels`);
  const centres = farthest(px, n).map((p) => [...p]);
  const owner = new Int32Array(px.length);
  for (let iteration = 0; iteration < 40; iteration++) {
    for (let i = 0; i < px.length; i++) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < n; c++) {
        const d = (px[i][0] - centres[c][0]) ** 2 + (px[i][1] - centres[c][1]) ** 2;
        if (d < bestD) { bestD = d; best = c; }
      }
      owner[i] = best;
    }
    const sum = centres.map(() => [0, 0, 0]);
    for (let i = 0; i < px.length; i++) {
      const s = sum[owner[i]];
      s[0] += px[i][0]; s[1] += px[i][1]; s[2]++;
    }
    centres.forEach((c, k) => { if (sum[k][2]) { c[0] = sum[k][0] / sum[k][2]; c[1] = sum[k][1] / sum[k][2]; } });
  }
  return centres;
};

/** Farthest-point sampling in any dimension. */
function farthest(candidates, n) {
  const dist = new Float64Array(candidates.length).fill(Infinity);
  const picked = [];
  let current = 0;
  for (let k = 0; k < n; k++) {
    const c = candidates[current];
    picked.push(c);
    dist[current] = -1;
    let best = -1, bestDist = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (dist[i] < 0) continue;
      let dd = 0;
      for (let a = 0; a < c.length; a++) dd += (candidates[i][a] - c[a]) ** 2;
      if (dd < dist[i]) dist[i] = dd;
      if (dist[i] > bestDist) { bestDist = dist[i]; best = i; }
    }
    current = best;
  }
  return picked;
}

/**
 * Flat points -> a thin slab, like the kanji: each point goes to the front or
 * the back face, opposite to its nearest already-placed neighbours, so both
 * faces stay evenly covered.
 */
const extrude = (flat, depth) => {
  const side = new Int8Array(flat.length);
  return flat.map(([x, y], i) => {
    const near = [];
    for (let j = 0; j < i; j++) near.push([(flat[j][0] - x) ** 2 + (flat[j][1] - y) ** 2, side[j]]);
    near.sort((a, b) => a[0] - b[0]);
    const vote = near.slice(0, 3).reduce((s, v) => s + v[1], 0);
    side[i] = vote > 0 ? -1 : vote < 0 ? 1 : i % 2 ? 1 : -1;
    return { x, y, z: (side[i] * depth) / 2 };
  });
};

/** Centres the cloud and scales it so it is `width` wide or `height` tall, whichever binds. */
const fit = (points, { width = Infinity, height = Infinity }) => {
  const ext = ["x", "y", "z"].map((a) => [Math.min(...points.map((p) => p[a])), Math.max(...points.map((p) => p[a]))]);
  const scale = Math.min(width / (ext[0][1] - ext[0][0]), height / (ext[1][1] - ext[1][0]));
  return points.map((p) => ({
    x: (p.x - (ext[0][0] + ext[0][1]) / 2) * scale,
    y: (p.y - (ext[1][0] + ext[1][1]) / 2) * scale,
    z: p.z * scale,
  }));
};

const write = (name, comment, points) => {
  if (points.length !== N_POINTS) throw new Error(`${name}: ${points.length} points`);
  const flat = orderForMorph(points).flatMap((p) => [p.x, p.y, p.z].map((v) => Math.round(v * STORE_SCALE)));
  const rows = [];
  for (let i = 0; i < flat.length; i += 24) rows.push("  " + flat.slice(i, i + 24).join(",") + ",");
  const file = path.join(outDir, `${name}_data.ts`);
  writeFileSync(
    file,
    `// Generated by scripts/shape-preview/gen-extras.mjs - do not edit by hand.\n` +
      `// ${comment}\n` +
      `// ${N_POINTS} points as flat x,y,z triples in half units, already ordered for morphing.\n` +
      `export const POINTS: number[] = [\n${rows.join("\n")}\n];\n`,
  );
  console.log(`wrote ${path.relative(root, file)}`);
};

/** A flat mark from a mask, at most `width` x `height` units, `depth` thick. */
const flatShape = (mask, size, depth) => {
  const flat = sampleMask(mask, N_POINTS);
  const scaled = fit(flat.map(([x, y]) => ({ x, y, z: 0 })), size);
  return extrude(scaled.map((p) => [p.x, p.y]), depth);
};

// --- project logos (slug -> file: lib/project-assets.ts) ---------------------
// Each is reduced to its white mark; backgrounds and gradients are dropped.
const LOGOS = [
  { name: "fomo", file: "fomo_logo.png", note: "fomo.app mark", opts: { threshold: 0.6 } },
  { name: "mailtrace", file: "mailtrace_logo.png", note: "MailTrace mark", opts: { threshold: 0.8 } },
  // The "mp" monogram only: the soft grey blobs behind it are cropped out.
  { name: "meme_paper", file: "meme-paper_logo.png", note: "Meme Paper monogram",
    opts: { threshold: 0.72, crop: [0.3, 0.2, 0.75, 0.8] } },
];
const only = process.argv[2]?.split(",");
const wanted = (name) => !only || only.includes(name);

for (const logo of LOGOS) {
  if (!wanted(logo.name)) continue;
  write(logo.name, `${logo.note}, sampled from public/logos/${logo.file}.`,
    flatShape(logoMask(logo.file, logo.opts), { width: 215, height: 190 }, 20));
}

// --- YESSINE ----------------------------------------------------------------
// Far wider than the other shapes: it is shown on the enlarged "stage" canvas.
if (wanted("yessine")) {
  const font = [
    "/usr/share/fonts/OTF/SpaceGrotesk-Bold.otf",
    "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
  ].find((f) => existsSync(f)) ?? "DejaVu-Sans-Bold";
  write("yessine", `The word YESSINE (${path.basename(font)}), for the Konami code.`,
    flatShape(textMask("YESSINE", font, 14), { width: 720 }, 18));
}

// --- burst ------------------------------------------------------------------
// A hollow ball of debris. Being round, it looks the same whatever angle the
// object happens to be at when the egg fires.
if (wanted("burst")) {
  const points = [];
  while (points.length < N_POINTS) {
    const u = 2 * random() - 1, theta = 2 * Math.PI * random();
    const ring = Math.sqrt(1 - u * u), r = 120 + 150 * Math.sqrt(random());
    points.push({ x: r * ring * Math.cos(theta), y: r * u, z: r * ring * Math.sin(theta) });
  }
  write("burst", "Scattered debris the object bursts into before re-forming.", points);
}

// --- rocket -----------------------------------------------------------------
// y is up here and flipped at the end (screen y points down).
if (wanted("rocket")) {
  const R = 0.3, BODY = [0, 1.45]; // body radius; nozzle and tip heights
  const radiusAt = (y) => {
    const h = (y - BODY[0]) / (BODY[1] - BODY[0]);
    const nose = Math.sin((Math.PI / 2) * Math.min(1, (1 - h) / 0.5)) ** 0.85;
    return R * nose * (0.78 + 0.22 * Math.min(1, h / 0.18));
  };
  const body = [];
  for (let i = 0; i < 9000; i++) {
    const y = BODY[0] + (BODY[1] - BODY[0]) * random(), a = 2 * Math.PI * random(), r = radiusAt(y);
    body.push([r * Math.cos(a), y, r * Math.sin(a)]);
  }
  // Three swept fins, each a quad in a radial plane.
  const fins = [];
  for (let f = 0; f < 3; f++) {
    const a = (f / 3) * 2 * Math.PI + Math.PI / 2;
    const cell = [];
    for (let i = 0; i < 1500; i++) {
      const u = random(), v = random();
      // u: outwards from the hull; v: along the hull. The outer edge is shorter and lower.
      const out = R * 0.82 + u * R * 1.45;
      const y = 0.02 + v * (0.52 - 0.3 * u) - 0.26 * u;
      cell.push([out * Math.cos(a), y, out * Math.sin(a)]);
    }
    fins.push(cell);
  }
  // Exhaust: a loose teardrop of sparks trailing below the nozzle.
  const flame = [];
  for (let i = 0; i < 3000; i++) {
    const d = random() ** 0.8, a = 2 * Math.PI * random();
    const r = R * 0.62 * Math.sin(Math.PI * Math.min(1, d + 0.22)) ** 0.9 * Math.sqrt(random());
    flame.push([r * Math.cos(a), -0.1 - d * 0.62, r * Math.sin(a)]);
  }
  const picked = [
    ...farthest(body, 300),
    ...fins.flatMap((cell) => farthest(cell, 44)),
    ...farthest(flame, 68),
  ];
  write("rocket", "A little rocket with three fins and an exhaust trail (the five-click secret).",
    fit(picked.map(([x, y, z]) => ({ x, y: -y, z })), { height: 215 }));
}

// --- console greeting ---------------------------------------------------------
if (wanted("greeting")) {
  const data = JSON.parse(readFileSync(path.join(root, "data/portfolio.json"), "utf8"));
  const email = Object.values(data).map((locale) => locale?.contact?.email).find(Boolean);
  if (!email) throw new Error("no contact.email in data/portfolio.json");
  const file = path.join(root, "components/console-greeting-data.ts");
  writeFileSync(
    file,
    `// Generated by scripts/shape-preview/gen-extras.mjs from data/portfolio.json - do not edit by hand.\n` +
      `// (Importing the JSON itself would ship all of it to the browser.)\n` +
      `export const CONTACT_EMAIL = ${JSON.stringify(email)};\n`,
  );
  console.log(`wrote ${path.relative(root, file)}`);
}
