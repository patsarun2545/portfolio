"use client";

import { useLocale } from "@/hooks/useLocale";
import { useState, useEffect } from "react";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Standard pattern to prevent hydration mismatch with localStorage
  }, []);

  return (
    <button
      onClick={() => setLocale(locale === "th" ? "en" : "th")}
      className="text-xs font-bold px-2 py-1.5 rounded-md bg-linear-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all"
      aria-label={`Switch to ${locale === "th" ? "English" : "Thai"}`}
      suppressHydrationWarning
    >
      {mounted ? (locale === "th" ? "TH" : "EN") : "TH"}
    </button>
  );
}
