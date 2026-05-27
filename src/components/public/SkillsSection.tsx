"use client";

import { Skill } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";
import Image from "next/image";

interface SkillsSectionProps {
  skills: Skill[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const { locale, t } = useLocale();

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const translateCategory = (category: string, categoryTh?: string | null): string => {
    if (locale === "th" && categoryTh) {
      return categoryTh;
    }
    return category;
  };

  return (
    <section id="skills" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.skills")}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => {
            const firstSkill = categorySkills[0];
            return (
              <div
                key={category}
                className="bg-card rounded-xl p-5 sm:p-6 shadow-lg"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  {translateCategory(category, firstSkill.categoryTh)}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {categorySkills.map((skill) => {
                    const name = locale === "th" ? skill.nameTh || skill.name : skill.name;
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                      >
                        {skill.iconUrl && (
                          <Image
                            src={skill.iconUrl}
                            alt={name}
                            width={28}
                            height={28}
                            className="w-7 h-7 object-contain shrink-0"
                            unoptimized
                          />
                        )}
                        <span className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
