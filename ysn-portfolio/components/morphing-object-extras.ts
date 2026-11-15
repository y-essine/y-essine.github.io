// On-demand shapes for the morphing object: project logos and easter eggs.
//
// Their point clouds are baked offline (scripts/shape-preview/gen-extras.mjs)
// into components/shapes/extra/*_data.ts, each in its own lazy chunk, so a
// visitor only downloads a shape when it is about to be shown. Once loaded, a
// shape is appended after the built-in ones and addressed by index like them.

/** Built-in shapes, in the order of ALL_SHAPES (components/shapes/index.ts). */
export const BUILT_IN_SHAPES = [
  "sphere",
  "cube",
  "torus",
  "heart",
  "mail",
  "kanji",
] as const;

interface ExtraShape {
  load: () => Promise<{ POINTS: number[] }>;
  /** Flat shapes face the viewer and sway by this many radians. */
  sway?: number;
  /** Minimum depth-fade range, so a flat shape is lit evenly. */
  depthFloor?: number;
  /** Canvas enlargement the shape needs to fit (see ObjectRenderer.resize). */
  stage?: number;
  /** Not offered through `window.yessine.shapes`. */
  internal?: boolean;
}

const LOGO = { sway: 0.5, depthFloor: 110 };

const EXTRA_SHAPES: Record<string, ExtraShape> = {
  rocket: { load: () => import("./shapes/extra/rocket_data") },
  // The Konami word; far wider than the object, so it needs the stage.
  yessine: {
    load: () => import("./shapes/extra/yessine_data"),
    sway: 0.07,
    depthFloor: 170,
    stage: 3,
  },
  burst: {
    load: () => import("./shapes/extra/burst_data"),
    stage: 3,
    internal: true,
  },
  fomo: { load: () => import("./shapes/extra/fomo_data"), ...LOGO },
  "meme-paper": {
    load: () => import("./shapes/extra/meme_paper_data"),
    ...LOGO,
  },
  mailtrace: { load: () => import("./shapes/extra/mailtrace_data"), ...LOGO },
};

// Project slug -> logo shape (the logos lib/project-assets.ts knows about).
const PROJECT_LOGO_SHAPES = new Map([
  ["fomo-app", "fomo"],
  ["meme-paper", "meme-paper"],
  ["mailtrace", "mailtrace"],
]);

/** The logo shape for a project page; projects without one keep the heart. */
export const getProjectLogoShape = (slug: string) =>
  PROJECT_LOGO_SHAPES.get(slug);

/** Every name `window.yessine.morph` accepts. */
export const SHAPE_NAMES: readonly string[] = Object.freeze([
  ...BUILT_IN_SHAPES,
  ...Object.keys(EXTRA_SHAPES).filter((name) => !EXTRA_SHAPES[name].internal),
]);

export interface LoadedShape {
  /** Index among all shapes, built-in ones first. */
  index: number;
  sway: number;
  depthFloor: number;
  stage: number;
}

// Data files store integers in half units.
const UNIT = 0.5;

// Shared by every mount of the component: a shape keeps its index for the
// lifetime of the page.
const loadedPoints: Float32Array[] = [];
const loadedByIndex: LoadedShape[] = BUILT_IN_SHAPES.map((_, index) => ({
  index,
  sway: 0,
  depthFloor: 0,
  stage: 1,
}));
const pending = new Map<string, Promise<LoadedShape>>();
const listeners = new Set<(points: Float32Array) => void>();

/** Point clouds of the on-demand shapes loaded so far, in index order. */
export const getLoadedExtras = (): ReadonlyArray<Float32Array> => loadedPoints;

/**
 * Called with each newly loaded shape's points, before anyone waiting on
 * `loadShape` hears about it, so renderers can take it in first.
 */
export const onExtraLoaded = (listener: (points: Float32Array) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getShape = (index: number): LoadedShape =>
  loadedByIndex[index] ?? loadedByIndex[0];

/** Resolves a shape name; null if there is no such shape. */
export function loadShape(name: string): Promise<LoadedShape> | null {
  const builtIn = (BUILT_IN_SHAPES as readonly string[]).indexOf(name);
  if (builtIn >= 0) return Promise.resolve(loadedByIndex[builtIn]);
  if (!Object.prototype.hasOwnProperty.call(EXTRA_SHAPES, name)) return null;

  let promise = pending.get(name);
  if (!promise) {
    const extra = EXTRA_SHAPES[name];
    promise = extra.load().then(({ POINTS }) => {
      const points = new Float32Array(POINTS.length);
      for (let i = 0; i < points.length; i++) points[i] = POINTS[i] * UNIT;
      const shape: LoadedShape = {
        index: loadedByIndex.length,
        sway: extra.sway ?? 0,
        depthFloor: extra.depthFloor ?? 0,
        stage: extra.stage ?? 1,
      };
      loadedByIndex.push(shape);
      loadedPoints.push(points);
      listeners.forEach((listener) => listener(points));
      return shape;
    });
    // A failed download (offline) may be retried later.
    promise.catch(() => pending.delete(name));
    pending.set(name, promise);
  }
  return promise;
}
