"use client";

import { Experience } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const { locale, t } = useLocale();
  return (
    <section id="experience" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.experience")}
        </h2>

        <div className="relative">
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-600 to-purple-600" />

          {experiences.map((exp, index) => {
            const position = locale === "th" ? exp.positionTh || exp.position : exp.position;
            const description = locale === "th" ? exp.descriptionTh || exp.description : exp.description;
            return (
              <div
                key={exp.id}
                className={`relative mb-6 sm:mb-8 pl-10 sm:pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-auto"
                  }`}
              >
                <div className="md:w-1/2 md:px-6 lg:px-8">
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg">
                    <div className="absolute left-4 sm:left-6 md:left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full transform -translate-x-1/2 mt-4 sm:mt-6" />

                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      {position}
                    </h3>
                    <p className="text-base sm:text-lg text-primary mb-2">
                      {exp.company}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })} -{" "}
                      {exp.isCurrent || !exp.endDate
                        ? (locale === "th" ? "ปัจจุบัน" : "Present")
                        : new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                    </p>
                    {description && (
                      <p className="text-sm sm:text-base text-foreground">
                        {description}
                      </p>
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
