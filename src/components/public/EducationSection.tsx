"use client";

import { Education } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

interface EducationSectionProps {
  education: (Omit<Education, 'gpa'> & { gpa: number | null })[];
}

export default function EducationSection({ education }: EducationSectionProps) {
  const { locale, t } = useLocale();
  return (
    <section id="education" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// EDUCATION"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.education")}
        </h2>

        <div className="relative">
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-border" />

          {education.map((edu, index) => {
            const degree = locale === "th" ? edu.degreeTh || edu.degree : edu.degree;
            const fieldOfStudy = locale === "th" ? edu.fieldOfStudyTh || edu.fieldOfStudy : edu.fieldOfStudy;
            const description = locale === "th" ? edu.descriptionTh || edu.description : edu.description;
            return (
              <div
                key={edu.id}
                className={`relative mb-6 sm:mb-8 pl-10 sm:pl-12 md:pl-0 ${index % 2 === 0 ? "md:pr-1/2 md:text-right" : "md:pl-1/2 md:ml-auto"
                  }`}
              >
                <div className="w-full md:w-5/12 md:px-6 lg:px-8">
                  <div className="border border-border hover:border-foreground/30 transition-colors p-4 md:p-6 text-left">
                    <div className="absolute left-4 sm:left-6 md:left-1/2 w-2.5 h-2.5 bg-primary rotate-45 transform -translate-x-1/2 mt-4 sm:mt-6" />

                    <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                      {degree}
                    </h3>
                    <p className="font-mono text-xs text-primary tracking-wider mb-2">
                      {edu.institution}
                    </p>
                    {fieldOfStudy && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {fieldOfStudy}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground mb-2">
                      {new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })} -{" "}
                      {edu.endDate
                        ? new Date(edu.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })
                        : (locale === "th" ? "ปัจจุบัน" : "Present")}
                    </p>
                    {edu.gpa && (
                      <p className="font-mono text-xs text-muted-foreground mb-2">
                        GPA {edu.gpa.toFixed(2)}
                      </p>
                    )}
                    {description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
