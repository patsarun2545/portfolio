"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.error("Global error:", error);
    setTimeout(() => setMounted(true), 0);
  }, [error]);
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                {mounted ? t("error.title") : "Something went wrong!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error.message || (mounted ? "An unexpected error occurred" : "An unexpected error occurred")}
              </p>
              <button
                onClick={reset}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium"
              >
                {mounted ? t("error.tryAgain") : "Try again"}
              </button>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
