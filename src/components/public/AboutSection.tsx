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
    <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/50" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center animate-fade-in-up">
          <div className="flex justify-center md:order-1 order-2">
            {about.avatarUrl ? (
              <div className="relative w-64 sm:w-80 md:w-96 aspect-square">
                <Image
                  src={about.avatarUrl}
                  alt={about.name}
                  width={400}
                  height={400}
                  priority
                  className="rounded-2xl shadow-2xl w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-5xl sm:text-6xl font-bold">
                {about.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="md:order-2 order-1">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("nav.about")}
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              {title}
            </h3>
            <p className="text-base sm:text-lg text-foreground mb-6 leading-relaxed">
              {bio}
            </p>

            <div className="space-y-3 sm:space-y-4">
              {about.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <a
                    href={`mailto:${about.email}`}
                    className="hover:text-primary transition-colors break-all"
                  >
                    {about.email}
                  </a>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3 text-foreground">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="break-words">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
