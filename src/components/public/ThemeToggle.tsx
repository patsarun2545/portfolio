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
      className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border border-border/50 shadow-sm"
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      )}
    </button>
  );
}
