"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { N_POINTS, ALL_SHAPES_X, ALL_SHAPES_Y, ALL_SHAPES_Z } from "./shapes";

const NAV_HEIGHT = 46;
const TOP_SAFE_OFFSET = NAV_HEIGHT + 18;
const INITIAL_CANVAS_SIZE = 100;
const MAX_DPR = 8; // anti-aliasing
const DISTANCE = 360;
const ROT_SPEED = 0.42;
const TILT_BASE = 0.22;
const TILT_SWAY = 0.07;
const MORPH_DUR = 760;
const SHAPE_CHANGE_DEBOUNCE_MS = 100;
const DEPTH_BUCKETS = 8;
const PARTICLE_COUNT = N_POINTS;
const PARTICLE_RADIUS_MIN = 1;
const PARTICLE_RADIUS_RANGE = 0.42;
const PROJECTION_BASE = 0.34;

const SECTION_STOPS = [
  { id: "hero", shape: 0 },
  { id: "proficiencies", shape: 1 },
  { id: "experience", shape: 2 },
  { id: "education", shape: 3 },
  { id: "projects", shape: 1 },
] as const;

interface ParticleState {
  sx: Float32Array;
  sy: Float32Array;
  sz: Float32Array;
  angleY: number;
  lastTime: number;
  currentShapeFrom: number;
  currentShapeTo: number;
  morphStart: number;
  morphT: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  canvasSize: number;
}

