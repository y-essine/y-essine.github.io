"use client";

import { useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";
import {
  prefetchCommandPalette,
  toggleCommandPalette,
} from "@/components/command-palette-host";

type NavbarProps = {
  currentLocale: Locale;
};

const subscribeNever = () => () => {};
const isApplePlatform = () => /Mac|iPhone|iPad/.test(navigator.platform);

export default function Navbar({ currentLocale }: NavbarProps) {
  const isFrench = currentLocale === "fr";
  // Server render says "Ctrl K"; Macs swap to the ⌘ glyph on hydration.
  const isApple = useSyncExternalStore(
    subscribeNever,
    isApplePlatform,
    () => false
  );
  const warmUp = () => void prefetchCommandPalette().catch(() => {});

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-11.5 border-b border-zinc-800 bg-[#101011]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-20">
        <h1 className="truncate pr-3 text-xs text-zinc-400 sm:text-sm">
          {isFrench ? "Portfolio de Yassine" : "Yassine's Resume"}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleCommandPalette}
            onPointerEnter={warmUp}
            onFocus={warmUp}
            aria-label={isFrench ? "Ouvrir la recherche" : "Open search"}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            className="inline-flex h-8 w-8 items-center justify-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/70 text-zinc-400 transition-colors duration-200 hover:border-zinc-600 hover:text-zinc-200 focus-visible:border-zinc-500 focus-visible:text-zinc-200 focus-visible:outline-none md:w-auto md:pl-3 md:pr-1.5"
          >
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden text-xs md:inline">
              {isFrench ? "Rechercher" : "Search"}
            </span>
            <kbd className="hidden h-5 items-center rounded-full border border-zinc-700/80 px-1.5 font-sans text-[10px] font-medium text-zinc-500 md:inline-flex">
              {isApple ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
          <div className="transition duration-200 hover:saturate-125">
            <LanguageSwitcher currentLocale={currentLocale} />
          </div>
        </div>
      </div>
    </nav>
  );
}
