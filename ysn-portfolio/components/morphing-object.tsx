"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  createGLRenderer,
  createObjectLoop,
  DEPTH_BUCKETS,
  DISTANCE,
  flattenShapes,
  GRADIENT_STOPS,
  INITIAL_CANVAS_SIZE,
  PARTICLE_ALPHA_MIN,
  PARTICLE_ALPHA_RANGE,
  PARTICLE_RADIUS_FLOOR,
  PARTICLE_RADIUS_MIN,
  PARTICLE_RADIUS_RANGE,
  PROJECTION_BASE,
  PROJECTION_FIT,
  type ObjectLoop,
  type ObjectRenderer,
  type ObjectWorkerRequest,
  type ObjectWorkerResponse,
  type ShapeData,
} from "./morphing-object-gl";

// Rendering normally happens in morphing-object.worker.ts, which also builds
// the point clouds, so the page itself does no per-frame work. The shapes are
// only loaded on the main thread (lazily, in their own chunk) when one of the
// fallbacks below has to draw here.
let shapeDataPromise: Promise<ShapeData> | null = null;
const loadShapeData = () =>
  (shapeDataPromise ??= import("./shapes").then((mod) =>
    flattenShapes(mod.ALL_SHAPES, mod.N_POINTS)
  ));

const NAV_HEIGHT = 46;
const TOP_SAFE_OFFSET = NAV_HEIGHT + 18;
const MAX_DPR = 3;
const SHAPE_CHANGE_DEBOUNCE_MS = 100;
const POSITION_EPSILON = 0.1;
// prefers-reduced-motion: shapes cross-fade instead of morphing.
const STILL_FADE_MS = 140;

const SECTION_STOPS = [
  { id: "hero", shape: 0 },
  { id: "proficiencies", shape: 1 },
  { id: "experience", shape: 2 },
  { id: "education", shape: 0 },
  { id: "projects", shape: 3 },
  { id: "project-detail-hero", shape: 3 },
  { id: "languages", shape: 5 },
  { id: "contact", shape: 4 },
] as const;

type SectionStop = (typeof SECTION_STOPS)[number];

interface ObjectState {
  currentShapeTo: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  canvasSize: number;
}

const noop = () => {};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.background = "transparent";
  canvas.style.transition = `opacity ${STILL_FADE_MS}ms linear`;
  return canvas;
}

