import { GOLDEN_RATIO, N_POINTS } from './constants';
import { type Point3D } from './types';
import { normalizeShape, orderForMorph } from './utils';

// Sphere - golden-spiral lattice with its poles on the spin axis (y), so the
// spiral arms sweep around as the object rotates.
const generateSpherePoints = (radius: number): Point3D[] => {
  const points: Point3D[] = [];
  for (let i = 0; i < N_POINTS; i++) {
    // Half-step offset keeps the two poles from collapsing to a single dot.
    const y = 1 - (2 * (i + 0.5)) / N_POINTS;
    const ring = Math.sqrt(1 - y * y);
    const theta = (2 * Math.PI * i) / GOLDEN_RATIO;
    points.push({
      x: radius * ring * Math.cos(theta),
      y: radius * y,
      z: radius * ring * Math.sin(theta),
    });
  }
  return points;
};

export const SPHERE_POINTS = orderForMorph(
  normalizeShape(generateSpherePoints(100)),
);
