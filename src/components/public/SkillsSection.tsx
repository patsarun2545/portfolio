"use client";

import { Skill } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";

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

        <div className="border border-border divide-x divide-y divide-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groupedSkills)
            .sort(([, aSkills], [, bSkills]) => {
              const aOrder = aSkills[0]?.sortOrder ?? 999;
              const bOrder = bSkills[0]?.sortOrder ?? 999;
              if (aOrder !== bOrder) return aOrder - bOrder;
              return (aSkills[0]?.category ?? "").localeCompare(bSkills[0]?.category ?? "");
            })
            .map(([category, categorySkills]) => {
            const firstSkill = categorySkills[0];
            return (
              <div
                key={category}
                className="border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 p-4 md:p-5 bg-card"
              >
                <h3 className="font-mono text-xs text-primary uppercase tracking-widest border-b border-border pb-3 mb-4" title={translateCategory(category, firstSkill.categoryTh)}>
                  {translateCategory(category, firstSkill.categoryTh)}
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {categorySkills.map((skill) => {
                    const name = locale === "th" ? skill.nameTh || skill.name : skill.name;
                    return (
                      <div key={skill.id} className="flex items-center gap-3 py-2">
                        {skill.iconUrl ? (
                          <img
                            src={skill.iconUrl}
                            alt={name}
                            className="w-6 h-6 object-contain shrink-0
                              drop-shadow-[0_0_4px_rgba(0,0,0,0.35)]
                              dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                          />
                        ) : (
                          <div className="w-6 h-6 shrink-0" />
                        )}
                        <span className="font-mono text-xs text-muted-foreground 
                          hover:text-primary transition-colors truncate">
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