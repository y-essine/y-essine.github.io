import { N_POINTS } from "./constants";
import { type Point3D } from "./types";
import { fibonacciPoint, normalizeShape, scaleShape } from "./utils";

// Mail/Envelope - envelope outline with flap
const generateMailPoints = (scale: number): Point3D[] => {
  const points: Point3D[] = [];

  for (let i = 0; i < N_POINTS; i++) {
    const { theta, phi, t } = fibonacciPoint(i, N_POINTS);

    // Envelope dimensions
    const width = scale * 1.2;
    const height = scale * 0.8;
    const depth = scale * 0.3;

    // Determine which surface of the envelope
    const section = t * 6; // 6 surfaces: front, back, left, right, top, flap

    let x = 0,
      y = 0,
      z = 0;

    if (section < 1) {
      // Front face
      x = (Math.cos(theta) - 1) * width * 0.5;
      y = Math.cos(phi) * height * 0.5;
      z = -depth * 0.5;
    } else if (section < 2) {
      // Back face
      x = (Math.cos(theta) - 1) * width * 0.5;
      y = Math.cos(phi) * height * 0.5;
      z = depth * 0.5;
    } else if (section < 3) {
      // Left side
      x = -width * 0.5;
      y = Math.cos(phi) * height * 0.5;
      z = Math.sin(theta) * depth * 0.5;
    } else if (section < 4) {
      // Right side
      x = width * 0.5;
      y = Math.cos(phi) * height * 0.5;
      z = Math.sin(theta) * depth * 0.5;
    } else if (section < 5) {
      // Bottom edge
      x = Math.sin(theta) * width * 0.5;
      y = -height * 0.5;
      z = Math.sin(phi) * depth * 0.5;
    } else {
      // Triangular flap (pointing up)
      const flapV = (section - 5) * 2 * Math.PI;
      const flapEdge = Math.sin(flapV);
      x = Math.sin(theta) * width * flapEdge * 0.5;
      y = height * 0.5 + Math.abs(Math.cos(flapV)) * height * 0.4;
      z = Math.sin(phi) * depth * 0.3;
    }

    points.push({ x, y, z });
  }

  return points;
};

export const MAIL_POINTS = scaleShape(
  normalizeShape(generateMailPoints(120)),
  0.8
);
