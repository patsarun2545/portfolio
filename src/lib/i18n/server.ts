import { Locale, getTranslations } from "./index";

// Default locale for server-side rendering (locale is stored in localStorage only on client)
export async function getServerLocale(): Promise<Locale> {
  return "th";
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  return getTranslations(locale);
}
