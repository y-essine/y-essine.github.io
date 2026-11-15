import { N_POINTS } from './constants';
import { type Point3D } from './types';
import { normalizeShape, orderForMorph, scaleShape } from './utils';

// Cube - a crisp wireframe (dense edges) with a light grid on each face.
const FACE_GRID = 6; // 6 x 6 points per face
const generateCubePoints = (size: number): Point3D[] => {
  const points: Point3D[] = [];
  const s = size / 2;
  const signs = [-1, 1];

  // 8 corners
  for (const x of signs)
    for (const y of signs) for (const z of signs) points.push({ x: x * s, y: y * s, z: z * s });

  // 12 edges share whatever is left after corners and faces.
  const faceTotal = 6 * FACE_GRID * FACE_GRID;
  const perEdge = Math.floor((N_POINTS - 8 - faceTotal) / 12);
  const edgePoint = (axis: number, t: number, a: number, b: number): Point3D => {
    const v = [0, 0, 0];
    v[axis] = t;
    v[(axis + 1) % 3] = a * s;
    v[(axis + 2) % 3] = b * s;
    return { x: v[0], y: v[1], z: v[2] };
  };
  for (let axis = 0; axis < 3; axis++)
    for (const a of signs)
      for (const b of signs)
        for (let i = 1; i <= perEdge; i++)
          points.push(edgePoint(axis, -s + (2 * s * i) / (perEdge + 1), a, b));

  // Faces: inset grid, so the faces read as surfaces without blurring the edges.
  const leftover = N_POINTS - points.length - faceTotal;
  for (let axis = 0; axis < 3; axis++)
    for (const side of signs)
      for (let i = 0; i < FACE_GRID; i++)
        for (let j = 0; j < FACE_GRID; j++) {
          const u = ((i + 0.5) / FACE_GRID) * 2 - 1;
          const w = ((j + 0.5) / FACE_GRID) * 2 - 1;
          const v = [0, 0, 0];
          v[axis] = side * s;
          v[(axis + 1) % 3] = u * s * 0.9;
          v[(axis + 2) % 3] = w * s * 0.9;
          points.push({ x: v[0], y: v[1], z: v[2] });
        }

  // Any rounding remainder goes to the centre lines of the faces.
  for (let i = 0; i < leftover; i++) {
    const axis = i % 3;
    const side = signs[Math.floor(i / 3) % 2];
    const v = [0, 0, 0];
    v[axis] = side * s;
    v[(axis + 1) % 3] = (((Math.floor(i / 6) + 1) * 0.37) % 1) * s - s / 2;
    points.push({ x: v[0], y: v[1], z: v[2] });
  }
  return points.slice(0, N_POINTS);
};

export const CUBE_POINTS = orderForMorph(
  scaleShape(normalizeShape(generateCubePoints(150)), 0.75),
);
