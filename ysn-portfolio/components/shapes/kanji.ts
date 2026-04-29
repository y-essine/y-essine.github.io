import { type Point3D } from "./types";
import { normalizeShape, scaleShape } from "./utils";
import { KANJI_POINTS as KANJI_RAW } from "./kanji_data";

const invertYAxis = (points: Point3D[]): Point3D[] =>
  points.map((p) => ({ ...p, y: -p.y }));

export const KANJI_POINTS = scaleShape(
  invertYAxis(normalizeShape(KANJI_RAW)),
  0.9
);
