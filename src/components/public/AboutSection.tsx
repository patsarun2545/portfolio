"use client";

import Image from "next/image";
import { About } from "@prisma/client";
import { Mail, MapPin } from "lucide-react";
import { useLocale } from "@/hooks/useLocale";

interface AboutSectionProps {
  about: About;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const { locale, t } = useLocale();
  const title = locale === "th" ? ((about as About & { titleTh?: string }).titleTh || about.title) : about.title;
  const bio = locale === "th" ? (about.bioTh || about.bio) : about.bio;
  const location = locale === "th" ? ((about as About & { locationTh?: string }).locationTh || about.location) : about.location;

  return (
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-border" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center animate-fade-in-up">
          <div className="flex justify-center md:order-1 order-2 w-full md:w-auto">
            {about.avatarUrl ? (
              <div className="relative w-full md:w-80 max-h-96">
                <div className="absolute inset-0 border border-primary/30 translate-x-3 translate-y-3 rounded-sm hidden sm:block" />
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
              <div className="w-full md:w-80 max-h-96 aspect-square rounded-sm border-2 border-border bg-card flex items-center justify-center text-foreground text-5xl sm:text-6xl font-bold">
                {about.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="md:order-2 order-1">
            <p className="font-mono text-xs text-primary tracking-widest uppercase mb-2">{"// ABOUT"}</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              {t("nav.about")}
            </h2>
            <h3 className="font-mono text-sm text-primary tracking-wider mb-4">
              {title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed md:leading-loose mb-6">
              {bio}
            </p>

            <div className="border-t border-border pt-4 space-y-3 sm:space-y-4">
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
