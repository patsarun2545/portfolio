"use client";

import { useLocale } from "@/hooks/useLocale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MermaidDiagram from "@/components/MermaidDiagram";
import { AlertTriangle, Lightbulb, Target, TrendingUp, Cpu, Clock, Users, BookOpen } from "lucide-react";

interface CaseStudyModalProps {
  open: boolean;
  onClose: () => void;
  project: {
    title: string;
    titleTh?: string | null;
    caseStudyProblem?: string | null;
    caseStudyProblemTh?: string | null;
    caseStudySolution?: string | null;
    caseStudySolutionTh?: string | null;
    caseStudyChallenges?: string | null;
    caseStudyChallengesTh?: string | null;
    caseStudyResults?: string | null;
    caseStudyResultsTh?: string | null;
    architectureDiagram?: string | null;
    architectureDiagramTh?: string | null;
    techStackUsed?: string | null;
    techStackUsedTh?: string | null;
    timeline?: string | null;
    timelineTh?: string | null;
    teamSize?: string | null;
    teamSizeTh?: string | null;
    keyLearnings?: string | null;
    keyLearningsTh?: string | null;
  };
  view: "caseStudy" | "architecture";
}

export function CaseStudyModal({ open, onClose, project, view }: CaseStudyModalProps) {
  const { locale, t } = useLocale();
  const isThai = locale === "th";

  const getLocalizedField = (en: string | null | undefined, th: string | null | undefined) => {
    return isThai && th ? th : en;
  };

  const formatText = (text: string | null | undefined) => {
    if (!text) return text;
    if (text.length > 200 && !text.includes('\n')) {
      return text.split('. ').join('.\n');
    }
    return text;
  };

  const title = getLocalizedField(project.title, project.titleTh);

  const primarySections = [
    {
      key: "problem",
      icon: AlertTriangle,
      label: t("projects.problem"),
      value: getLocalizedField(project.caseStudyProblem, project.caseStudyProblemTh),
      accent: true,
    },
    {
      key: "solution",
      icon: Lightbulb,
      label: t("projects.solution"),
      value: getLocalizedField(project.caseStudySolution, project.caseStudySolutionTh),
      accent: true,
    },
    {
      key: "challenges",
      icon: Target,
      label: t("projects.challenges"),
      value: getLocalizedField(project.caseStudyChallenges, project.caseStudyChallengesTh),
      accent: false,
    },
    {
      key: "results",
      icon: TrendingUp,
      label: t("projects.results"),
      value: getLocalizedField(project.caseStudyResults, project.caseStudyResultsTh),
      accent: false,
    },
    {
      key: "techStack",
      icon: Cpu,
      label: t("projects.techStackUsed"),
      value: getLocalizedField(project.techStackUsed, project.techStackUsedTh),
      accent: false,
    },
    {
      key: "keyLearnings",
      icon: BookOpen,
      label: t("projects.keyLearnings"),
      value: getLocalizedField(project.keyLearnings, project.keyLearningsTh),
      accent: false,
    },
  ];

  const renderCaseStudy = () => (
    <div className="space-y-3">
      {primarySections.filter(s => s.value).map((section) => (
        <div
          key={section.key}
          className={`border-l-2 pl-4 py-3 bg-card ${section.accent ? "border-primary" : "border-border"}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <section.icon className={`h-3.5 w-3.5 shrink-0 ${section.accent ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`font-mono text-xs tracking-widest uppercase ${section.accent ? "text-primary" : "text-muted-foreground"}`}>
              {section.label}
            </p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {formatText(section.value)}
          </p>
        </div>
      ))}

      {(project.timeline || project.teamSize) && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {project.timeline && (
            <div className="border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{t("projects.timeline")}</p>
              </div>
              <p className="font-mono text-sm text-foreground">
                {getLocalizedField(project.timeline, project.timelineTh)}
              </p>
            </div>
          )}
          {project.teamSize && (
            <div className="border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{t("projects.teamSize")}</p>
              </div>
              <p className="font-mono text-sm text-foreground">
                {getLocalizedField(project.teamSize, project.teamSizeTh)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderArchitecture = () => {
    const diagram = getLocalizedField(project.architectureDiagram, project.architectureDiagramTh);
    if (!diagram) {
      return <p className="text-sm text-muted-foreground">{t("projects.noArchitectureDiagram")}</p>;
    }
    return (
      <div className="border border-border bg-card p-4 overflow-x-auto">
        <MermaidDiagram chart={diagram} className="w-full min-h-[300px]" />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto p-0">
        <div className="border-b border-border px-6 py-5">
          <p className="font-mono text-xs text-primary tracking-widest uppercase mb-1">
            {view === "caseStudy" ? "// CASE STUDY" : "// ARCHITECTURE"}
          </p>
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">{title}</DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground sr-only">
              {view === "caseStudy" ? t("projects.caseStudyModal") : t("projects.architectureModal")}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 pb-8">
          {view === "caseStudy" ? renderCaseStudy() : renderArchitecture()}
        </div>
      </DialogContent>
    </Dialog>
  );
}