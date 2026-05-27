"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";

export default function NotFound() {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 sm:px-6">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground mb-4">{mounted ? t("notFound.title") : "404"}</h1>
      <p className="text-xl sm:text-2xl text-muted-foreground mb-6 sm:mb-8">{mounted ? t("notFound.subtitle") : "Page Not Found"}</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {mounted ? t("notFound.description") : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href="/"
        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium"
      >
        {mounted ? t("notFound.returnHome") : "Return Home"}
      </Link>
    </div>
  );
}
