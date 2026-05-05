"use client";
import { ArrowDownLeft } from "lucide-react";
import { useEffect, useState } from "react";

const PROJECT_CLICK_STORAGE_KEY = "isClickedBefore";

const ClickHere = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldShowHint, setShouldShowHint] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const storedValue = localStorage.getItem(PROJECT_CLICK_STORAGE_KEY);

    if (storedValue === null) {
      localStorage.setItem(PROJECT_CLICK_STORAGE_KEY, "false");
    }

    const clickedBefore = storedValue === "true";

    if (clickedBefore) {
      setShouldShowHint(false);
      return;
    }

    setShouldShowHint(true);

    const handleProjectLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const projectLink = target?.closest('a[href*="/projects/"]');

      if (!projectLink) {
        return;
      }

      localStorage.setItem(PROJECT_CLICK_STORAGE_KEY, "true");
      setShouldShowHint(false);
    };

    document.addEventListener("click", handleProjectLinkClick, true);

    return () => {
      document.removeEventListener("click", handleProjectLinkClick, true);
    };
  }, []);

  if (!isMounted || !shouldShowHint) {
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
