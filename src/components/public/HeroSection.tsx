"use client";

import { Download, MapPin } from "lucide-react";
import { About } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";
import ScrollToContactButton from "./ScrollToContactButton";

interface HeroSectionProps {
  about: About;
}

export default function HeroSection({ about }: HeroSectionProps) {
  const { locale, t } = useLocale();
  const title = locale === "th" ? (about.titleTh || about.title) : about.title;
  const location = locale === "th" ? (about.locationTh || about.location) : about.location;
  const availability = locale === "th"
    ? ((about as About & { availabilityTh?: string }).availabilityTh || (about as About & { availability?: string }).availability)
    : (about as About & { availability?: string }).availability;

  return (
    <section id="hero" className="flex items-center pt-32 pb-20 md:pt-36 md:pb-24 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto animate-fade-in-up w-full">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-primary" />
            <span className="font-mono text-xs text-primary tracking-widest uppercase">Portfolio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-none mb-4">
            {about.name}
          </h1>

          {(about.yearsOfExperience ?? 0) > 0 && (
            <p className="font-mono text-sm md:text-base text-primary font-medium tracking-wider mb-4">
              {about.yearsOfExperience}+ {about.yearsOfExperience === 1 ? "Year" : "Years"} of Experience
            </p>
          )}

          {/* Title + availability badge inline */}
          <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
            <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
              {title}<span className="animate-blink text-primary ml-1">_</span>
            </p>
            {availability && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 font-mono text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {availability}
              </span>
            )}
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{location}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            {about.resumeUrl && (
              <a
                href={about.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity"
                aria-label={`${t("hero.downloadResume")} (opens in new tab)`}
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                {t("hero.downloadResume")}
              </a>
            )}
            <ScrollToContactButton />
          </div>

          <div className="flex flex-wrap gap-4">
            {about.githubUrl && (
              <a
                href={about.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                aria-label={`${t("hero.github")} (opens in new tab)`}
              >
                {t("hero.github")} ↗
              </a>
            )}
            {about.linkedinUrl && (
              <a
                href={about.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors"
                aria-label={`${t("hero.linkedin")} (opens in new tab)`}
              >
                {t("hero.linkedin")} ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[18vw] font-black text-border leading-none opacity-30 z-0 hidden md:block pointer-events-none select-none" aria-hidden="true">
        {about.name.split(" ")[0]}
      </span>
    </section>
  );
}