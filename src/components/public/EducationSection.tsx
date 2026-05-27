"use client";

import { Education } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

interface EducationSectionProps {
  education: (Omit<Education, 'gpa'> & { gpa: number | null })[];
}

export default function EducationSection({ education }: EducationSectionProps) {
  const { locale, t } = useLocale();
  return (
    <section id="education" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.education")}
        </h2>

        <div className="relative">
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-600 to-purple-600" />

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
                <div className="md:w-1/2 md:px-6 lg:px-8">
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg">
                    <div className="absolute left-4 sm:left-6 md:left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded-full transform -translate-x-1/2 mt-4 sm:mt-6" />

                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                      {degree}
                    </h3>
                    <p className="text-base sm:text-lg text-primary mb-2">
                      {edu.institution}
                    </p>
                    {fieldOfStudy && (
                      <p className="text-sm sm:text-base text-foreground mb-2">
                        {fieldOfStudy}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {new Date(edu.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })} -{" "}
                      {edu.endDate
                        ? new Date(edu.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" })
                        : (locale === "th" ? "ปัจจุบัน" : "Present")}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {locale === "th" ? "เกรดเฉลี่ย:" : "GPA:"} {edu.gpa.toFixed(2)}
                      </p>
                    )}
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
