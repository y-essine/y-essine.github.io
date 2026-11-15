"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { exposeApi, greetConsole } from "./console-greeting";
import {
  getLoadedExtras,
  getProjectLogoShape,
  getShape,
  loadShape,
  onExtraLoaded,
  SHAPE_NAMES,
  type LoadedShape,
} from "./morphing-object-extras";
import {
  appendShapes,
  createGLRenderer,
  createObjectLoop,
  DEPTH_BUCKETS,
  DISTANCE,
  flattenShapes,
  GRADIENT_STOPS,
  INITIAL_CANVAS_SIZE,
  MORPH_DUR,
  NEAR_PLANE,
  PARTICLE_ALPHA_MIN,
  PARTICLE_ALPHA_RANGE,
  PARTICLE_RADIUS_FLOOR,
  PARTICLE_RADIUS_MIN,
  PARTICLE_RADIUS_RANGE,
  PROJECTION_BASE,
  PROJECTION_FIT,
  type MorphStep,
  type ObjectLoop,
  type ObjectRenderer,
  type ObjectWorkerRequest,
  type ObjectWorkerResponse,
  type ShapeData,
} from "./morphing-object-gl";

// Rendering normally happens in morphing-object.worker.ts, which also builds
// the built-in point clouds, so the page itself does no per-frame work. Those
// shapes are only loaded on the main thread (lazily, in their own chunk) when
// one of the fallbacks below has to draw here. Project logos and easter-egg
// shapes are loaded on demand: see morphing-object-extras.ts.
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

const DETAIL_HERO_ID = "project-detail-hero";

// Easter eggs.
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const BURST_MS = 420;
const WORD_FORM_MS = 1000;
const WORD_HOLD_MS = 2800;
const SECRET_SHAPE = "rocket";
const SECRET_CLICKS = 5;
const SECRET_WINDOW_MS = 3000;
const SECRET_HOLD_MS = 5000;
// How long a shape asked for through window.yessine.morph() stays.
const API_HOLD_MS = 8000;
// Scrolling this far sends an egg back to the section's shape.
const SCROLL_RELEASE_PX = 32;

const SECTION_STOPS = [
  { id: "hero", shape: 0 },
  { id: "proficiencies", shape: 1 },
  { id: "experience", shape: 2 },
  { id: "education", shape: 0 },
  { id: "projects", shape: 3 },
  // A project with a logo shows that instead (getProjectLogoShape).
  { id: DETAIL_HERO_ID, shape: 3 },
  { id: "languages", shape: 5 },
  { id: "contact", shape: 4 },
] as const;

type SectionStop = (typeof SECTION_STOPS)[number];

interface ObjectState {
  /** The shape the current section calls for (an egg may be covering it). */
  sectionShape: number;
  /** Canvas enlargement while a wide egg plays (ObjectRenderer.resize). */
  stage: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  canvasSize: number;
}

const noop = () => {};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const stepFor = (shape: number): MorphStep => {
  const { sway, depthFloor } = getShape(shape);
  return { shape, sway, depthFloor };
};

// A canvas is never given a CSS size. It is shown at its backing-store size,
// scaled down by the pixel ratio (see styleCanvas) and centred on the wrapper.
// So when the worker resizes its canvas for an egg, the new size shows up
// together with the first frame drawn at it, not a stretched frame earlier.
function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const style = canvas.style;
  style.display = "block";
  style.position = "absolute";
  style.left = "50%";
  style.top = "50%";
  style.maxWidth = "none";
  style.background = "transparent";
  style.transition = `opacity ${STILL_FADE_MS}ms linear`;
  // Taps on the object are counted; don't let fast ones zoom the page.
  style.touchAction = "manipulation";
  style.userSelect = "none";
  style.setProperty("-webkit-tap-highlight-color", "transparent");
  return canvas;
}

