import { GOLDEN_RATIO, TARGET_HEIGHT } from './constants';
import { type Point3D } from './types';

// Generate Fibonacci points on unit sphere, then map to shape
export const fibonacciPoint = (
  i: number,
  total: number,
): { theta: number; phi: number; t: number } => {
  const t = i / total;
  const theta = (2 * Math.PI * i) / GOLDEN_RATIO;
  const phi = Math.acos(1 - 2 * t);
  return { theta, phi, t };
};

export const normalizeShape = (points: Point3D[]): Point3D[] => {
  // Find min/max for each axis
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z);
    maxZ = Math.max(maxZ, p.z);
  }

  // Calculate current dimensions
  const currentHeight = maxY - minY;
  const scale = TARGET_HEIGHT / currentHeight;

  // Center and scale uniformly
  const centerY = (minY + maxY) / 2;

  return points.map(p => ({
    x: (p.x - (minX + maxX) / 2) * scale,
    y: (p.y - centerY) * scale,
    z: (p.z - (minZ + maxZ) / 2) * scale,
  }));
};

// Additional scale for single shape
export const scaleShape = (points: Point3D[], factor: number): Point3D[] => {
  return points.map(p => ({
    x: p.x * factor,
    y: p.y * factor,
    z: p.z * factor,
  }));
};

const lexLess = (a: Float64Array, b: Float64Array, c: Float64Array, p: number, q: number): boolean =>
  a[p] !== a[q] ? a[p] < a[q] : b[p] !== b[q] ? b[p] < b[q] : c[p] !== c[q] ? c[p] < c[q] : p < q;

// Reorders a shape so that index i sits in the same region of space in every
// shape: recursively halve the cloud along x, then y, then z. Since all shapes
// have the same point count, the splits line up, so point i of shape A morphs
// to a nearby point i of shape B instead of flying across the object.
// Each halving is a quickselect over typed arrays, O(n log n) overall.
export const orderForMorph = (points: Point3D[]): Point3D[] => {
  const n = points.length;
  const coords = [new Float64Array(n), new Float64Array(n), new Float64Array(n)];
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    coords[0][i] = points[i].x;
    coords[1][i] = points[i].y;
    coords[2][i] = points[i].z;
    idx[i] = i;
  }

  // Moves the k-th smallest (by axis a, ties broken by b then c) into idx[k],
  // with everything smaller before it.
  const select = (lo: number, hi: number, k: number, depth: number) => {
    const a = coords[depth % 3];
    const b = coords[(depth + 1) % 3];
    const c = coords[(depth + 2) % 3];
    while (lo < hi) {
      const pivot = idx[(lo + hi) >> 1];
      let i = lo;
      let j = hi;
      while (i <= j) {
        while (lexLess(a, b, c, idx[i], pivot)) i++;
        while (lexLess(a, b, c, pivot, idx[j])) j--;
        if (i <= j) {
          const t = idx[i];
          idx[i] = idx[j];
          idx[j] = t;
          i++;
          j--;
        }
      }
      if (k <= j) hi = j;
      else if (k >= i) lo = i;
      else return;
    }
  };

  const split = (lo: number, hi: number, depth: number) => {
    if (hi - lo <= 1) return;
    const mid = lo + ((hi - lo) >> 1);
    select(lo, hi - 1, mid, depth);
    split(lo, mid, depth + 1);
    split(mid, hi, depth + 1);
  };
  split(0, n, 0);

  const out: Point3D[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = points[idx[i]];
  return out;
};
