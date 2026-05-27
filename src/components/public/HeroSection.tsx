"use client";

import { Download } from "lucide-react";
import { About } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";
import ScrollToContactButton from "./ScrollToContactButton";

interface HeroSectionProps {
  about: About;
}

export default function HeroSection({ about }: HeroSectionProps) {
  const { locale, t } = useLocale();
  const title = locale === "th" ? (about.titleTh || about.title) : about.title;
  const bio = locale === "th" ? (about.bioTh || about.bio) : about.bio;

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center animate-fade-in-up w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
          {about.name}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-foreground mb-4 sm:mb-6">
          {title}
        </p>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
          {bio}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
          {about.resumeUrl && (
            <a
              href={about.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base font-medium"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t("hero.downloadResume")}
            </a>
          )}
          <ScrollToContactButton />
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          {about.githubUrl && (
            <a
              href={about.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm sm:text-base font-medium"
            >
              {t("hero.github")}
            </a>
          )}
          {about.linkedinUrl && (
            <a
              href={about.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm sm:text-base font-medium"
            >
              {t("hero.linkedin")}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
