import { GOLDEN_RATIO, N_POINTS } from './constants';
import { type Point3D } from './types';
import { normalizeShape, orderForMorph, scaleShape } from './utils';

// Lean of the ring's axis away from the viewer, so it wobbles as it spins
// instead of flipping between a flat disc and a straight bar.
const AXIS_LEAN = 0.5;

const TUBE_RINGS = 14;

// Torus - concentric rings of points running around the hole. Each ring gets a
// point count proportional to its circumference (even spacing everywhere, no
// radial spokes) and a golden-ratio phase so neighbouring rings interlock.
const generateTorusPoints = (major: number, minor: number): Point3D[] => {
  const points: Point3D[] = [];
  const cosL = Math.cos(AXIS_LEAN);
  const sinL = Math.sin(AXIS_LEAN);

  // Share N_POINTS between the rings by circumference (largest remainder).
  const radii = Array.from({ length: TUBE_RINGS }, (_, j) =>
    major + minor * Math.cos((2 * Math.PI * (j + 0.5)) / TUBE_RINGS),
  );
  const radiusSum = radii.reduce((a, b) => a + b, 0);
  const exact = radii.map((r) => (N_POINTS * r) / radiusSum);
  const counts = exact.map(Math.floor);
  let missing = N_POINTS - counts.reduce((a, b) => a + b, 0);
  const byRemainder = exact.map((v, j) => [v - counts[j], j]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; missing > 0; k++, missing--) counts[byRemainder[k][1]]++;

  for (let j = 0; j < TUBE_RINGS; j++) {
    const v = (2 * Math.PI * (j + 0.5)) / TUBE_RINGS;
    const z = minor * Math.sin(v);
    const phase = (j / GOLDEN_RATIO) % 1;
    for (let i = 0; i < counts[j]; i++) {
      const u = (2 * Math.PI * (i + phase)) / counts[j];
      const x = radii[j] * Math.cos(u);
      const y = radii[j] * Math.sin(u);
      points.push({ x, y: y * cosL - z * sinL, z: y * sinL + z * cosL });
    }
  }
  return points;
};

export const TORUS_POINTS = orderForMorph(
  scaleShape(normalizeShape(generateTorusPoints(50, 20)), 1.14),
);
