"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<Locale>(currentLocale);
  const navTimerRef = useRef<number | null>(null);
  const isFrench = activeLocale === "fr";

  useEffect(() => {
    setActiveLocale(currentLocale);
  }, [currentLocale]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current !== null) {
        window.clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === activeLocale) return;
    setActiveLocale(newLocale);
    if (navTimerRef.current !== null) {
      window.clearTimeout(navTimerRef.current);
    }
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, "") || "/";
    navTimerRef.current = window.setTimeout(() => {
      router.push(`/${newLocale}${pathWithoutLocale}`);
      navTimerRef.current = null;
    }, 180);
  };

  return (
    <div
      className="relative inline-flex h-8 w-36 items-center overflow-hidden rounded-full border border-zinc-700/80 bg-zinc-900/70 p-1"
      role="group"
      aria-label="Language Switcher"
    >
      <span
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-zinc-200 transition-transform duration-300 ease-out ${
          isFrench ? "translate-x-0" : "translate-x-full"
        }`}
      />

      <button
        type="button"
        onClick={() => switchLocale("fr")}
        className={`relative z-10 inline-flex h-full w-1/2 items-center justify-center text-xs font-medium transition-colors duration-300 ${
          isFrench ? "text-zinc-900" : "text-zinc-400"
        }`}
        aria-pressed={isFrench}
        aria-label="Switch language to French"
      >
        FR
      </button>

      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={`relative z-10 inline-flex h-full w-1/2 items-center justify-center text-xs font-medium transition-colors duration-300 ${
          isFrench ? "text-zinc-400" : "text-zinc-900"
        }`}
        aria-pressed={!isFrench}
        aria-label="Switch language to English"
      >
        EN
      </button>
    </div>
  );
}
