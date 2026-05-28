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
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// SKILLS"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.skills")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => {
            const firstSkill = categorySkills[0];
            return (
              <div
                key={category}
                className="border border-border hover:border-foreground/30 transition-colors p-4 md:p-5"
              >
                <h3 className="font-mono text-xs text-primary uppercase tracking-widest border-b border-border pb-3 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                  {translateCategory(category, firstSkill.categoryTh)}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {categorySkills.map((skill, index) => {
                    const name = locale === "th" ? skill.nameTh || skill.name : skill.name;
                    const isLast = index === categorySkills.length - 1;
                    return (
                      <div
                        key={skill.id}
                        className={`flex items-center gap-3 py-2 ${isLast ? '' : 'border-b border-border'}`}
                      >
                        {skill.iconUrl && (
                          <Image
                            src={skill.iconUrl}
                            alt={name}
                            width={28}
                            height={28}
                            className="w-7 h-7 object-contain shrink-0 transition-all duration-200"
                            unoptimized
                          />
                        )}
                        <span className="font-mono text-xs text-muted-foreground hover:text-primary whitespace-nowrap overflow-hidden text-ellipsis">
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
