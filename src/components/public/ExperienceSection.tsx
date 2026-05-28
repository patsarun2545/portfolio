"use client";

import { Experience } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const { locale, t } = useLocale();
  return (
    <section id="experience" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// EXPERIENCE"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.experience")}
        </h2>

        <div className="relative">
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-border" />

          {experiences.map((exp, index) => {
            const position = locale === "th" ? exp.positionTh || exp.position : exp.position;
            const description = locale === "th" ? exp.descriptionTh || exp.description : exp.description;
            return (
              <div
                key={exp.id}
                className={`relative mb-6 sm:mb-8 pl-10 sm:pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-auto"
                  }`}
              >
                <div className="w-full md:w-5/12 md:px-6 lg:px-8">
                  <div className="border border-border hover:border-foreground/30 transition-colors p-4 md:p-6 text-left">
                    <div className="absolute left-4 sm:left-6 md:left-1/2 w-2.5 h-2.5 bg-primary rotate-45 transform -translate-x-1/2 mt-4 sm:mt-6" />

                    <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                      {position}
                    </h3>
                    <p className="font-mono text-xs text-primary tracking-wider mb-2">
                      {exp.company}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mb-2 sm:mb-3">
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })} -{" "}
                      {exp.isCurrent || !exp.endDate
                        ? (locale === "th" ? "ปัจจุบัน" : "Present")
                        : new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                    </p>
                    {description && (
                      description.split(/(?<=[.]) /).map((sentence, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground leading-relaxed mb-1">
                          {sentence}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
