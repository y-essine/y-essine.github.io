// WebGL renderer for the morphing particle object.
//
// All shapes are uploaded once as one interleaved vertex buffer
// ([shape0 xyz, shape1 xyz, ...] per point). Morphing between two shapes only
// re-points two attributes into that buffer; the vertex shader interpolates,
// rotates, projects and derives the depth-based size and alpha. A frame is a
// handful of uniforms and a single drawArrays(POINTS).

export interface ObjectRenderer {
  /** Call after the canvas backing store has been (re)sized. */
  resize(cssSize: number, dpr: number): void;
  render(
    shapeFrom: number,
    shapeTo: number,
    t: number,
    angleY: number,
    angleX: number
  ): void;
  dispose(): void;
}

export interface ShapeData {
  /** Per point: one xyz triple per shape, back to back. */
  points: Float32Array;
  shapeCount: number;
}

/** Drives a renderer: spin, tilt sway and shape morphs. */
export interface ObjectLoop {
  /** Starts drawing with this renderer; null pauses (e.g. context lost). */
  setRenderer(renderer: ObjectRenderer | null): void;
  setShape(shape: number): void;
  setReducedMotion(reduced: boolean): void;
  /** Redraw after a resize. */
  invalidate(): void;
  stop(): void;
}

export const DISTANCE = 360;
export const INITIAL_CANVAS_SIZE = 100;
export const DEPTH_BUCKETS = 8;
export const PARTICLE_RADIUS_MIN = 1;
export const PARTICLE_RADIUS_RANGE = 0.42;
export const PARTICLE_RADIUS_FLOOR = 0.72;
export const PARTICLE_ALPHA_MIN = 0.12;
export const PARTICLE_ALPHA_RANGE = 0.58;
export const PROJECTION_BASE = 0.34;
export const PROJECTION_FIT = 0.96;
export const ROT_SPEED = 0.42; // rad/s
export const TILT_BASE = 0.22;
export const TILT_SWAY = 0.07;
export const MORPH_DUR = 760;
// prefers-reduced-motion: a still three-quarter view instead of a spin.
export const STILL_ANGLE_Y = 0.45;
// Longest step a single frame may advance, so a resumed tab doesn't jump.
const MAX_FRAME_MS = 50;
// Diagonal gradient stops (top-left, middle, bottom-right).
export const GRADIENT_STOPS = ["#8fb6d2", "#f3f5f8", "#8ea0b2"] as const;

const glsl = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
const glslColor = (hex: string) =>
  `vec3(${[1, 3, 5]
    .map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(5))
    .join(", ")})`;

