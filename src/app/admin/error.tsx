"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("Admin page error:", error);
    setTimeout(() => setMounted(true), 0);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {mounted ? t("admin.error.title") : "Something went wrong!"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {mounted ? t("admin.error.failedToLoad").replace("{section}", "admin") : "Failed to load the admin section."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {mounted ? t("admin.error.tryAgain") : "Try again"}
        </button>
      </div>
    </div>
  );
}
