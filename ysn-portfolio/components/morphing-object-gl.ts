// WebGL renderer for the morphing particle object.
//
// All shapes are uploaded as one interleaved vertex buffer
// ([shape0 xyz, shape1 xyz, ...] per point); it is only rebuilt when an
// on-demand shape (a project logo, an easter egg) is added. Morphing between two shapes only
// re-points two attributes into that buffer; the vertex shader interpolates,
// rotates, projects and derives the depth-based size and alpha. A frame is a
// handful of uniforms and a single drawArrays(POINTS).

export interface ObjectRenderer {
  /**
   * Call after the canvas backing store has been (re)sized. The canvas is a
   * square of `cssSize * stage` CSS pixels: `stage` > 1 gives the object room
   * to burst and to spell wide things, without changing its scale.
   */
  resize(cssSize: number, dpr: number, stage: number): void;
  /**
   * `depthFloor` is the smallest depth range the size/alpha falloff is spread
   * over, so the far side of a thin flat shape doesn't fade out.
   */
  render(
    shapeFrom: number,
    shapeTo: number,
    t: number,
    angleY: number,
    angleX: number,
    depthFloor: number
  ): void;
  /** Swaps in a shape set that has gained shapes. */
  setData(shapeData: ShapeData): void;
  dispose(): void;
}

export interface ShapeData {
  /** Per point: one xyz triple per shape, back to back. */
  points: Float32Array;
  shapeCount: number;
}

/** One morph in a sequence. */
export interface MorphStep {
  shape: number;
  /** Morph time in ms (default MORPH_DUR). */
  duration?: number;
  /** "out" starts fast and settles, for the burst. Default: ease in-out. */
  ease?: "inOut" | "out";
  /**
   * Flat shapes (logos, text) set this: instead of spinning, the object turns
   * to face the viewer and sways by this many radians either way.
   */
  sway?: number;
  /** See ObjectRenderer.render. */
  depthFloor?: number;
}

