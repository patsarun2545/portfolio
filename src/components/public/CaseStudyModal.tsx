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

  const renderCaseStudy = () => (
    <div className="space-y-4">
      {project.caseStudyProblem && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.problem")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.caseStudyProblem, project.caseStudyProblemTh))}
          </p>
        </div>
      )}
      {project.caseStudySolution && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.solution")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.caseStudySolution, project.caseStudySolutionTh))}
          </p>
        </div>
      )}
      {project.caseStudyChallenges && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.challenges")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.caseStudyChallenges, project.caseStudyChallengesTh))}
          </p>
        </div>
      )}
      {project.caseStudyResults && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.results")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.caseStudyResults, project.caseStudyResultsTh))}
          </p>
        </div>
      )}
      {project.techStackUsed && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.techStackUsed")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.techStackUsed, project.techStackUsedTh))}
          </p>
        </div>
      )}
      {project.timeline && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.timeline")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.timeline, project.timelineTh))}
          </p>
        </div>
      )}
      {project.teamSize && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.teamSize")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.teamSize, project.teamSizeTh))}
          </p>
        </div>
      )}
      {project.keyLearnings && (
        <div className="border border-border p-4 sm:p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <p className="font-mono text-xs text-primary tracking-widest uppercase">{t("projects.keyLearnings")}</p>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-8">
            {formatText(getLocalizedField(project.keyLearnings, project.keyLearningsTh))}
          </p>
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
      <MermaidDiagram chart={diagram} className="w-full" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl min-h-[200px] max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">{title}</DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            {view === "caseStudy" ? t("projects.caseStudyModal") : t("projects.architectureModal")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 pb-8">
          {view === "caseStudy" ? renderCaseStudy() : renderArchitecture()}
        </div>
      </DialogContent>
    </Dialog>
  );
}