// The 2D version sorts points into DEPTH_BUCKETS bands; here the band is a
// continuous value that passes through the same band centres, so points no
// longer pop when they cross a band boundary.
const VERTEX_SHADER = `
attribute vec3 aFrom;
attribute vec3 aTo;
uniform float uT;
uniform vec4 uRot;   // cosY, sinY, cosX, sinX
uniform vec2 uDepth; // zMin, 1 / zRange
uniform float uPx;   // device pixels per unit of particle radius
varying float vAlpha;
varying float vRadius;

void main() {
  vec3 p = mix(aFrom, aTo, uT);
  float y1 = p.y * uRot.z - p.z * uRot.w;
  float z1 = p.y * uRot.w + p.z * uRot.z;
  float x2 = p.x * uRot.x + z1 * uRot.y;
  float z2 = -p.x * uRot.y + z1 * uRot.x;
  // Canvas-size independent: (PROJECTION_BASE * size / 100) / (size / 2).
  float s = ${glsl(DISTANCE)} / (${glsl(DISTANCE)} + z2) * ${glsl(
    (PROJECTION_BASE * PROJECTION_FIT * 2) / INITIAL_CANVAS_SIZE
  )};
  float near = 1.0 - (z2 - uDepth.x) * uDepth.y;
  float depth = clamp(
    (near * ${glsl(DEPTH_BUCKETS)} - 0.5) / ${glsl(DEPTH_BUCKETS - 1)},
    0.0,
    1.0
  );
  vRadius = (${glsl(PARTICLE_RADIUS_MIN)} + depth * ${glsl(
    PARTICLE_RADIUS_RANGE
  )}) * uPx;
  vAlpha = ${glsl(PARTICLE_ALPHA_MIN)} + depth * ${glsl(PARTICLE_ALPHA_RANGE)};
  gl_Position = vec4(x2 * s, -y1 * s, 0.0, 1.0);
  // One extra pixel each side for the anti-aliased edge.
  gl_PointSize = 2.0 * vRadius + 2.0;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec2 uGrad; // canvas height in device px, 1 / (2 * height)
varying float vAlpha;
varying float vRadius;

void main() {
  float dist = length(gl_PointCoord - 0.5) * (2.0 * vRadius + 2.0);
  float coverage = clamp(vRadius + 0.5 - dist, 0.0, 1.0);
  // Same diagonal as createLinearGradient(0, 0, size, size).
  float g = (gl_FragCoord.x + uGrad.x - gl_FragCoord.y) * uGrad.y;
  vec3 color = g < 0.5
    ? mix(${glslColor(GRADIENT_STOPS[0])}, ${glslColor(
      GRADIENT_STOPS[1]
    )}, g * 2.0)
    : mix(${glslColor(GRADIENT_STOPS[1])}, ${glslColor(
      GRADIENT_STOPS[2]
    )}, g * 2.0 - 1.0);
  float a = vAlpha * coverage;
  gl_FragColor = vec4(color * a, a); // premultiplied
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Returns null when WebGL is unavailable (or software-only), so the
 * caller can fall back to Canvas 2D on a different canvas.
 *
 * Calling it again on the same canvas after `webglcontextrestored` rebuilds
 * the GPU resources.
 */
export function createGLRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  { points: data, shapeCount }: ShapeData
): ObjectRenderer | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = (canvas as HTMLCanvasElement).getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false, // dots are anti-aliased in the fragment shader
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
      // A software rasterizer would cost more than the 2D fallback.
      failIfMajorPerformanceCaveat: true,
    });
  } catch {
    gl = null;
  }
  if (!gl || gl.isContextLost()) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!vs || !fs || !program || !buffer) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aFrom");
  gl.bindAttribLocation(program, 1, "aTo");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    return null;
  }

  const ctx = gl;
  const stride = shapeCount * 3;
  const strideBytes = stride * 4;
  const pointCount = data.length / stride;

  ctx.useProgram(program);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
  ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
  ctx.enableVertexAttribArray(0);
  ctx.enableVertexAttribArray(1);

  const uT = ctx.getUniformLocation(program, "uT");
  const uRot = ctx.getUniformLocation(program, "uRot");
  const uDepth = ctx.getUniformLocation(program, "uDepth");
  const uPx = ctx.getUniformLocation(program, "uPx");
  const uGrad = ctx.getUniformLocation(program, "uGrad");

  // Every fragment at a given pixel has the same gradient colour and nearer
  // dots are more opaque, so keeping the per-pixel maximum puts near dots on
  // top without sorting or a depth buffer, and overlapping dots don't pile up
  // into white (the 2D version fills each depth band as one path, which has
  // the same effect). Plain "over" blending is the fallback.
  const minMax = ctx.getExtension("EXT_blend_minmax");
  ctx.enable(ctx.BLEND);
  if (minMax) ctx.blendEquation(minMax.MAX_EXT);
  else ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.clearColor(0, 0, 0, 0);

  let boundFrom = -1;
  let boundTo = -1;

  return {
    resize(cssSize, dpr) {
      ctx.viewport(0, 0, canvas.width, canvas.height);
      ctx.uniform1f(
        uPx,
        Math.max(PARTICLE_RADIUS_FLOOR, cssSize / INITIAL_CANVAS_SIZE) * dpr
      );
      ctx.uniform2f(uGrad, canvas.height, 0.5 / canvas.height);
    },
    render(shapeFrom, shapeTo, t, angleY, angleX) {
      if (shapeFrom !== boundFrom) {
        ctx.vertexAttribPointer(
          0,
          3,
          ctx.FLOAT,
          false,
          strideBytes,
          shapeFrom * 12
        );
        boundFrom = shapeFrom;
      }
      if (shapeTo !== boundTo) {
        ctx.vertexAttribPointer(
          1,
          3,
          ctx.FLOAT,
          false,
          strideBytes,
          shapeTo * 12
        );
        boundTo = shapeTo;
      }

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Depth extent of the rotated cloud, for normalising size and alpha.
      // Rotated depth is linear in the point: z2 = dx*x + dy*y + dz*z.
      const dx = -sinY;
      const dy = sinX * cosY;
      const dz = cosX * cosY;
      let zMin = 1e9;
      let zMax = -1e9;
      if (t >= 1 || shapeFrom === shapeTo) {
        for (let i = shapeTo * 3; i < data.length; i += stride) {
          const z = dx * data[i] + dy * data[i + 1] + dz * data[i + 2];
          if (z < zMin) zMin = z;
          if (z > zMax) zMax = z;
        }
      } else {
        const delta = (shapeTo - shapeFrom) * 3;
        for (let i = shapeFrom * 3; i < data.length; i += stride) {
          const j = i + delta;
          const zFrom = dx * data[i] + dy * data[i + 1] + dz * data[i + 2];
          const zTo = dx * data[j] + dy * data[j + 1] + dz * data[j + 2];
          const z = zFrom + (zTo - zFrom) * t;
          if (z < zMin) zMin = z;
          if (z > zMax) zMax = z;
        }
      }

      ctx.uniform1f(uT, t);
      ctx.uniform4f(uRot, cosY, sinY, cosX, sinX);
      ctx.uniform2f(uDepth, zMin, 1 / (zMax - zMin || 1));
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.POINTS, 0, pointCount);
    },
    dispose() {
      ctx.deleteBuffer(buffer);
      ctx.deleteProgram(program);
      // Free the context now instead of waiting for garbage collection.
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export function flattenShapes(
  shapes: ReadonlyArray<ReadonlyArray<{ x: number; y: number; z: number }>>,
  pointCount: number
): ShapeData {
  const shapeCount = shapes.length;
  const points = new Float32Array(pointCount * shapeCount * 3);
  let o = 0;
  for (let i = 0; i < pointCount; i++) {
    for (let s = 0; s < shapeCount; s++) {
      const point = shapes[s][i];
      points[o++] = point?.x ?? 0;
      points[o++] = point?.y ?? 0;
      points[o++] = point?.z ?? 0;
    }
  }
  return { points, shapeCount };
}

function easeInOutCubic(t: number): number {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * The animation loop, shared by the worker and the main-thread fallback.
 * It runs on its own clock that only advances while frames are drawn, so
 * nothing jumps after the tab was hidden. With reduced motion it draws single
 * still frames on demand and keeps no requestAnimationFrame loop alive.
 */
export function createObjectLoop(
  initialShape: number,
  reducedMotion: boolean
): ObjectLoop {
  let renderer: ObjectRenderer | null = null;
  let reduced = reducedMotion;
  let shapeFrom = initialShape;
  let shapeTo = initialShape;
  let morphElapsed = MORPH_DUR;
  let angleY = 0;
  let clock = 0;
  let lastTime = 0;
  let frameId = 0;
  let stillDirty = true;

  const frame = (ts: number) => {
    frameId = 0;
    if (!renderer) return;

    if (reduced) {
      lastTime = 0;
      if (!stillDirty) return;
      stillDirty = false;
      renderer.render(shapeTo, shapeTo, 1, STILL_ANGLE_Y, TILT_BASE);
      return;
    }

    const dt = lastTime
      ? Math.min(Math.max(ts - lastTime, 0), MAX_FRAME_MS)
      : 0;
    lastTime = ts;
    clock += dt;
    angleY = (angleY + ROT_SPEED * dt * 0.001) % (Math.PI * 2);
    if (morphElapsed < MORPH_DUR) morphElapsed += dt;

    renderer.render(
      shapeFrom,
      shapeTo,
      easeInOutCubic(Math.min(1, morphElapsed / MORPH_DUR)),
      angleY,
      TILT_BASE + Math.sin(clock * 0.00035) * TILT_SWAY
    );
    frameId = requestAnimationFrame(frame);
  };

  const request = () => {
    if (!frameId && renderer) frameId = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
  };

  return {
    setRenderer(next) {
      renderer = next;
      stillDirty = true;
      if (next) request();
      else stop();
    },
    setShape(shape) {
      if (shape === shapeTo) return;
      shapeFrom = shapeTo;
      shapeTo = shape;
      morphElapsed = reduced ? MORPH_DUR : 0;
      stillDirty = true;
      request();
    },
    setReducedMotion(next) {
      if (next === reduced) return;
      reduced = next;
      if (next) morphElapsed = MORPH_DUR;
      stillDirty = true;
      lastTime = 0;
      request();
    },
    invalidate() {
      stillDirty = true;
      request();
    },
    stop,
  };
}

// Messages between the page and morphing-object.worker.ts.
export type ObjectWorkerRequest =
  | {
      type: "init";
      canvas: OffscreenCanvas;
      pixels: number;
      cssSize: number;
      dpr: number;
      shape: number;
      reducedMotion: boolean;
    }
  | { type: "resize"; pixels: number; cssSize: number; dpr: number }
  | { type: "shape"; shape: number }
  | { type: "motion"; reducedMotion: boolean };

export type ObjectWorkerResponse =
  // Drawing (again, after a restored context).
  | { type: "ready" }
  // WebGL can't be used here at all: render on the main thread instead.
  | { type: "unsupported" }
  // Context lost: cover with the 2D fallback until "ready" comes back.
  | { type: "lost" };
