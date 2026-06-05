"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-sm bg-transparent border border-border hover:border-foreground transition-colors"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hover:text-primary transition-colors" />
        ) : (
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hover:text-primary transition-colors" />
        )
      ) : (
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
    </button>
  );
}
