"use client";

import { Project } from "@prisma/client";
import { ExternalLink } from "lucide-react";
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
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("nav.projects")}
        </h2>

        {featuredProjects.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
              {t("projects.featured")}
            </h3>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              {featuredProjects.map((project, index) => {
                const title = locale === "th" ? project.titleTh || project.title : project.title;
                const description = locale === "th" ? project.descriptionTh || project.description : project.description;
                const longDescription = locale === "th" ? project.longDescriptionTh || project.longDescription : project.longDescription;
                return (
                  <div
                    key={project.id}
                    className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <ImageCarousel images={project.images} priority={index === 0} />
                    <div className="p-4 sm:p-6">
                      <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">
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
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm"
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
                            className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                          >
                            {t("projects.viewCode")}
                          </a>
                        )}
                        {project.liveUrls && project.liveUrls.length === 1 && (
                          <a
                            href={project.liveUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t("projects.viewDemo")}
                          </a>
                        )}
                        {project.liveUrls && project.liveUrls.length === 2 && (
                          <>
                            <a
                              href={project.liveUrls[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t("projects.customer")}
                            </a>
                            <a
                              href={project.liveUrls[1]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t("projects.admin")}
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
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
              {t("projects.other")}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {otherProjects.map((project) => {
                const title = locale === "th" ? project.titleTh || project.title : project.title;
                const description = locale === "th" ? project.descriptionTh || project.description : project.description;
                return (
                  <div
                    key={project.id}
                    className="bg-card rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">
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
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-1.5 sm:px-2 py-1 bg-secondary text-muted-foreground rounded-full text-xs"
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
                          className="text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {t("projects.viewCode")}
                        </a>
                      )}
                      {project.liveUrls && project.liveUrls.length === 1 && (
                        <a
                          href={project.liveUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrls && project.liveUrls.length === 2 && (
                        <>
                          <a
                            href={project.liveUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t("projects.customer")}
                          </a>
                          <a
                            href={project.liveUrls[1]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {t("projects.admin")}
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
