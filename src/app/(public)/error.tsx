"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("Public error:", error);
    setTimeout(() => setMounted(true), 0);
  }, [error]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md w-full">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
          {mounted ? t("error.title") : "Something went wrong!"}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium"
        >
          {mounted ? t("error.tryAgain") : "Try again"}
        </button>
      </div>
    </div>
  );
}
