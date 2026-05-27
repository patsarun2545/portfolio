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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <h1 className="text-4xl font-bold text-foreground mb-4">{mounted ? t("admin.adminNotFound.title") : "404"}</h1>
      <p className="text-xl text-muted-foreground mb-8">{mounted ? t("admin.adminNotFound.subtitle") : "Admin Page Not Found"}</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {mounted ? t("admin.adminNotFound.description") : "The admin page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href="/admin/dashboard"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        {mounted ? t("admin.adminNotFound.goToDashboard") : "Go to Dashboard"}
      </Link>
    </div>
  );
}