/** Drives a renderer: spin, tilt sway and shape morphs. */
export interface ObjectLoop {
  /** Starts drawing with this renderer; null pauses (e.g. context lost). */
  setRenderer(renderer: ObjectRenderer | null): void;
  /** Morphs through the steps in order, dropping whatever was queued. */
  play(steps: MorphStep[]): void;
  /** A nudge of extra spin that dies away (click feedback). */
  kick(): void;
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
// How quickly a swaying shape turns to face the viewer (time constant, ms).
const FACE_MS = 220;
const SWAY_SPEED = 0.0011; // rad/ms of the sway's sine
const KICK_SPEED = 0.009; // rad/ms added by a kick
const KICK_DECAY_MS = 320;
// Closest a point may get to the eye, so nothing blows up mid-burst.
export const NEAR_PLANE = 90;
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
uniform float uZoom; // 1 / stage
varying float vAlpha;
varying float vRadius;

void main() {
  vec3 p = mix(aFrom, aTo, uT);
  float y1 = p.y * uRot.z - p.z * uRot.w;
  float z1 = p.y * uRot.w + p.z * uRot.z;
  float x2 = p.x * uRot.x + z1 * uRot.y;
  float z2 = -p.x * uRot.y + z1 * uRot.x;
  // Canvas-size independent: (PROJECTION_BASE * size / 100) / (size / 2).
  float s = ${glsl(DISTANCE)} / max(${glsl(DISTANCE)} + z2, ${glsl(
    NEAR_PLANE
  )}) * uZoom * ${glsl(
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
uniform float uGrad; // 1 / (2 * object size in device px)
varying float vAlpha;
varying float vRadius;

void main() {
  float dist = length(gl_PointCoord - 0.5) * (2.0 * vRadius + 2.0);
  float coverage = clamp(vRadius + 0.5 - dist, 0.0, 1.0);
  // Same diagonal as createLinearGradient(0, 0, size, size) over the
  // object's own square in the middle of the (square) canvas.
  float g = clamp((gl_FragCoord.x - gl_FragCoord.y) * uGrad + 0.5, 0.0, 1.0);
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
  shapeData: ShapeData
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
  let data = shapeData.points;
  let stride = shapeData.shapeCount * 3;
  let strideBytes = stride * 4;
  let pointCount = data.length / stride;
  let boundFrom = -1;
  let boundTo = -1;

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
  const uZoom = ctx.getUniformLocation(program, "uZoom");

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

  return {
    resize(cssSize, dpr, stage) {
      ctx.viewport(0, 0, canvas.width, canvas.height);
      ctx.uniform1f(
        uPx,
        Math.max(PARTICLE_RADIUS_FLOOR, cssSize / INITIAL_CANVAS_SIZE) * dpr
      );
      ctx.uniform1f(uGrad, (0.5 * stage) / canvas.height);
      ctx.uniform1f(uZoom, 1 / stage);
    },
    setData(next) {
      data = next.points;
      stride = next.shapeCount * 3;
      strideBytes = stride * 4;
      pointCount = data.length / stride;
      boundFrom = boundTo = -1;
      ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW);
    },
    render(shapeFrom, shapeTo, t, angleY, angleX, depthFloor) {
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
      ctx.uniform2f(uDepth, zMin, 1 / (Math.max(zMax - zMin, depthFloor) || 1));
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

/** A copy of `base` with extra shapes (flat xyz triples each) appended. */
export function appendShapes(
  base: ShapeData,
  extras: ReadonlyArray<Float32Array>
): ShapeData {
  if (!extras.length) return base;
  const stride = base.shapeCount * 3;
  const pointCount = base.points.length / stride;
  const shapeCount = base.shapeCount + extras.length;
  const points = new Float32Array(pointCount * shapeCount * 3);
  for (let i = 0; i < pointCount; i++) {
    const o = i * shapeCount * 3;
    points.set(base.points.subarray(i * stride, (i + 1) * stride), o);
    for (let e = 0; e < extras.length; e++) {
      points.set(extras[e].subarray(i * 3, i * 3 + 3), o + stride + e * 3);
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
  initial: MorphStep,
  reducedMotion: boolean
): ObjectLoop {
  let renderer: ObjectRenderer | null = null;
  let reduced = reducedMotion;
  let shapeFrom = initial.shape;
  let shapeTo = initial.shape;
  let morphElapsed = MORPH_DUR;
  let morphDuration = MORPH_DUR;
  let easeOut = false;
  let queue: MorphStep[] = [];
  let sway = initial.sway ?? 0;
  let floorFrom = initial.depthFloor ?? 0;
  let floorTo = floorFrom;
  let spinBoost = 0;
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
      renderer.render(
        shapeTo,
        shapeTo,
        1,
        sway ? Math.min(sway, STILL_ANGLE_Y) : STILL_ANGLE_Y,
        TILT_BASE,
        floorTo
      );
      return;
    }

    const dt = lastTime
      ? Math.min(Math.max(ts - lastTime, 0), MAX_FRAME_MS)
      : 0;
    lastTime = ts;
    clock += dt;
    if (spinBoost) {
      angleY += spinBoost * dt;
      spinBoost *= Math.exp(-dt / KICK_DECAY_MS);
      if (spinBoost < 1e-5) spinBoost = 0;
    }
    if (sway) {
      // Turn the short way round to face the viewer, then rock gently.
      if (angleY > Math.PI) angleY -= Math.PI * 2;
      const target = sway * Math.sin(clock * SWAY_SPEED);
      angleY += (target - angleY) * (1 - Math.exp(-dt / FACE_MS));
    } else {
      angleY = (angleY + ROT_SPEED * dt * 0.001) % (Math.PI * 2);
    }
    if (morphElapsed < morphDuration) morphElapsed += dt;
    else if (queue.length) begin(queue.shift()!);

    const linear = Math.min(1, morphElapsed / morphDuration);
    const t = easeOut ? 1 - Math.pow(1 - linear, 3) : easeInOutCubic(linear);
    renderer.render(
      shapeFrom,
      shapeTo,
      t,
      angleY,
      TILT_BASE + Math.sin(clock * 0.00035) * TILT_SWAY,
      floorFrom + (floorTo - floorFrom) * t
    );
    frameId = requestAnimationFrame(frame);
  };

  const begin = (step: MorphStep) => {
    sway = step.sway ?? 0;
    if (step.shape === shapeTo) return;
    shapeFrom = shapeTo;
    shapeTo = step.shape;
    floorFrom = floorTo;
    floorTo = step.depthFloor ?? 0;
    morphDuration = step.duration ?? MORPH_DUR;
    easeOut = step.ease === "out";
    morphElapsed = reduced ? morphDuration : 0;
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
    play(steps) {
      if (!steps.length) return;
      // A still frame has no in-between: go straight to the last shape.
      const todo = reduced ? steps.slice(-1) : steps;
      queue = todo.slice(1);
      begin(todo[0]);
      stillDirty = true;
      request();
    },
    kick() {
      if (!reduced) spinBoost = KICK_SPEED;
    },
    setReducedMotion(next) {
      if (next === reduced) return;
      reduced = next;
      if (next) {
        morphElapsed = morphDuration;
        queue = [];
        spinBoost = 0;
      }
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
      stage: number;
      /** On-demand shapes loaded before this worker started. */
      extras: Float32Array[];
      step: MorphStep;
      reducedMotion: boolean;
    }
  | {
      type: "resize";
      pixels: number;
      cssSize: number;
      dpr: number;
      stage: number;
    }
  /** Appends a shape (flat xyz triples); its index is the next free one. */
  | { type: "addShape"; points: Float32Array }
  | { type: "play"; steps: MorphStep[] }
  | { type: "kick" }
  | { type: "motion"; reducedMotion: boolean };

export type ObjectWorkerResponse =
  // Drawing (again, after a restored context).
  | { type: "ready" }
  // WebGL can't be used here at all: render on the main thread instead.
  | { type: "unsupported" }
  // Context lost: cover with the 2D fallback until "ready" comes back.
  | { type: "lost" };
