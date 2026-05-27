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
      className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors text-sm sm:text-base font-medium"
    >
      {t("hero.contactMe")}
    </button>
  );
}
