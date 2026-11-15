import { N_POINTS } from './constants';
import { type Point3D } from './types';
import { normalizeShape, orderForMorph, scaleShape } from './utils';

// Envelope proportions (y up while building, flipped to screen space at the end).
const HALF_W = 0.75;
const HALF_H = 0.5;
const HALF_D = 0.075;
const FLAP_TIP_Y = -0.1; // where the V of the flap meets, just below centre

type P2 = [number, number];

// `count` points evenly spaced along a polyline (end points included unless
// `open` trims them, used where another line already owns the corner).
const alongPath = (path: P2[], count: number, z: number, closed = false, trim = 0): Point3D[] => {
  const pts = closed ? [...path, path[0]] : path;
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lengths.push(l);
    total += l;
  }
  const out: Point3D[] = [];
  for (let k = 0; k < count; k++) {
    const f = closed ? k / count : count === 1 ? 0.5 : trim + ((1 - 2 * trim) * k) / (count - 1);
    let d = f * total;
    let seg = 0;
    while (seg < lengths.length - 1 && d > lengths[seg]) d -= lengths[seg++];
    const t = lengths[seg] ? d / lengths[seg] : 0;
    out.push({
      x: pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * t,
      y: pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * t,
      z,
    });
  }
  return out;
};

// Mail - a closed envelope: a thin slab outlined on both faces, with the V of
// the flap and the two lower folds drawn on it.
const generateMailPoints = (): Point3D[] => {
  const outline: P2[] = [
    [-HALF_W, HALF_H],
    [HALF_W, HALF_H],
    [HALF_W, -HALF_H],
    [-HALF_W, -HALF_H],
  ];
  const points: Point3D[] = [];

  // Both faces carry the same drawing, so it reads from either side.
  const tip: P2 = [0, FLAP_TIP_Y];
  for (const z of [HALF_D, -HALF_D]) {
    points.push(...alongPath(outline, 106, z, true));

    // Flap: the V, drawn as a double line so it is the strongest feature.
    points.push(...alongPath([[-HALF_W, HALF_H], tip, [HALF_W, HALF_H]], 47, z, false, 0.02));
    points.push(
      ...alongPath([[-HALF_W + 0.09, HALF_H], [0, FLAP_TIP_Y + 0.07], [HALF_W - 0.09, HALF_H]], 39, z, false, 0.03),
    );

    // Lower folds: from the bottom corners up towards the flap, stopping short.
    for (const side of [-1, 1]) {
      const corner: P2 = [side * HALF_W, -HALF_H];
      const end: P2 = [side * 0.3, -0.075];
      points.push(...alongPath([corner, end], 13, z, false, 0.08));
    }
  }

  // Rim: the remaining points close the thin edge between the two faces.
  points.push(...alongPath(outline, N_POINTS - points.length, 0, true));

  return points.slice(0, N_POINTS);
};

const invertYAxis = (points: Point3D[]): Point3D[] =>
  points.map((p) => ({ ...p, y: -p.y }));

export const MAIL_POINTS = orderForMorph(
  scaleShape(invertYAxis(normalizeShape(generateMailPoints())), 0.76),
);
