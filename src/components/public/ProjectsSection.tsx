"use client";

import { useState } from "react";
import { Project } from "@prisma/client";
import { useLocale } from "@/hooks/useLocale";
import ImageCarousel from "./ImageCarousel";
import { CaseStudyModal } from "./CaseStudyModal";
import { Badge } from "@/components/ui/badge";
import { Star, GitBranch, Globe, BookOpen, Network } from "lucide-react";

interface ProjectWithImages extends Project {
  images: Array<{ id: number; url: string; sortOrder: number }>;
}

interface ProjectsSectionProps {
  projects: ProjectWithImages[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { locale, t } = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithImages | null>(null);
  const [modalView, setModalView] = useState<"caseStudy" | "architecture">("caseStudy");

  const featuredProjects = projects.filter((p) => p.isFeatured);
  const otherProjects = projects.filter((p) => !p.isFeatured);

  const handleOpenCaseStudy = (project: ProjectWithImages) => {
    setSelectedProject(project);
    setModalView("caseStudy");
    setModalOpen(true);
  };

  const handleOpenArchitecture = (project: ProjectWithImages) => {
    setSelectedProject(project);
    setModalView("architecture");
    setModalOpen(true);
  };

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// PROJECTS"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("nav.projects")}
        </h2>

        {featuredProjects.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-6">{"[ FEATURED ]"}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-stretch">
              {featuredProjects.map((project, index) => {
                const title = locale === "th" ? project.titleTh || project.title : project.title;
                const description = locale === "th" ? project.descriptionTh || project.description : project.description;
                const longDescription = locale === "th" ? project.longDescriptionTh || project.longDescription : project.longDescription;
                return (
                  <div
                    key={project.id}
                    className="border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden bg-card relative h-full flex flex-col"
                  >
                    <ImageCarousel images={project.images} priority={index === 0} />
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      <Badge className="mb-3 w-fit bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 min-h-[64px]">
                        {title}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-3 min-h-[20px]">
                        {project.stack || ""}
                      </p>
                      <p className="text-base sm:text-lg text-foreground mb-4 sm:mb-5 line-clamp-2 min-h-[64px]">
                        {description}
                      </p>
                      {longDescription && (
                        <div className="relative mb-4 sm:mb-5">
                          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside h-40 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                            {longDescription.split('\n').map((line, idx) => (
                              line.trim() && <li key={idx}>{line}</li>
                            ))}
                          </ul>
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-5 sm:mb-6 min-h-[60px] content-start">                        {project.techStack.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="border border-border font-mono text-xs text-muted-foreground px-3 py-1 rounded-sm hover:border-primary/50 hover:text-primary transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 6 && (
                          <span className="border border-border font-mono text-xs text-muted-foreground px-3 py-1 rounded-sm">
                            +{project.techStack.length - 6}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-3 mt-auto pt-2">
                        {/* แถวบน: external links */}
                        <div className="flex gap-4 sm:gap-6 flex-wrap">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              {t("projects.viewCode")}
                            </a>
                          )}

                          {project.liveUrls?.length > 0 &&
                            project.liveUrls.map((url, i) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                {project.liveUrls.length === 1
                                  ? t("projects.liveDemo")
                                  : i === 0
                                    ? t("projects.customer")
                                    : t("projects.admin")}
                              </a>
                            ))}
                        </div>

                        {/* แถวล่าง: in-app modals */}
                      <div className="flex gap-2 flex-wrap">
                        {(project.caseStudyProblem || project.caseStudySolution) && (
                          <button
                            type="button"
                            onClick={() => handleOpenCaseStudy(project)}
                            className="font-mono text-xs text-primary uppercase tracking-widest border border-border hover:border-primary px-3 py-1.5 flex items-center gap-1.5 rounded-sm transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            {t("projects.viewCaseStudy")}
                          </button>
                        )}
                        {project.architectureDiagram && (
                          <button
                            type="button"
                            onClick={() => handleOpenArchitecture(project)}
                            className="font-mono text-xs text-primary uppercase tracking-widest border border-border hover:border-primary px-3 py-1.5 flex items-center gap-1.5 rounded-sm transition-colors"
                          >
                            <Network className="w-3 h-3" />
                            {t("projects.viewArchitecture")}
                          </button>
                        )}
                      </div>
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
                    className="border border-border hover:border-foreground/30 transition-colors p-4 sm:p-5 bg-card h-full flex flex-col"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                      {title}
                    </h3>
                    {project.stack && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {project.stack}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="border border-border font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-sm"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="border border-border font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-sm">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 sm:gap-4 flex-wrap mt-auto">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`View code for ${locale === "th" ? project.titleTh || project.title : project.title} (opens in new tab)`}
                        >
                          ↗ {t("projects.viewCode")}
                        </a>
                      )}
                      {project.liveUrls && project.liveUrls.length > 0 && (
                        project.liveUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                            aria-label={`View live demo ${i + 1} for ${locale === "th" ? project.titleTh || project.title : project.title} (opens in new tab)`}
                          >
                            ↗ {project.liveUrls!.length === 1
                              ? t("projects.liveDemo")
                              : i === 0 ? t("projects.customer") : t("projects.admin")}
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {selectedProject && (
        <CaseStudyModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject}
          view={modalView}
        />
      )}
    </section>
  );
}