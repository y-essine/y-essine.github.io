// A hello for whoever opens DevTools, and the `window.yessine` API it hints at.

import { CONTACT_EMAIL } from "./console-greeting-data";

export interface YessineApi {
  /** Morphs the particle object into a shape; false if the name is unknown. */
  morph(name: string): boolean;
  /** Every name `morph` accepts. */
  readonly shapes: readonly string[];
}

type YessineWindow = { yessine?: YessineApi };

/** Publishes the API as `window.yessine`; returns a function that removes it. */
export function exposeApi(api: YessineApi) {
  const host = window as unknown as YessineWindow;
  host.yessine = api;
  return () => {
    if (host.yessine === api) delete host.yessine;
  };
}

// YESSINE, in particles.
const BANNER = `
 •   •  •••••  •••••  •••••  •  •   •  •••••
  • •   •      •      •      •  ••  •  •
   •    ••••   •••••  •••••  •  • • •  ••••
   •    •          •      •  •  •  ••  •
   •    •••••  •••••  •••••  •  •   •  •••••
`;

let greeted = false;

/** Logs the greeting once per page load, when the browser is idle. */
export function greetConsole() {
  if (greeted) return;
  greeted = true;
  const say = () => {
    const mono = "font-family: ui-monospace, SFMono-Regular, Menlo, monospace;";
    console.log(
      `%c${BANNER}\n%ccurious? let's talk %c${CONTACT_EMAIL}\n\n` +
        `%cpsst, the particle thing takes requests: %cyessine.morph("heart")` +
        `%c  (yessine.shapes lists the rest)`,
      `${mono} color: #6f9dbf; line-height: 1.15;`,
      "font-size: 13px; font-weight: 600;",
      "font-size: 13px; color: #6f9dbf;",
      "color: #8a8f98;",
      `${mono} color: #6f9dbf;`,
      "color: #8a8f98;"
    );
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(say, { timeout: 4000 });
  } else {
    window.setTimeout(say, 1200);
  }
}
