import { N_POINTS } from "./constants";
import { type Point3D } from "./types";
import { fibonacciPoint, normalizeShape, scaleShape } from "./utils";

// Kanji Character - Stylized Japanese character (火 - fire)
const generateKanjiPoints = (scale: number): Point3D[] => {
  const points: Point3D[] = [];

  for (let i = 0; i < N_POINTS; i++) {
    const { theta, phi, t } = fibonacciPoint(i, N_POINTS);

    // Create a stylized kanji-like shape by distributing points
    // across multiple geometric strokes
    const section = t * 8;
    const u = theta;
    const v = phi;

    let x = 0,
      y = 0,
      z = 0;

    // Top horizontal stroke
    if (section < 1) {
      x = Math.sin(u) * scale * 0.6;
      y = scale * 0.7;
      z = Math.cos(u) * scale * 0.15;
    }
    // Left vertical stroke
    else if (section < 2) {
      x = -scale * 0.3;
      y = Math.cos(v) * scale * 0.8;
      z = Math.sin(u) * scale * 0.15;
    }
    // Right vertical stroke
    else if (section < 3) {
      x = scale * 0.3;
      y = Math.cos(v) * scale * 0.8;
      z = Math.sin(u) * scale * 0.15;
    }
    // Middle horizontal stroke
    else if (section < 4) {
      x = Math.sin(u) * scale * 0.5;
      y = 0;
      z = Math.cos(u) * scale * 0.15;
    }
    // Bottom left stroke (diagonal)
    else if (section < 5) {
      const t2 = section - 4;
      x = -scale * 0.4 * (1 - t2) + Math.sin(u) * scale * 0.15;
      y = scale * 0.7 * (1 - t2) - scale * 0.8 * t2;
      z = Math.sin(u) * scale * 0.15;
    }
    // Bottom right stroke (diagonal)
    else if (section < 6) {
      const t2 = section - 5;
      x = scale * 0.4 * (1 - t2) + Math.sin(u) * scale * 0.15;
      y = scale * 0.7 * (1 - t2) - scale * 0.8 * t2;
      z = Math.sin(u) * scale * 0.15;
    }
    // Bottom horizontal stroke
    else if (section < 7) {
      x = Math.sin(u) * scale * 0.5;
      y = -scale * 0.8;
      z = Math.cos(u) * scale * 0.15;
    }
    // Central thick area (adds body)
    else {
      x = Math.sin(u) * scale * 0.35 * Math.abs(Math.cos(v));
      y = Math.cos(v) * scale * 0.5;
      z = Math.sin(phi * 2) * scale * 0.25;
    }

    points.push({ x, y, z });
  }

  return points;
};

export const KANJI_POINTS = scaleShape(
  normalizeShape(generateKanjiPoints(100)),
  0.85
);
