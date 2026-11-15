import { type Point3D } from './types';
import { N_POINTS } from './constants';
import { normalizeShape, orderForMorph, scaleShape } from './utils';

// 文 ("writing / language"), built from its four strokes so the points can
// be spread evenly. Coordinates are in the original outline's space (y up);
// `w` is the stroke width.
type Stroke = { w: number; path: Array<[number, number]> };
const STROKES: Stroke[] = [
  // top tick
  { w: 0.088, path: [[0.42, 0.697], [0.42, 0.56]] },
  // horizontal bar
  { w: 0.085, path: [[0.058, 0.54], [0.781, 0.54]] },
  // left-falling sweep, from under the bar on the right to the bottom left
  {
    w: 0.09,
    path: [[0.583, 0.52], [0.565, 0.42], [0.53, 0.33], [0.482, 0.25], [0.42, 0.175], [0.34, 0.105], [0.25, 0.05], [0.155, 0.005], [0.07, -0.025]],
  },
  // right-falling sweep, from under the bar on the left to the bottom right
  {
    w: 0.09,
    path: [[0.215, 0.52], [0.262, 0.41], [0.31, 0.32], [0.37, 0.235], [0.45, 0.155], [0.55, 0.085], [0.66, 0.025], [0.775, -0.022]],
  },
];

const DEPTH = 0.1; // extrusion thickness, in glyph units
const LAYERS = 2;
const ROWS = 3; // rows of points across a stroke

// Point at distance `d` along a polyline, pushed sideways by `offset`.
const pointOnStroke = (path: Stroke['path'], d: number, offset: number): [number, number] => {
  let i = 1;
  for (; i < path.length; i++) {
    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    if (d <= l || i === path.length - 1) {
      const t = l ? d / l : 0;
      const dx = (path[i][0] - path[i - 1][0]) / (l || 1);
      const dy = (path[i][1] - path[i - 1][1]) / (l || 1);
      return [
        path[i - 1][0] + dx * l * t - dy * offset,
        path[i - 1][1] + dy * l * t + dx * offset,
      ];
    }
    d -= l;
  }
  return path[0];
};

// Kanji - each stroke is a ribbon of staggered rows, extruded into two layers.
const generateKanjiPoints = (): Point3D[] => {
  const lengths = STROKES.map((s) =>
    s.path.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - s.path[i - 1][0], p[1] - s.path[i - 1][1]) : 0), 0),
  );
  const totalLength = lengths.reduce((a, b) => a + b, 0);
  const lines = LAYERS * ROWS;
  const perLine = lengths.map((l) => Math.floor((N_POINTS / lines) * (l / totalLength)));
  let spare = N_POINTS - lines * perLine.reduce((a, b) => a + b, 0);

  const points: Point3D[] = [];
  STROKES.forEach((stroke, s) => {
    for (let layer = 0; layer < LAYERS; layer++) {
      const z = (layer / (LAYERS - 1) - 0.5) * DEPTH;
      for (let row = 0; row < ROWS; row++) {
        const count = perLine[s] + (spare > 0 ? 1 : 0);
        if (spare > 0) spare--;
        const offset = (row / (ROWS - 1) - 0.5) * stroke.w * 0.68;
        // The middle row is shifted half a step so the rows interlock.
        const shift = row % 2 ? 0.5 : 0.1;
        for (let k = 0; k < count; k++) {
          const d = ((k + shift) / (count - 0.3)) * lengths[s];
          const [x, y] = pointOnStroke(stroke.path, Math.min(d, lengths[s]), offset);
          points.push({ x, y, z });
        }
      }
    }
  });
  return points.slice(0, N_POINTS);
};

const invertYAxis = (points: Point3D[]): Point3D[] =>
  points.map((p) => ({ ...p, y: -p.y }));

export const KANJI_POINTS = orderForMorph(
  scaleShape(invertYAxis(normalizeShape(generateKanjiPoints())), 0.9),
);
