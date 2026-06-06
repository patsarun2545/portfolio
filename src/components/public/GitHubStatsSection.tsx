"use client";

import { useLocale } from "@/hooks/useLocale";
import { getGitHubStats } from "@/lib/actions/github";
import { useEffect, useState } from "react";
import { BookOpen, GitCommit, Code2, TrendingUp } from "lucide-react";

interface GitHubStatsData {
  totalCommits: number;
  contributionsLastYear: number;
  publicRepos: number;
  topLanguages: string[];
}

export default function GitHubStatsSection() {
  const { t } = useLocale();
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchStats() {
      try {
        const data = await getGitHubStats();
        if (!controller.signal.aborted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch GitHub stats:", err);
          setError(true);
          setLoading(false);
        }
      }
    }
    
    fetchStats();
    return () => controller.abort();
  }, []);

  {/* แทนที่ loading return เดิมทั้งหมด */}
    if (loading) {
      return (
        <section id="github-stats" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-6xl mx-auto animate-fade-in-up">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">
              {"// GITHUB STATS"}
            </p>
            <div className="h-8 w-48 bg-border/50 rounded-sm mx-auto mb-8 sm:mb-12 animate-pulse" />

            {/* แถวบน 3 การ์ด */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border p-6 sm:p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-border/50 rounded-full animate-pulse" />
                  <div className="w-16 h-7 bg-border/50 rounded-sm animate-pulse" />
                  <div className="w-24 h-4 bg-border/50 rounded-sm animate-pulse" />
                </div>
              ))}
            </div>

            {/* แถวล่าง 1 การ์ดเต็มความกว้าง */}
            <div className="border border-border p-6 sm:p-8 flex items-center justify-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-border/50 rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="w-40 h-7 bg-border/50 rounded-sm" />
                <div className="w-24 h-4 bg-border/50 rounded-sm" />
              </div>
            </div>
          </div>
        </section>
      );
    }

  if (error || !stats) {
    return (
      <section id="github-stats" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-mono text-xs text-muted-foreground">
            {t("githubStats.title")} — 
            <a href="https://github.com/patsarun2545" 
              target="_blank" rel="noopener noreferrer"
              className="text-primary hover:underline ml-1">
              @patsarun2545
            </a>
          </p>
        </div>
      </section>
    );
  }

  const statCards = [
    {
      icon: GitCommit,
      label: t("githubStats.totalCommits"),
      value: stats.totalCommits,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: t("githubStats.contributionsYear"),
      value: stats.contributionsLastYear,
      color: "text-green-500",
    },
    {
      icon: BookOpen,
      label: t("githubStats.publicRepos"),
      value: stats.publicRepos,
      color: "text-purple-500",
    },
    {
      icon: Code2,
      label: t("githubStats.topLanguages"),
      value: stats.topLanguages.length > 0 ? stats.topLanguages.slice(0, 2).join(", ") + (stats.topLanguages.length > 2 ? ` +${stats.topLanguages.length - 2}` : "") : "N/A",
      isText: true,
      color: "text-yellow-500",
    },
  ];

  return (
    <section id="github-stats" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2 text-center">{"// GITHUB STATS"}</p>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-8 sm:mb-12 text-center">
          {t("githubStats.title")}
        </h2>

        {/* Top row — 3 equal cards */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {statCards.slice(0, 3).map((card) => (
            <a key={card.label} href="https://github.com/patsarun2545"
              target="_blank" rel="noopener noreferrer"
              className="group h-full">
              <div className="border border-border hover:border-primary/30
                hover:shadow-lg hover:shadow-primary/10
                transition-all duration-200 p-6 sm:p-8 text-center
                h-full flex flex-col justify-center bg-card">
                <card.icon className={`h-8 w-8 sm:h-10 sm:w-10 
                  mx-auto mb-3 sm:mb-4 ${card.color}`} />
                <div className="text-2xl sm:text-3xl font-bold 
                  text-foreground mb-1 sm:mb-2">
                  {Number(card.value).toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {card.label}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom row — 1 full width card */}
          <a href="https://github.com/patsarun2545"
            target="_blank" rel="noopener noreferrer"
            className="group block">
            <div className="border border-border hover:border-primary/30
              hover:shadow-lg hover:shadow-primary/10
              transition-all duration-200 p-6 sm:p-8 text-center
              flex flex-col items-center justify-center bg-card">
              <Code2 className="h-8 w-8 sm:h-10 sm:w-10 mb-3 sm:mb-4 text-yellow-500" />
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {stats.topLanguages.slice(0, 2).join(", ")}
                {stats.topLanguages.length > 2 ? ` +${stats.topLanguages.length - 2}` : ""}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t("githubStats.topLanguages")}
              </div>
            </div>
          </a>

        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="https://github.com/patsarun2545"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-foreground transition-colors"
          >
            <span className="font-mono text-sm">@patsarun2545</span>
          </a>
        </div>
      </div>
    </section>
  );
}