/** Canvas 2D fallback, used when WebGL is unavailable or its context is lost. */
function create2DRenderer(
  canvas: HTMLCanvasElement,
  shapeData: ShapeData
): ObjectRenderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let points = shapeData.points;
  let stride = shapeData.shapeCount * 3;
  const count = points.length / stride;
  // Reused every frame so drawing allocates nothing.
  const sx = new Float32Array(count);
  const sy = new Float32Array(count);
  const sz = new Float32Array(count);
  const buckets = Array.from({ length: DEPTH_BUCKETS }, () => [] as number[]);
  let gradient: CanvasGradient | null = null;
  let size = INITIAL_CANVAS_SIZE;
  let canvasSize = INITIAL_CANVAS_SIZE;

  return {
    resize(cssSize, dpr, stage) {
      size = cssSize;
      canvasSize = cssSize * stage;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Spans the object's own square in the middle of the canvas.
      const start = (canvasSize - size) / 2;
      gradient = ctx.createLinearGradient(
        start,
        start,
        start + size,
        start + size
      );
      gradient.addColorStop(0, GRADIENT_STOPS[0]);
      gradient.addColorStop(0.5, GRADIENT_STOPS[1]);
      gradient.addColorStop(1, GRADIENT_STOPS[2]);
    },
    setData(next) {
      points = next.points;
      stride = next.shapeCount * 3;
    },
    render(shapeFrom, shapeTo, t, angleY, angleX, depthFloor) {
      const tiltCos = Math.cos(angleX);
      const tiltSin = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const half = canvasSize * 0.5;
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

        const scale = DISTANCE / Math.max(DISTANCE + z2, NEAR_PLANE);
        sx[i] = half + x2 * scale * projectionScale;
        sy[i] = half + y1 * scale * projectionScale;
        sz[i] = z2;

        if (z2 < zMin) zMin = z2;
        if (z2 > zMax) zMax = z2;
      }

      ctx.clearRect(0, 0, canvasSize, canvasSize);

      const zRange = Math.max(zMax - zMin, depthFloor) || 1;
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
  const activeIndexRef = useRef(-1);
  const sectionElsRef = useRef<Array<{ el: HTMLElement; stop: SectionStop }>>(
    []
  );
  const pendingSectionIndexRef = useRef(-1);
  const sectionChangeTimerRef = useRef<number | null>(null);
  const stateRef = useRef<ObjectState>({
    sectionShape: 0,
    stage: 1,
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
  // The easter eggs and window.yessine live here too: they are a few idle
  // listeners and timers on top of whichever renderer is drawing.
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
    let stageTimer = 0;
    let dpr = 1;
    let pixels = INITIAL_CANVAS_SIZE;
    // What is on screen (or being morphed to), to start a renderer with.
    let shown = stepFor(state.sectionShape);

    let worker: Worker | null = null;
    let workerCanvas: HTMLCanvasElement | null = null;
    // Main-thread fallbacks, created only when needed.
    let localLoop: ObjectLoop | null = null;
    let localData: ShapeData | null = null;
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
      pixels = Math.round(state.canvasSize * state.stage * dpr);
      wrapper.style.width = `${state.canvasSize}px`;
      wrapper.style.height = `${state.canvasSize}px`;
    };

    const styleCanvas = (canvas: HTMLCanvasElement) => {
      canvas.style.transform = `translate(-50%, -50%) scale(${1 / dpr})`;
      // Only the object itself takes clicks (for the five-click secret), so
      // the page stays clickable around it; an enlarged stage takes none.
      canvas.style.pointerEvents = state.stage > 1 ? "none" : "auto";
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
      renderer?.resize(state.canvasSize, dpr, state.stage);
    };

    const show = (canvas: HTMLCanvasElement) => {
      canvas.style.opacity = "1";
      if (canvas.parentNode !== wrapper) wrapper.replaceChildren(canvas);
    };

    const send = (message: ObjectWorkerRequest, transfer?: Transferable[]) =>
      worker?.postMessage(message, transfer ?? []);

    const play = (steps: MorphStep[]) => {
      shown = steps[steps.length - 1];
      send({ type: "play", steps });
      localLoop?.play(steps);
    };

    const getLocalLoop = () =>
      (localLoop ??= createObjectLoop(shown, reducedMotion));

    // Built-in shapes plus whichever on-demand ones have been loaded.
    const loadLocalData = () =>
      loadShapeData().then(
        (base) => (localData = appendShapes(base, getLoadedExtras()))
      );

    const stopListeningForExtras = onExtraLoaded((points) => {
      send({ type: "addShape", points });
      if (!localData) return;
      localData = appendShapes(localData, [points]);
      glRenderer?.setData(localData);
      flatRenderer?.setData(localData);
    });

    const drawFlat = () => {
      wantFlat = true;
      loadLocalData().then((shapeData) => {
        if (disposed || !wantFlat) return;
        flatCanvas ??= createCanvas();
        if (flatRenderer) flatRenderer.setData(shapeData);
        else flatRenderer = create2DRenderer(flatCanvas, shapeData);
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
      loadLocalData().then((shapeData) => {
        if (!disposed) startLocalGL(shapeData);
      });
    };

    const drawOnMainThread = () => {
      worker?.terminate();
      worker = null;
      workerCanvas = null;
      loadLocalData().then((shapeData) => {
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
        canvas.width = canvas.height = pixels;
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
            stage: state.stage,
            extras: [...getLoadedExtras()],
            step: shown,
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
      send({
        type: "resize",
        pixels,
        cssSize: state.canvasSize,
        dpr,
        stage: state.stage,
      });
      sizeLocalCanvas(glCanvas, glRenderer);
      sizeLocalCanvas(flatCanvas, flatRenderer);
      localLoop?.invalidate();
    };

    const setStage = (stage: number) => {
      if (stage === state.stage) return;
      state.stage = stage;
      resize();
      // An enlarged stage is kept on screen: the object may have to move.
      link.syncWithViewport();
    };

    const setCanvasOpacity = (opacity: string) => {
      if (workerCanvas) workerCanvas.style.opacity = opacity;
      if (glCanvas) glCanvas.style.opacity = opacity;
      if (flatCanvas) flatCanvas.style.opacity = opacity;
    };

    // Shows a sequence of morphs on a canvas enlarged by `stage`. With reduced
    // motion there is no sequence: the last shape is cross-faded in.
    const present = (steps: MorphStep[], stage: number) => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(stageTimer);
      if (reducedMotion) {
        setCanvasOpacity("0");
        fadeTimer = window.setTimeout(() => {
          setStage(stage);
          play(steps.slice(-1));
          setCanvasOpacity("1");
        }, STILL_FADE_MS);
        return;
      }
      // Grow the stage before anything needs the room; shrink it only once
      // everything is back inside.
      if (stage > state.stage) setStage(stage);
      play(steps);
      if (stage < state.stage) {
        const total = steps.reduce(
          (sum, step) => sum + (step.duration ?? MORPH_DUR),
          0
        );
        stageTimer = window.setTimeout(() => setStage(stage), total + 200);
      }
    };

    // An override is anything covering the section's shape for a while: an
    // egg, or a shape asked for through window.yessine.morph(). It ends on a
    // timer, when the page is scrolled, or when the section changes.
    let overriding = false;
    let overrideTimer = 0;
    let overrideScrollY = 0;
    let overrideStartedAt = 0;
    // Bumped whenever what should be shown changes, so a shape that finishes
    // downloading late knows it is no longer wanted.
    let requestId = 0;

    const showSection = () => present([stepFor(state.sectionShape)], 1);

    const dropOverride = () => {
      requestId++;
      if (!overriding) return false;
      overriding = false;
      window.clearTimeout(overrideTimer);
      window.removeEventListener("scroll", onOverrideScroll);
      return true;
    };

    const endOverride = () => {
      if (dropOverride()) showSection();
    };

    const onOverrideScroll = () => {
      // Arrow keys (e.g. the Konami code's ↓↓) can still be smooth-scrolling
      // when an egg starts; let that settle before scrolling ends it.
      if (performance.now() - overrideStartedAt < 500) {
        overrideScrollY = window.scrollY;
        return;
      }
      if (Math.abs(window.scrollY - overrideScrollY) > SCROLL_RELEASE_PX) {
        endOverride();
      }
    };

    const beginOverride = (holdMs: number) => {
      window.clearTimeout(overrideTimer);
      if (!overriding) {
        overriding = true;
        window.addEventListener("scroll", onOverrideScroll, { passive: true });
      }
      overrideScrollY = window.scrollY;
      overrideStartedAt = performance.now();
      overrideTimer = window.setTimeout(
        endOverride,
        holdMs + (reducedMotion ? STILL_FADE_MS : 0)
      );
    };

    const holdShape = (name: string, holdMs: number) => {
      const loading = loadShape(name);
      if (!loading) return false;
      const id = ++requestId;
      loading.then((shape) => {
        if (disposed || id !== requestId) return;
        beginOverride(MORPH_DUR + holdMs);
        present([stepFor(shape.index)], shape.stage);
      }, noop);
      return true;
    };

    // The Konami egg: burst apart, re-form as YESSINE, hold, flow back.
    const spellName = () => {
      const loading = [loadShape("burst"), loadShape("yessine")];
      if (!loading[0] || !loading[1]) return false;
      const id = ++requestId;
      Promise.all(loading as Promise<LoadedShape>[]).then(([burst, word]) => {
        if (disposed || id !== requestId) return;
        beginOverride(BURST_MS + WORD_FORM_MS + WORD_HOLD_MS);
        present(
          [
            // Already turning to face the viewer, so the word forms head-on.
            {
              shape: burst.index,
              duration: BURST_MS,
              ease: "out",
              sway: word.sway,
            },
            { ...stepFor(word.index), duration: WORD_FORM_MS },
          ],
          word.stage
        );
      }, noop);
      return true;
    };

    const morph = (name: string) => {
      if (typeof name !== "string" || !SHAPE_NAMES.includes(name)) return false;
      return name === "yessine" ? spellName() : holdShape(name, API_HOLD_MS);
    };

    let konamiAt = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        !event.key ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        target?.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? "")
      ) {
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === KONAMI[konamiAt]) {
        if (++konamiAt < KONAMI.length) return;
        konamiAt = 0;
        spellName();
      } else if (key === KONAMI[0]) {
        // A third "up" in a row still leaves two of them entered.
        konamiAt = konamiAt === 2 ? 2 : 1;
      } else {
        konamiAt = 0;
      }
    };

    const clickTimes: number[] = [];
    const onPointerDown = (event: PointerEvent) => {
      if (event.button) return;
      clickTimes.push(event.timeStamp);
      if (clickTimes.length > SECRET_CLICKS) clickTimes.shift();
      if (
        clickTimes.length === SECRET_CLICKS &&
        event.timeStamp - clickTimes[0] <= SECRET_WINDOW_MS
      ) {
        clickTimes.length = 0;
        holdShape(SECRET_SHAPE, SECRET_HOLD_MS);
        return;
      }
      // Every click is answered with a little spin.
      send({ type: "kick" });
      localLoop?.kick();
    };

    const onShapeChange = () => {
      dropOverride();
      showSection();
    };

    const onMotionPreferenceChange = () => {
      reducedMotion = motionQuery.matches;
      window.clearTimeout(fadeTimer);
      window.clearTimeout(stageTimer);
      dropOverride();
      send({ type: "motion", reducedMotion });
      localLoop?.setReducedMotion(reducedMotion);
      setStage(1);
      play([stepFor(state.sectionShape)]);
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
    window.addEventListener("keydown", onKeyDown);
    wrapper.addEventListener("pointerdown", onPointerDown);
    const hideApi = exposeApi({ morph, shapes: SHAPE_NAMES });
    greetConsole();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(positionFrameId);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(stageTimer);
      dropOverride();
      state.stage = 1;
      hideApi();
      stopListeningForExtras();
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      wrapper.removeEventListener("pointerdown", onPointerDown);
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
    let cancelled = false;

    // On a project page the object becomes that project's logo. Until the
    // logo's points have arrived it keeps whatever shape it had.
    const slug = pathname.match(/\/projects\/([^/?#]+)/)?.[1];
    const logoName = slug && getProjectLogoShape(decodeURIComponent(slug));
    const logoLoading = logoName ? loadShape(logoName) : null;
    let logoShape: number | null = null;
    let logoPending = logoLoading !== null;

    const applySection = (sectionIndex: number) => {
      const target = sectionElsRef.current[sectionIndex];
      if (!target) return;
      activeIndexRef.current = sectionIndex;
      const isDetail = target.stop.id === DETAIL_HERO_ID;
      if (isDetail && logoPending) return;
      const shape =
        isDetail && logoShape !== null ? logoShape : target.stop.shape;
      if (shape === state.sectionShape) return;
      state.sectionShape = shape;
      link.onShapeChange();
    };

    logoLoading
      ?.then(
        (shape) => {
          logoShape = shape.index;
        },
        noop // offline: the heart will do
      )
      .then(() => {
        if (cancelled) return;
        logoPending = false;
        applySection(activeIndexRef.current);
      });

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
        applySection(pendingSectionIndexRef.current);
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
      let left = isCompact
        ? clamp(window.innerWidth - state.canvasSize - 22, 8, window.innerWidth)
        : clamp(
            rect.left - state.canvasSize - 22,
            10,
            window.innerWidth - state.canvasSize - 10
          );
      if (state.stage > 1) {
        // An egg has the canvas enlarged for something wide. Centre it in the
        // gutter beside the content if there is one, and keep it on screen
        // (the word fills about 85% of the stage).
        if (!isCompact) {
          left = Math.min(left, (rect.left - state.canvasSize) / 2);
        }
        const reach = (state.stage - 1) * state.canvasSize * 0.5 * 0.85;
        left = clamp(
          left,
          reach,
          Math.max(reach, window.innerWidth - state.canvasSize - reach)
        );
      }
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
    // Section indices mean something else on every route: start over, and
    // let applySection decide whether the shape actually changes.
    activeIndexRef.current = -1;
    pendingSectionIndexRef.current = -1;
    syncWithViewport();
    // Route transitions can briefly render before section ids are mounted.
    // Re-sync once on the next frame to avoid falling back to top-left.
    const resyncFrameId = window.requestAnimationFrame(() => {
      refreshSectionElements();
      syncWithViewport();
    });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
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
