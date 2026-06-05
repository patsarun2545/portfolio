"use client";

import { useLocale } from "@/hooks/useLocale";

export default function ScrollToContactButton() {
  const { t } = useLocale();

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={scrollToContact}
      className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 border border-border text-muted-foreground font-mono text-xs uppercase tracking-widest rounded-sm hover:border-primary hover:text-primary transition-colors"
      aria-label={t("hero.contactMe")}
    >
      {t("hero.contactMe")} →
    </button>
  );
}
