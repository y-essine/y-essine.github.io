import { type Point3D } from "./types";
import { N_POINTS } from "./constants";
import { normalizeShape, scaleShape } from "./utils";
import { KANJI_POINTS_RAW as KANJI_RAW } from "./kanji_data_new";

const invertYAxis = (points: Point3D[]): Point3D[] =>
  points.map((p) => ({ ...p, y: -p.y }));

// Create 3D kanji by replicating 2D outline on front and back
const create3DKanji = (points: Point3D[]): Point3D[] => {
  const result: Point3D[] = [];
  const depth = 0.2; // thickness

  // Front face (z = depth/2)
  for (const p of points) {
    result.push({ ...p, z: depth / 2 });
  }

  // Back face (z = -depth/2)
  for (const p of points) {
    result.push({ ...p, z: -depth / 2 });
  }

  // Edge strokes connecting front to back
  for (const p of points) {
    const steps = 3;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      result.push({
        x: p.x,
        y: p.y,
        z: -depth / 2 + (depth * t),
      });
    }
  }

  // Duplicate to fill to N_POINTS if needed
  while (result.length < N_POINTS) {
    result.push(result[result.length % points.length]);
  }

  return result.slice(0, N_POINTS);
};

export const KANJI_POINTS = scaleShape(
  invertYAxis(normalizeShape(create3DKanji(KANJI_RAW))),
  0.9
);
