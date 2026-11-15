"use client";
import { ArrowDownLeft } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const PROJECT_CLICK_STORAGE_KEY = "isClickedBefore";
const HINT_CHANGE_EVENT = "click-here-hint-change";

const readClickedBefore = () => {
  try {
    return localStorage.getItem(PROJECT_CLICK_STORAGE_KEY) === "true";
  } catch {
    return true; // storage blocked: don't nag
  }
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(HINT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(HINT_CHANGE_EVENT, onChange);
  };
};

const ClickHere = () => {
  // Server render and hydration show nothing; the client then reads storage.
  const shouldShowHint = useSyncExternalStore(
    subscribe,
    () => !readClickedBefore(),
    () => false
  );

  useEffect(() => {
    if (!shouldShowHint) return;

    const handleProjectLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('a[href*="/projects/"]')) return;

      try {
        localStorage.setItem(PROJECT_CLICK_STORAGE_KEY, "true");
      } catch {}
      window.dispatchEvent(new Event(HINT_CHANGE_EVENT));
    };

    document.addEventListener("click", handleProjectLinkClick, true);
    return () => {
      document.removeEventListener("click", handleProjectLinkClick, true);
    };
  }, [shouldShowHint]);

  if (!shouldShowHint) {
    return null;
  }

  return (
    <div className="absolute top-0 -right-28 animate-pulse hidden xl:block">
      <div className="text-sm text-gray-500">
        <span className="ml-6">Click here!</span>
        <ArrowDownLeft size={32} strokeWidth={2} />
      </div>
    </div>
  );
};

export default ClickHere;
