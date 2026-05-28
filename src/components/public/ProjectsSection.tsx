"use client";

import { Project } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";
import ImageCarousel from "./ImageCarousel";

interface ProjectWithImages extends Project {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface ProjectsSectionProps {
  projects: ProjectWithImages[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { locale, t } = useLocale();
  const featuredProjects = projects.filter((p) => p.isFeatured);
  const otherProjects = projects.filter((p) => !p.isFeatured);

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// PROJECTS"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.projects")}
        </h2>

        {featuredProjects.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6">{"[ FEATURED ]"}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {featuredProjects.map((project, index) => {
                const title = locale === "th" ? project.titleTh || project.title : project.title;
                const description = locale === "th" ? project.descriptionTh || project.description : project.description;
                const longDescription = locale === "th" ? project.longDescriptionTh || project.longDescription : project.longDescription;
                return (
                  <div
                    key={project.id}
                    className="border border-border hover:border-foreground/30 transition-colors overflow-hidden"
                  >
                    <ImageCarousel images={project.images} priority={index === 0} />
                    <div className="p-4 sm:p-6">
                      <h4 className="text-lg md:text-xl font-bold text-foreground mb-2">
                        {title}
                      </h4>
                      {project.stack && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {project.stack}
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                        {description}
                      </p>
                      {longDescription && (
                        <ul className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 space-y-1 list-disc list-inside max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-primary/50">
                          {longDescription.split('\n').map((line, idx) => (
                            line.trim() && <li key={idx}>{line}</li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="border border-border font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-3 sm:gap-4 flex-wrap">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            ↗ {t("projects.viewCode")}
                          </a>
                        )}
                        {project.liveUrls && project.liveUrls.length === 1 && (
                          <a
                            href={project.liveUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            ↗ {t("projects.liveDemo")}
                          </a>
                        )}
                        {project.liveUrls && project.liveUrls.length === 2 && (
                          <>
                            <a
                              href={project.liveUrls[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              ↗ {t("projects.customer")}
                            </a>
                            <a
                              href={project.liveUrls[1]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              ↗ {t("projects.admin")}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {otherProjects.length > 0 && (
          <div>
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6">{"[ OTHER ]"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {otherProjects.map((project) => {
                const title = locale === "th" ? project.titleTh || project.title : project.title;
                const description = locale === "th" ? project.descriptionTh || project.description : project.description;
                return (
                  <div
                    key={project.id}
                    className="border border-border hover:border-foreground/30 transition-colors p-4 sm:p-5"
                  >
                    <h4 className="text-lg md:text-xl font-bold text-foreground mb-2">
                      {title}
                    </h4>
                    {project.stack && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {project.stack}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-foreground mb-3 sm:mb-4">
                      {description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="border border-border font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 sm:gap-4 flex-wrap">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          ↗ {t("projects.viewCode")}
                        </a>
                      )}
                      {project.liveUrls && project.liveUrls.length === 1 && (
                        <a
                          href={project.liveUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          ↗ {t("projects.liveDemo")}
                        </a>
                      )}
                      {project.liveUrls && project.liveUrls.length === 2 && (
                        <>
                          <a
                            href={project.liveUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            ↗ {t("projects.customer")}
                          </a>
                          <a
                            href={project.liveUrls[1]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            ↗ {t("projects.admin")}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
