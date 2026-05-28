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
          <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase mt-4 mb-6">
            {title}<span className="animate-blink text-primary ml-1">_</span>
          </p>
          <p className="text-sm md:text-base text-muted-foreground leading-loose max-w-xl mb-10">
            {bio}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            {about.resumeUrl && (
              <a
                href={about.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
