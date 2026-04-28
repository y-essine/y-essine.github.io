"use client";

import { type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/language-switcher";

type NavbarProps = {
  currentLocale: Locale;
};

export default function Navbar({ currentLocale }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-11.5 border-b border-zinc-800 bg-[#101011]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-20">
        <h1 className="truncate pr-3 text-xs text-zinc-400 sm:text-sm">
          {currentLocale === "fr" ? "Portfolio de Yassine" : "Yassine's Resume"}
        </h1>
        <div className="transition duration-200 hover:saturate-125">
          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
      </div>
    </nav>
  );
}