function easeInOutCubic(t: number): number {
  if (t < 0.5) return 4 * t * t * t;
  return 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function MorphingObject() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const sectionElsRef = useRef<HTMLElement[]>([]);
  const pendingSectionIndexRef = useRef(0);
  const sectionChangeTimerRef = useRef<number | null>(null);
  const stateRef = useRef<ParticleState>({
    sx: new Float32Array(PARTICLE_COUNT),
    sy: new Float32Array(PARTICLE_COUNT),
    sz: new Float32Array(PARTICLE_COUNT),
    angleY: 0,
    lastTime: 0,
    currentShapeFrom: 0,
    currentShapeTo: 0,
    morphStart: 0,
    morphT: 1,
    currentX: 12,
    currentY: TOP_SAFE_OFFSET,
    targetX: 12,
    targetY: TOP_SAFE_OFFSET,
    canvasSize: 100,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    let animationFrameId = 0;
    let resizeTimer = 0;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(max, Math.max(min, value));

    const getCanvasSize = () => {
      if (window.innerWidth < 420) return 64;
      if (window.innerWidth < 768) return 74;
      if (window.innerWidth < 1024) return 86;
      return 100;
    };

    const resizeCanvas = () => {
      state.canvasSize = getCanvasSize();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.style.width = `${state.canvasSize}px`;
      canvas.style.height = `${state.canvasSize}px`;
      canvas.width = Math.round(state.canvasSize * dpr);
      canvas.height = Math.round(state.canvasSize * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wrapper.style.width = `${state.canvasSize}px`;
      wrapper.style.height = `${state.canvasSize}px`;
    };

    const morphToSection = (sectionIndex: number, now: number) => {
      if (sectionIndex === activeIndexRef.current) return;
      activeIndexRef.current = sectionIndex;
      state.currentShapeFrom = state.currentShapeTo;
      state.currentShapeTo = SECTION_STOPS[sectionIndex].shape;
      state.morphStart = now;
      state.morphT = 0;
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
        morphToSection(pendingSectionIndexRef.current, performance.now());
        sectionChangeTimerRef.current = null;
      }, SHAPE_CHANGE_DEBOUNCE_MS);
    };

    const refreshSectionElements = () => {
      sectionElsRef.current = SECTION_STOPS.map((stop) =>
        document.getElementById(stop.id)
      ).filter((el): el is HTMLElement => Boolean(el));
    };

    const findActiveSectionIndex = () => {
      const sections = sectionElsRef.current;
      if (!sections.length) return 0;

      const probeY = window.innerHeight * 0.42;
      let bestIdx = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < sections.length; i++) {
        const rect = sections[i].getBoundingClientRect();
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
      const section = sectionElsRef.current[sectionIndex];
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const titleEl = section.querySelector("h1, h2") as HTMLElement | null;
      const titleRect = titleEl?.getBoundingClientRect();
      const isCompact = window.innerWidth < 1024;
      const left = isCompact
        ? clamp(window.innerWidth - state.canvasSize - 10, 8, window.innerWidth)
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
        window.innerHeight - state.canvasSize - 8
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
    };

    const onScroll = () => {
      syncWithViewport();
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeCanvas();
        syncWithViewport();
      }, 60);
    };

    const draw = (ts: number) => {
      const dt = Math.min((ts - state.lastTime) / 1000, 0.05);
      state.lastTime = ts;
      state.angleY += ROT_SPEED * dt;
      const posLerp = Math.min(1, dt * 10);
      state.currentX += (state.targetX - state.currentX) * posLerp;
      state.currentY += (state.targetY - state.currentY) * posLerp;
      wrapper.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0)`;

      const rawMorph = clamp((ts - state.morphStart) / MORPH_DUR, 0, 1);
      state.morphT = easeInOutCubic(rawMorph);

      const t = state.morphT;
      const shapeFrom = state.currentShapeFrom;
      const shapeTo = state.currentShapeTo;
      const angleX = TILT_BASE + Math.sin(ts * 0.00035) * TILT_SWAY;
      const tiltCos = Math.cos(angleX);
      const tiltSin = Math.sin(angleX);
      const cosY = Math.cos(state.angleY);
      const sinY = Math.sin(state.angleY);
      const HW = state.canvasSize * 0.5;
      const HH = state.canvasSize * 0.5;
      const sizeRatio = state.canvasSize / INITIAL_CANVAS_SIZE;
      const projectionScale = PROJECTION_BASE * sizeRatio * 0.96;

      let zMin = 1e9;
      let zMax = -1e9;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const pointX = ALL_SHAPES_X[i];
        const pointY = ALL_SHAPES_Y[i];
        const pointZ = ALL_SHAPES_Z[i];

        const fromX = pointX ? pointX[shapeFrom] : 0;
        const fromY = pointY ? pointY[shapeFrom] : 0;
        const fromZ = pointZ ? pointZ[shapeFrom] : 0;
        const toX = pointX ? pointX[shapeTo] : 0;
        const toY = pointY ? pointY[shapeTo] : 0;
        const toZ = pointZ ? pointZ[shapeTo] : 0;

        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        const z = fromZ + (toZ - fromZ) * t;

        const y1 = y * tiltCos - z * tiltSin;
        const z1 = y * tiltSin + z * tiltCos;
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        const denominator = DISTANCE + z2;
        const scale =
          Math.abs(denominator) < 0.0001 ? 1 : DISTANCE / denominator;
        const sx = HW + x2 * scale * projectionScale;
        const sy = HH + y1 * scale * projectionScale;
        const safeZ = Number.isFinite(z2) ? z2 : 0;

        state.sx[i] = Number.isFinite(sx) ? sx : HW;
        state.sy[i] = Number.isFinite(sy) ? sy : HH;
        state.sz[i] = safeZ;

        if (safeZ < zMin) zMin = safeZ;
        if (safeZ > zMax) zMax = safeZ;
      }

      ctx.clearRect(0, 0, state.canvasSize, state.canvasSize);

      const gradient = ctx.createLinearGradient(
        0,
        0,
        state.canvasSize,
        state.canvasSize
      );
      gradient.addColorStop(0, "#8fb6d2");
      gradient.addColorStop(0.5, "#f3f5f8");
      gradient.addColorStop(1, "#8ea0b2");

      const zRange = zMax - zMin || 1;
      const buckets = Array.from(
        { length: DEPTH_BUCKETS },
        () => [] as number[]
      );
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const normalized = (state.sz[i] - zMin) / zRange;
        // Invert depth bucket mapping so near particles land in higher buckets:
        // this keeps near points brighter and rendered on top.
        const rawBucket = Math.floor((1 - normalized) * DEPTH_BUCKETS);
        const bucket = Number.isFinite(rawBucket)
          ? clamp(rawBucket, 0, DEPTH_BUCKETS - 1)
          : 0;
        buckets[bucket]?.push(i);
      }

      ctx.fillStyle = gradient;
      // Temporarily disable additive glow blending.
      // ctx.globalCompositeOperation = 'lighter';
      ctx.globalCompositeOperation = "source-over";
      for (let b = 0; b < DEPTH_BUCKETS; b++) {
        const bucket = buckets[b];
        if (!bucket.length) continue;
        const depthNorm = b / (DEPTH_BUCKETS - 1);
        const radiusScale = Math.max(0.72, sizeRatio);
        const radius =
          (PARTICLE_RADIUS_MIN + depthNorm * PARTICLE_RADIUS_RANGE) *
          radiusScale;
        const alpha = 0.12 + depthNorm * 0.58;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let i = 0; i < bucket.length; i++) {
          const p = bucket[i];
          ctx.moveTo(state.sx[p] + radius, state.sy[p]);
          ctx.arc(state.sx[p], state.sy[p], radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      animationFrameId = window.requestAnimationFrame(draw);
    };

    refreshSectionElements();
    resizeCanvas();
    pendingSectionIndexRef.current = activeIndexRef.current;
    syncWithViewport();
    // Route transitions can briefly render before section ids are mounted.
    // Re-sync once on the next frame to avoid falling back to top-left.
    window.requestAnimationFrame(() => {
      refreshSectionElements();
      syncWithViewport();
    });
    animationFrameId = window.requestAnimationFrame(draw);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      if (sectionChangeTimerRef.current !== null) {
        window.clearTimeout(sectionChangeTimerRef.current);
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
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${INITIAL_CANVAS_SIZE}px`,
          height: `${INITIAL_CANVAS_SIZE}px`,
          display: "block",
          background: "transparent",
        }}
      />
    </div>
  );
}
