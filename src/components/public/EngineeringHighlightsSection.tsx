"use client";

import Image from "next/image";
import { useLocale } from "@/hooks/useLocale";
import type { EngineeringHighlight } from "@/types";

interface EngineeringHighlightsSectionProps {
  highlights: EngineeringHighlight[];
}

export default function EngineeringHighlightsSection({ highlights }: EngineeringHighlightsSectionProps) {
  const { locale, t } = useLocale();

  return (
    <section id="engineering" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">
          {"// ENGINEERING Highlights"}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("engineeringHighlights.title")}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
          {highlights.length > 0 ? (
            highlights.map((highlight) => {
              const title = (locale === "th" ? highlight.titleTh || highlight.title : highlight.title)
                .replace(/&amp;/g, "&");
              return (
                <div
                  key={highlight.id}
                  title={title}
                  className="group relative p-5 sm:p-6 bg-card border border-border rounded-sm hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[100px] sm:min-h-[120px] w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm" />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    {highlight.icon ? (
                      <Image
                        src={highlight.icon}
                        alt={title}
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain shrink-0
                          drop-shadow-[0_0_6px_rgba(0,0,0,0.35)]
                          dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      />
                    ) : (
                      <div className="w-9 h-9 shrink-0 border border-border/50 rounded-sm flex items-center justify-center">
                        <span className="text-primary text-lg font-mono">
                          {title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <p className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-2 min-h-[32px] flex items-center justify-center">
                      {title}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              No engineering highlights available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}