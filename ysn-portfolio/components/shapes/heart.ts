import { N_POINTS } from './constants';
import { HEART_DATA } from './heart_data';
import { type Point3D } from './types';
import { normalizeShape, orderForMorph } from './utils';

// Heart - a puffy 3D heart with evenly spread points. The even spread is
// expensive to compute, so it is baked offline into heart_data.ts
// (see scripts/shape-preview/gen-heart.mjs) and only unpacked here.
const generateHeartPoints = (): Point3D[] => {
  const points: Point3D[] = [];
  for (let i = 0; i < N_POINTS; i++) {
    // Wraps around if N_POINTS ever exceeds the baked count.
    const k = (i * 3) % HEART_DATA.length;
    points.push({ x: HEART_DATA[k], y: HEART_DATA[k + 1], z: HEART_DATA[k + 2] });
  }
  return points;
};

export const HEART_POINTS = orderForMorph(normalizeShape(generateHeartPoints()));
