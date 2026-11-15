"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";

// Everything in this file ships in the initial bundle, so it stays tiny: one
// keydown listener and the lazy loader. The palette UI (and the portfolio data
// it searches) lives in ./command-palette and is only fetched on first open.

const TOGGLE_EVENT = "command-palette:toggle";

type PaletteModule = typeof import("./command-palette");
type PaletteProps = { lang: string; onClose: () => void };

let loader: Promise<PaletteModule> | null = null;

/** Starts downloading the palette chunk (idempotent). */
export function prefetchCommandPalette() {
  loader ??= import("./command-palette").catch((error) => {
    loader = null; // let a later attempt retry after a network blip
    throw error;
  });
  return loader;
}

/** Opens (or closes) the palette from anywhere, e.g. the navbar trigger. */
export function toggleCommandPalette() {
  window.dispatchEvent(new Event(TOGGLE_EVENT));
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export default function CommandPaletteHost({ lang }: { lang: string }) {
  const [open, setOpen] = useState(false);
  const [Palette, setPalette] = useState<ComponentType<PaletteProps> | null>(
    null
  );

  useEffect(() => {
    let alive = true;

    const load = () => {
      prefetchCommandPalette().then(
        (mod) => alive && setPalette(() => mod.default),
        () => alive && setOpen(false)
      );
    };
    const toggle = () => {
      load();
      setOpen((value) => !value);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.altKey || event.shiftKey) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      } else if (!mod && event.key === "/" && !isTypingTarget(event.target)) {
        event.preventDefault();
        load();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(TOGGLE_EVENT, toggle);
    return () => {
      alive = false;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(TOGGLE_EVENT, toggle);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return open && Palette ? <Palette lang={lang} onClose={close} /> : null;
}
