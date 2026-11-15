// Renders the morphing object off the main thread: this worker owns the
// canvas (OffscreenCanvas), the WebGL context and the animation loop, so a
// frame costs the page nothing. It also generates the point clouds here.

import { ALL_SHAPES, N_POINTS } from "./shapes";
import {
  createGLRenderer,
  createObjectLoop,
  flattenShapes,
  type ObjectLoop,
  type ObjectRenderer,
  type ObjectWorkerRequest,
  type ObjectWorkerResponse,
} from "./morphing-object-gl";

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ObjectWorkerRequest>) => void) | null;
  postMessage(message: ObjectWorkerResponse): void;
};

let canvas: OffscreenCanvas | null = null;
let renderer: ObjectRenderer | null = null;
let loop: ObjectLoop | null = null;
let cssSize = 100;
let dpr = 1;

const shapeData = flattenShapes(ALL_SHAPES, N_POINTS);

const startRenderer = () => {
  if (!canvas || !loop) return false;
  renderer = createGLRenderer(canvas, shapeData);
  if (!renderer) return false;
  renderer.resize(cssSize, dpr);
  loop.setRenderer(renderer);
  return true;
};

scope.onmessage = ({ data: message }) => {
  switch (message.type) {
    case "init": {
      canvas = message.canvas;
      canvas.width = canvas.height = message.pixels;
      cssSize = message.cssSize;
      dpr = message.dpr;
      if (typeof requestAnimationFrame !== "function") {
        scope.postMessage({ type: "unsupported" });
        return;
      }
      loop = createObjectLoop(message.shape, message.reducedMotion);
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault(); // lets the browser restore it later
        renderer = null;
        loop?.setRenderer(null);
        scope.postMessage({ type: "lost" });
      });
      canvas.addEventListener("webglcontextrestored", () => {
        if (startRenderer()) scope.postMessage({ type: "ready" });
      });
      scope.postMessage({ type: startRenderer() ? "ready" : "unsupported" });
      return;
    }
    case "resize": {
      if (!canvas) return;
      cssSize = message.cssSize;
      dpr = message.dpr;
      if (canvas.width !== message.pixels) {
        canvas.width = canvas.height = message.pixels;
      }
      renderer?.resize(cssSize, dpr);
      loop?.invalidate();
      return;
    }
    case "shape":
      loop?.setShape(message.shape);
      return;
    case "motion":
      loop?.setReducedMotion(message.reducedMotion);
      return;
  }
};
