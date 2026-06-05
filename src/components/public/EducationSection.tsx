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

        <div className="relative pl-6 sm:pl-8">
          {/* Vertical line */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-border min-h-8" />

          {education.map((edu, index) => {
            const degree = locale === "th" ? edu.degreeTh || edu.degree : edu.degree;
            const fieldOfStudy = locale === "th" ? edu.fieldOfStudyTh || edu.fieldOfStudy : edu.fieldOfStudy;
            const description = locale === "th" ? edu.descriptionTh || edu.description : edu.description;
            const isLast = index === education.length - 1;

            return (
              <div key={edu.id} className={`relative ${!isLast ? "mb-8 sm:mb-10" : ""}`}>
                {/* Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-2.5 h-2.5 bg-primary rotate-45 transform translate-x-[calc(-50%+0.5px)]" />

                <div className="border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 p-4 sm:p-6 bg-card">
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">
                    {degree}
                  </h3>
                  <p className="font-mono text-xs text-primary tracking-wider mb-1">
                    {edu.institution}
                  </p>
                  {fieldOfStudy && (
                    <p className="text-sm text-muted-foreground mb-1">
                      {fieldOfStudy}
                    </p>
                  )}
                  <p className="font-mono text-xs text-muted-foreground mb-3">
                    {new Date(edu.startDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                    {" – "}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })
                      : (locale === "th" ? "ปัจจุบัน" : "Present")}
                  </p>
                  {edu.gpa && (
                    <p className="font-mono text-xs text-muted-foreground mb-3">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}