/** Canvas 2D fallback, used when WebGL is unavailable or its context is lost. */
function create2DRenderer(
  canvas: HTMLCanvasElement,
  { points, shapeCount }: ShapeData
): ObjectRenderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const stride = shapeCount * 3;
  const count = points.length / stride;
  // Reused every frame so drawing allocates nothing.
  const sx = new Float32Array(count);
  const sy = new Float32Array(count);
  const sz = new Float32Array(count);
  const buckets = Array.from({ length: DEPTH_BUCKETS }, () => [] as number[]);
  let gradient: CanvasGradient | null = null;
  let size = INITIAL_CANVAS_SIZE;

  return {
    resize(cssSize, dpr) {
      size = cssSize;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, GRADIENT_STOPS[0]);
      gradient.addColorStop(0.5, GRADIENT_STOPS[1]);
      gradient.addColorStop(1, GRADIENT_STOPS[2]);
    },
    render(shapeFrom, shapeTo, t, angleY, angleX) {
      const tiltCos = Math.cos(angleX);
      const tiltSin = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const half = size * 0.5;
      const sizeRatio = size / INITIAL_CANVAS_SIZE;
      const projectionScale = PROJECTION_BASE * sizeRatio * PROJECTION_FIT;
      const fromOffset = shapeFrom * 3;
      const toOffset = shapeTo * 3;

      let zMin = 1e9;
      let zMax = -1e9;

      for (let i = 0; i < count; i++) {
        const from = i * stride + fromOffset;
        const to = i * stride + toOffset;
        const x = points[from] + (points[to] - points[from]) * t;
        const y = points[from + 1] + (points[to + 1] - points[from + 1]) * t;
        const z = points[from + 2] + (points[to + 2] - points[from + 2]) * t;

        const y1 = y * tiltCos - z * tiltSin;
        const z1 = y * tiltSin + z * tiltCos;
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        const denominator = DISTANCE + z2;
        const scale =
          Math.abs(denominator) < 0.0001 ? 1 : DISTANCE / denominator;
        sx[i] = half + x2 * scale * projectionScale;
        sy[i] = half + y1 * scale * projectionScale;
        sz[i] = z2;

        if (z2 < zMin) zMin = z2;
        if (z2 > zMax) zMax = z2;
      }

      ctx.clearRect(0, 0, size, size);

      const zRange = zMax - zMin || 1;
      for (let b = 0; b < DEPTH_BUCKETS; b++) buckets[b].length = 0;
      for (let i = 0; i < count; i++) {
        const normalized = (sz[i] - zMin) / zRange;
        // Invert depth bucket mapping so near particles land in higher buckets:
        // this keeps near points brighter and rendered on top.
        const bucket = clamp(
          Math.floor((1 - normalized) * DEPTH_BUCKETS),
          0,
          DEPTH_BUCKETS - 1
        );
        buckets[bucket].push(i);
      }

      if (gradient) ctx.fillStyle = gradient;
      const radiusScale = Math.max(PARTICLE_RADIUS_FLOOR, sizeRatio);
      for (let b = 0; b < DEPTH_BUCKETS; b++) {
        const bucket = buckets[b];
        if (!bucket.length) continue;
        const depthNorm = b / (DEPTH_BUCKETS - 1);
        const radius =
          (PARTICLE_RADIUS_MIN + depthNorm * PARTICLE_RADIUS_RANGE) *
          radiusScale;
        ctx.globalAlpha = PARTICLE_ALPHA_MIN + depthNorm * PARTICLE_ALPHA_RANGE;
        ctx.beginPath();
        for (let i = 0; i < bucket.length; i++) {
          const p = bucket[i];
          ctx.moveTo(sx[p] + radius, sy[p]);
          ctx.arc(sx[p], sy[p], radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    dispose: noop,
  };
}

export default function MorphingObject() {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const sectionElsRef = useRef<Array<{ el: HTMLElement; stop: SectionStop }>>(
    []
  );
  const pendingSectionIndexRef = useRef(0);
  const sectionChangeTimerRef = useRef<number | null>(null);
  const stateRef = useRef<ObjectState>({
    currentShapeTo: 0,
    currentX: 12,
    currentY: TOP_SAFE_OFFSET,
    targetX: 12,
    targetY: TOP_SAFE_OFFSET,
    canvasSize: 100,
  });
  // How the two effects talk: the renderer lives for the whole mount, the
  // section tracking is rebuilt on every route change.
  const linkRef = useRef({
    onTargetChange: noop,
    onShapeChange: noop,
    syncWithViewport: noop,
  });

  // Rendering. In order of preference:
  //   1. WebGL on an OffscreenCanvas in a worker (nothing per frame here),
  //   2. WebGL on the main thread (no OffscreenCanvas/worker support),
  //   3. Canvas 2D on the main thread (no WebGL, or its context was lost).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const state = stateRef.current;
    const link = linkRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let disposed = false;
    let resizeTimer = 0;
    let fadeTimer = 0;
    let dpr = 1;
    let pixels = INITIAL_CANVAS_SIZE;

    let worker: Worker | null = null;
    let workerCanvas: HTMLCanvasElement | null = null;
    // Main-thread fallbacks, created only when needed.
    let localLoop: ObjectLoop | null = null;
    let glCanvas: HTMLCanvasElement | null = null;
    let glRenderer: ObjectRenderer | null = null;
    let flatCanvas: HTMLCanvasElement | null = null;
    let flatRenderer: ObjectRenderer | null = null;
    let wantFlat = false;

    const getCanvasSize = () => {
      if (window.innerWidth < 420) return 64;
      if (window.innerWidth < 768) return 74;
      if (window.innerWidth < 1024) return 86;
      return 100;
    };

    const measure = () => {
      state.canvasSize = getCanvasSize();
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      pixels = Math.round(state.canvasSize * dpr);
      wrapper.style.width = `${state.canvasSize}px`;
      wrapper.style.height = `${state.canvasSize}px`;
    };

    const styleCanvas = (canvas: HTMLCanvasElement) => {
      canvas.style.width = `${state.canvasSize}px`;
      canvas.style.height = `${state.canvasSize}px`;
    };

    // For canvases drawn on this thread; the worker sizes its own.
    const sizeLocalCanvas = (
      canvas: HTMLCanvasElement | null,
      renderer: ObjectRenderer | null
    ) => {
      if (!canvas) return;
      styleCanvas(canvas);
      if (canvas.width !== pixels) canvas.width = pixels;
      if (canvas.height !== pixels) canvas.height = pixels;
      renderer?.resize(state.canvasSize, dpr);
    };

    const show = (canvas: HTMLCanvasElement) => {
      canvas.style.opacity = "1";
      if (canvas.parentNode !== wrapper) wrapper.replaceChildren(canvas);
    };

    const send = (message: ObjectWorkerRequest, transfer?: Transferable[]) =>
      worker?.postMessage(message, transfer ?? []);

    const setShape = (shape: number) => {
      send({ type: "shape", shape });
      localLoop?.setShape(shape);
    };

    const getLocalLoop = () =>
      (localLoop ??= createObjectLoop(state.currentShapeTo, reducedMotion));

    const drawFlat = () => {
      wantFlat = true;
      loadShapeData().then((shapeData) => {
        if (disposed || !wantFlat) return;
        flatCanvas ??= createCanvas();
        flatRenderer ??= create2DRenderer(flatCanvas, shapeData);
        sizeLocalCanvas(flatCanvas, flatRenderer);
        getLocalLoop().setRenderer(flatRenderer);
        show(flatCanvas);
      });
    };

    const startLocalGL = (shapeData: ShapeData) => {
      if (!glCanvas) return false;
      glRenderer = createGLRenderer(glCanvas, shapeData);
      if (!glRenderer) return false;
      wantFlat = false;
      sizeLocalCanvas(glCanvas, glRenderer);
      getLocalLoop().setRenderer(glRenderer);
      show(glCanvas);
      return true;
    };

    const onLocalContextLost = (event: Event) => {
      event.preventDefault(); // lets the browser restore it later
      glRenderer = null;
      drawFlat();
    };

    const onLocalContextRestored = () => {
      loadShapeData().then((shapeData) => {
        if (!disposed) startLocalGL(shapeData);
      });
    };

    const drawOnMainThread = () => {
      worker?.terminate();
      worker = null;
      workerCanvas = null;
      loadShapeData().then((shapeData) => {
        if (disposed) return;
        glCanvas = createCanvas();
        glCanvas.addEventListener("webglcontextlost", onLocalContextLost);
        glCanvas.addEventListener(
          "webglcontextrestored",
          onLocalContextRestored
        );
        if (!startLocalGL(shapeData)) drawFlat();
      });
    };

    const onWorkerMessage = ({ data }: MessageEvent<ObjectWorkerResponse>) => {
      if (data.type === "ready") {
        wantFlat = false;
        localLoop?.setRenderer(null);
        if (workerCanvas) show(workerCanvas);
      } else if (data.type === "lost") {
        drawFlat();
      } else {
        drawOnMainThread();
      }
    };

    const startWorker = () => {
      if (
        typeof Worker === "undefined" ||
        typeof OffscreenCanvas === "undefined" ||
        !("transferControlToOffscreen" in HTMLCanvasElement.prototype)
      ) {
        return false;
      }
      try {
        const canvas = createCanvas();
        styleCanvas(canvas);
        const offscreen = canvas.transferControlToOffscreen();
        worker = new Worker(
          new URL("./morphing-object.worker.ts", import.meta.url)
        );
        worker.onmessage = onWorkerMessage;
        worker.onerror = drawOnMainThread;
        workerCanvas = canvas;
        send(
          {
            type: "init",
            canvas: offscreen,
            pixels,
            cssSize: state.canvasSize,
            dpr,
            shape: state.currentShapeTo,
            reducedMotion,
          },
          [offscreen]
        );
        wrapper.replaceChildren(canvas);
        return true;
      } catch {
        worker?.terminate();
        worker = null;
        workerCanvas = null;
        return false;
      }
    };

    const resize = () => {
      measure();
      if (workerCanvas) styleCanvas(workerCanvas);
      send({ type: "resize", pixels, cssSize: state.canvasSize, dpr });
      sizeLocalCanvas(glCanvas, glRenderer);
      sizeLocalCanvas(flatCanvas, flatRenderer);
      localLoop?.invalidate();
    };

    const setCanvasOpacity = (opacity: string) => {
      if (workerCanvas) workerCanvas.style.opacity = opacity;
      if (glCanvas) glCanvas.style.opacity = opacity;
      if (flatCanvas) flatCanvas.style.opacity = opacity;
    };

    const onShapeChange = () => {
      if (!reducedMotion) {
        setShape(state.currentShapeTo);
        return;
      }
      // Reduced motion: fade out, swap the still frame, fade back in.
      setCanvasOpacity("0");
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => {
        setShape(state.currentShapeTo);
        setCanvasOpacity("1");
      }, STILL_FADE_MS);
    };

    const onMotionPreferenceChange = () => {
      reducedMotion = motionQuery.matches;
      window.clearTimeout(fadeTimer);
      send({ type: "motion", reducedMotion });
      localLoop?.setReducedMotion(reducedMotion);
      setShape(state.currentShapeTo);
      setCanvasOpacity("1");
      requestPosition();
    };

    // The wrapper glides to its target in a loop that only runs while it is
    // actually moving; once settled, nothing touches the DOM.
    let positionFrameId = 0;
    let positionTime = 0;
    let appliedX = Number.NaN;
    let appliedY = Number.NaN;

    const positionFrame = (ts: number) => {
      positionFrameId = 0;
      const dx = state.targetX - state.currentX;
      const dy = state.targetY - state.currentY;
      const dt = positionTime ? clamp((ts - positionTime) / 1000, 0, 0.05) : 0;
      if (
        reducedMotion ||
        (Math.abs(dx) < POSITION_EPSILON && Math.abs(dy) < POSITION_EPSILON)
      ) {
        state.currentX = state.targetX;
        state.currentY = state.targetY;
      } else {
        const posLerp = Math.min(1, dt * 10);
        state.currentX += dx * posLerp;
        state.currentY += dy * posLerp;
      }
      if (state.currentX !== appliedX || state.currentY !== appliedY) {
        appliedX = state.currentX;
        appliedY = state.currentY;
        wrapper.style.transform = `translate3d(${appliedX}px, ${appliedY}px, 0)`;
      }
      if (
        state.currentX === state.targetX &&
        state.currentY === state.targetY
      ) {
        positionTime = 0;
        return;
      }
      positionTime = ts;
      positionFrameId = window.requestAnimationFrame(positionFrame);
    };

    const requestPosition = () => {
      if (positionFrameId) return;
      if (state.targetX === appliedX && state.targetY === appliedY) return;
      positionFrameId = window.requestAnimationFrame(positionFrame);
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        link.syncWithViewport();
      }, 60);
    };

    measure();
    link.onTargetChange = requestPosition;
    link.onShapeChange = onShapeChange;
    if (!startWorker()) drawOnMainThread();

    motionQuery.addEventListener("change", onMotionPreferenceChange);
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(positionFrameId);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(fadeTimer);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      window.removeEventListener("resize", onResize);
      link.onTargetChange = noop;
      link.onShapeChange = noop;
      worker?.terminate();
      localLoop?.stop();
      glCanvas?.removeEventListener("webglcontextlost", onLocalContextLost);
      glCanvas?.removeEventListener(
        "webglcontextrestored",
        onLocalContextRestored
      );
      glRenderer?.dispose();
      wrapper.replaceChildren();
    };
  }, []);

  // Section tracking: which shape to show and where the object sits.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const state = stateRef.current;
    const link = linkRef.current;

    const morphToSection = (sectionIndex: number) => {
      if (sectionIndex === activeIndexRef.current) return;
      const target = sectionElsRef.current[sectionIndex];
      if (!target) return;
      activeIndexRef.current = sectionIndex;
      state.currentShapeTo = target.stop.shape;
      link.onShapeChange();
    };

    const queueMorphToSection = (sectionIndex: number) => {
      if (sectionIndex === activeIndexRef.current) {
        pendingSectionIndexRef.current = sectionIndex;
        if (sectionChangeTimerRef.current !== null) {
          window.clearTimeout(sectionChangeTimerRef.current);
          sectionChangeTimerRef.current = null;
        }
        return;
      }

      if (sectionIndex === pendingSectionIndexRef.current) return;
      pendingSectionIndexRef.current = sectionIndex;

      if (sectionChangeTimerRef.current !== null) {
        window.clearTimeout(sectionChangeTimerRef.current);
      }

      sectionChangeTimerRef.current = window.setTimeout(() => {
        morphToSection(pendingSectionIndexRef.current);
        sectionChangeTimerRef.current = null;
      }, SHAPE_CHANGE_DEBOUNCE_MS);
    };

    const refreshSectionElements = () => {
      sectionElsRef.current = SECTION_STOPS.flatMap((stop) => {
        const el = document.getElementById(stop.id);
        return el ? [{ el, stop }] : [];
      });
    };

    const findActiveSectionIndex = () => {
      const sections = sectionElsRef.current;
      if (!sections.length) return 0;

      // Over the last half-screen of scroll the probe slides toward the bottom
      // edge, so a short final section (contact) still activates on tall
      // desktop viewports where it never reaches the 42% line.
      const vh = window.innerHeight;
      const remaining =
        document.documentElement.scrollHeight - window.scrollY - vh;
      const endBlend = clamp(1 - remaining / (vh * 0.5), 0, 1);
      const probeY = vh * (0.42 + endBlend * 0.53);
      let bestIdx = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].el.getBoundingClientRect();
        const inside = probeY >= rect.top && probeY <= rect.bottom;
        if (inside) return i;
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - probeY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIdx = i;
        }
      }

      return bestIdx;
    };

    const positionWrapperAtSection = (sectionIndex: number) => {
      const target = sectionElsRef.current[sectionIndex];
      if (!target) return;

      const section = target.el;

      const rect = section.getBoundingClientRect();
      const titleEl = section.querySelector("h1, h2") as HTMLElement | null;
      const titleRect = titleEl?.getBoundingClientRect();
      const isCompact = window.innerWidth < 1024;
      const left = isCompact
        ? clamp(window.innerWidth - state.canvasSize - 22, 8, window.innerWidth)
        : clamp(
            rect.left - state.canvasSize - 22,
            10,
            window.innerWidth - state.canvasSize - 10
          );
      const titleAnchorTop = titleRect
        ? titleRect.top + titleRect.height * 0.5 - state.canvasSize * 0.5
        : rect.top + rect.height * 0.5 - state.canvasSize * 0.5;
      const compactTop = clamp(
        window.innerHeight - state.canvasSize - 14,
        TOP_SAFE_OFFSET,
        window.innerHeight - state.canvasSize - 20
      );
      const top = clamp(
        isCompact ? compactTop : titleAnchorTop,
        TOP_SAFE_OFFSET,
        window.innerHeight - state.canvasSize - 12
      );
      state.targetX = left;
      state.targetY = top;
      wrapper.style.opacity = "1";
    };

    const syncWithViewport = () => {
      if (!sectionElsRef.current.length) {
        refreshSectionElements();
      }
      const nextIdx = findActiveSectionIndex();
      queueMorphToSection(nextIdx);
      positionWrapperAtSection(nextIdx);
      link.onTargetChange();
    };

    const onScroll = () => {
      syncWithViewport();
    };

    link.syncWithViewport = syncWithViewport;
    refreshSectionElements();
    pendingSectionIndexRef.current = activeIndexRef.current;
    syncWithViewport();
    // Route transitions can briefly render before section ids are mounted.
    // Re-sync once on the next frame to avoid falling back to top-left.
    const resyncFrameId = window.requestAnimationFrame(() => {
      refreshSectionElements();
      syncWithViewport();
    });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(resyncFrameId);
      window.removeEventListener("scroll", onScroll);
      link.syncWithViewport = noop;
      if (sectionChangeTimerRef.current !== null) {
        window.clearTimeout(sectionChangeTimerRef.current);
        sectionChangeTimerRef.current = null;
      }
    };
  }, [pathname]);

  return (
    <div
      ref={wrapperRef}
      className="fixed left-0 top-0 z-20 pointer-events-none"
      style={{
        width: `${INITIAL_CANVAS_SIZE}px`,
        height: `${INITIAL_CANVAS_SIZE}px`,
        opacity: 0,
        willChange: "transform",
      }}
    />
  );
}
