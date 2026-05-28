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
      className="font-mono text-xs text-muted-foreground tracking-widest px-2 py-1.5 min-w-10 rounded-sm bg-transparent border border-border hover:border-foreground hover:text-primary transition-colors"
      aria-label={`Switch to ${locale === "th" ? "English" : "Thai"}`}
      suppressHydrationWarning
    >
      {mounted ? (locale === "th" ? "TH" : "EN") : "TH"}
    </button>
  );
}
