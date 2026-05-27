import commonTh from "./common/th.json";
import commonEn from "./common/en.json";
import adminTh from "./admin/th.json";
import adminEn from "./admin/en.json";

export type Locale = "th" | "en";

export type Translations = typeof commonTh & { admin?: typeof adminTh.admin };

const commonTranslations: Record<Locale, typeof commonTh> = {
  th: commonTh,
  en: commonEn,
};

const adminTranslations: Record<Locale, typeof adminTh.admin> = {
  th: adminTh.admin,
  en: adminEn.admin,
};

export function getTranslations(locale: Locale, includeAdmin = false): Translations {
  const common = commonTranslations[locale];

  if (includeAdmin) {
    return { ...common, admin: adminTranslations[locale] };
  }

  return common;
}
