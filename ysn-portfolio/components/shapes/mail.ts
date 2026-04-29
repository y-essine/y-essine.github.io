import { N_POINTS } from "./constants";
import { type Point3D } from "./types";
import { normalizeShape, scaleShape } from "./utils";

// Mail/Envelope - Unified envelope with integrated flap on body
const generateMailPoints = (): Point3D[] => {
  const points: Point3D[] = [];

  // Envelope proportions
  const w = 1.0;      // width
  const h = 0.65;     // height
  const d = 0.15;     // depth
  const flapH = 0.45; // flap height extension above body top

  // Front rectangular body (closed envelope)
  const bodyFrontPoints = 90;
  for (let i = 0; i < bodyFrontPoints && points.length < N_POINTS; i++) {
    const u = (i % 11) / 10;
    const v = Math.floor(i / 11) / (Math.ceil(bodyFrontPoints / 11) - 1);
    points.push({
      x: (u - 0.5) * w,
      y: (v - 0.5) * h,
      z: d,
    });
  }

  // Back rectangular body
  const bodyBackPoints = 90;
  for (let i = 0; i < bodyBackPoints && points.length < N_POINTS; i++) {
    const u = (i % 11) / 10;
    const v = Math.floor(i / 11) / (Math.ceil(bodyBackPoints / 11) - 1);
    points.push({
      x: (u - 0.5) * w,
      y: (v - 0.5) * h,
      z: -d,
    });
  }

  // Left and right sides of body
  const sideFrontPoints = 50;
  for (let i = 0; i < sideFrontPoints && points.length < N_POINTS; i++) {
    const v = i / (sideFrontPoints - 1);
    const z = -d + (2 * d * v);
    points.push({
      x: -w / 2,
      y: (v - 0.5) * h,
      z: z,
    });
    if (points.length < N_POINTS) {
      points.push({
        x: w / 2,
        y: (v - 0.5) * h,
        z: z,
      });
    }
  }

  // Bottom edge of body
  const bodyBottomPoints = 40;
  for (let i = 0; i < bodyBottomPoints && points.length < N_POINTS; i++) {
    const u = (i % 11) / 10;
    const z = -d + ((i / (bodyBottomPoints - 1)) * 2 * d);
    points.push({
      x: (u - 0.5) * w,
      y: -h / 2,
      z: z,
    });
  }

  // Integrated triangular flap - sits ON TOP of body
  // Left flap surface (from body top edge to tip)
  const flapLeftPoints = 120;
  for (let i = 0; i < flapLeftPoints && points.length < N_POINTS; i++) {
    const u = (i % 12) / 11;
    const v = Math.floor(i / 12) / (Math.ceil(flapLeftPoints / 12) - 1);
    
    // Flap edges: from left end of top to tip point
    const x = (u - 0.5) * w;
    const topY = h / 2;
    const tipY = topY + flapH;
    const tipX = 0;
    
    // Left side of flap (z = -d)
    const p1x = x;
    const p1y = topY;
    const p1z = -d;
    
    // Right side of flap (z = d)
    const p2x = x;
    const p2y = topY;
    const p2z = d;
    
    // Tip point (z = 0, centered)
    const p3x = tipX;
    const p3y = tipY;
    const p3z = 0;
    
    // Interpolate across the flap surface
    points.push({
      x: p1x * (1 - v) + p3x * v,
      y: p1y * (1 - v) + p3y * v,
      z: p1z * (1 - u) + p2z * u + (p3z - p1z * (1 - u) - p2z * u) * v,
    });
  }

  // Fill remaining points
  while (points.length < N_POINTS) {
    points.push({
      x: 0,
      y: h / 2,
      z: 0,
    });
  }

  return points.slice(0, N_POINTS);
};

const invertYAxis = (points: Point3D[]): Point3D[] =>
  points.map((p) => ({ ...p, y: -p.y }));

export const MAIL_POINTS = scaleShape(
  invertYAxis(normalizeShape(generateMailPoints())),
  0.85
);
