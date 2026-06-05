"use client";

import Image from "next/image";
import { About } from "@prisma/client";
import { Mail, MapPin, Target, Zap, BookOpen, Briefcase } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface AboutSectionProps {
  about: About;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const { locale, t } = useLocale();
  const title = locale === "th" ? ((about as About & { titleTh?: string }).titleTh || about.title) : about.title;
  const bio = locale === "th" ? (about.bioTh || about.bio) : about.bio;
  const location = locale === "th" ? ((about as About & { locationTh?: string }).locationTh || about.location) : about.location;
  const status = locale === "th" ? ((about as About & { statusTh?: string }).statusTh || (about as About & { status?: string }).status) : (about as About & { status?: string }).status;
  const availability = locale === "th"
    ? ((about as About & { availabilityTh?: string }).availabilityTh || (about as About & { availability?: string }).availability)
    : (about as About & { availability?: string }).availability;
  const strengths = locale === "th" ? ((about as About & { strengthsTh?: string }).strengthsTh || (about as About & { strengths?: string }).strengths) : (about as About & { strengths?: string }).strengths;
  const goals = locale === "th" ? ((about as About & { goalsTh?: string }).goalsTh || (about as About & { goals?: string }).goals) : (about as About & { goals?: string }).goals;
  const nowLearning = locale === "th" ? ((about as About & { nowLearningTh?: string }).nowLearningTh || (about as About & { nowLearning?: string }).nowLearning) : (about as About & { nowLearning?: string }).nowLearning;

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-start animate-fade-in-up">

          {/* Avatar column */}
          <div className="flex justify-center md:order-1 order-2 w-full md:w-auto md:sticky md:top-28 self-start">
            {about.avatarUrl ? (
              <div className="relative w-full md:w-72 max-h-96 drop-shadow-[0_0_15px_rgba(var(--primary),0.15)]">
                <div className="absolute inset-0 border border-primary/60 translate-x-3 translate-y-3 rounded-sm hidden sm:block" />
                <Image
                  src={about.avatarUrl}
                  alt={about.name}
                  width={400}
                  height={400}
                  priority
                  className="relative z-10 rounded-sm w-full h-full object-cover max-h-96"
                />
              </div>
            ) : (
              <div className="w-full md:w-72 max-h-96 aspect-square rounded-sm border-2 border-border bg-card flex items-center justify-center text-foreground text-5xl sm:text-6xl font-bold">
                {about.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Content column */}
          <div className="md:order-2 order-1 flex-1">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2">{"// ABOUT"}</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-2">
              {t("nav.about")}
            </h2>
            <h3 className="font-mono text-sm text-primary tracking-wider mb-6">
              {title}
            </h3>

            {/* Bio — only shown here, not in Hero */}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed md:leading-loose mb-8">
              {bio}
            </p>

            {/* Status + Availability */}
            {(status || availability) && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-sm">
                {availability && (
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs text-primary tracking-wider font-medium">{availability}</span>
                  </div>
                )}
                {status && (
                  <p className="text-sm text-muted-foreground">{status}</p>
                )}
              </div>
            )}

            {/* Strengths / Goals / Now Learning */}
            <div className="space-y-5 mb-8">
              {strengths && (
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-primary tracking-wider mb-1">{t("about.strengths")}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{strengths}</p>
                  </div>
                </div>
              )}
              {goals && (
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-primary tracking-wider mb-1">{t("about.goals")}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{goals}</p>
                  </div>
                </div>
              )}
              {nowLearning && (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-primary tracking-wider mb-1">{t("about.nowLearning")}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{nowLearning}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact info */}
            <div className="border-t border-border pt-5 space-y-3">
              {about.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a
                    href={`mailto:${about.email}`}
                    className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                  >
                    {about.email}
                  </a>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm text-muted-foreground break-words">{location}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}