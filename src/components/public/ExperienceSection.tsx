"use client";

import { Experience } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const { locale, t } = useLocale();

  return (
    <section id="experience" className="pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// EXPERIENCE"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.experience")}
        </h2>

        <div className="relative pl-6 sm:pl-8">
          {/* Vertical line */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-border min-h-8" />

          {experiences.map((exp, index) => {
            const position = locale === "th" ? exp.positionTh || exp.position : exp.position;
            const description = locale === "th" ? exp.descriptionTh || exp.description : exp.description;
            const isLast = index === experiences.length - 1;

            return (
              <div key={exp.id} className={`relative ${!isLast ? "mb-8 sm:mb-10" : ""}`}>
                {/* Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-2.5 h-2.5 bg-primary rotate-45 transform translate-x-[calc(-50%+0.5px)]" />

                <div className="border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 p-4 sm:p-6 bg-card">
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">
                    {position}
                  </h3>
                  {(exp as Experience & { companyUrl?: string }).companyUrl ? (
                    <a href={(exp as Experience & { companyUrl?: string }).companyUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-xs text-primary tracking-wider mb-1 hover:underline underline-offset-2 block">
                      {exp.company} ↗
                    </a>
                  ) : (
                    <p className="font-mono text-xs text-primary tracking-wider mb-1">
                      {exp.company}
                    </p>
                  )}
                  <p className="font-mono text-xs text-muted-foreground mb-4">
                    {new Date(exp.startDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                    {" – "}
                    {exp.isCurrent || !exp.endDate
                      ? (locale === "th" ? "ปัจจุบัน" : "Present")
                      : new Date(exp.endDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                  </p>
                  {description && (
                    <ul className="space-y-1.5">
                      {description.split('\n').filter(line => line.trim()).map((sentence, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                          <span className="text-primary mt-1.5 shrink-0 text-xs">›</span>
                          {sentence}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}