"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { Locale, getTranslations } from "@/lib/i18n";

const STORAGE_KEY = "locale";

const getInitialLocale = (): Locale => {
  // Always default to "th" to match server rendering
  // Client will sync from localStorage after mount
  return "th";
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  includeAdmin?: boolean;
}

export function LocaleProvider({ children, includeAdmin = false }: LocaleProviderProps) {
  const initialLocale = getInitialLocale();
  const [state, setState] = React.useState({
    locale: initialLocale,
    translations: getTranslations(initialLocale, includeAdmin),
  });
  const hasSyncedRef = React.useRef(false);

  // Sync locale from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const savedLocale = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const localeToSync =
      savedLocale && (savedLocale === "th" || savedLocale === "en") ? savedLocale : null;

    if (localeToSync) {
      requestAnimationFrame(() => {
        setState({
          locale: localeToSync,
          translations: getTranslations(localeToSync, includeAdmin),
        });
      });
    }
  }, [includeAdmin]);

  // Listen for storage changes to sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newLocale = e.newValue as Locale;
        if (newLocale === "th" || newLocale === "en") {
          setState({
            locale: newLocale,
            translations: getTranslations(newLocale, includeAdmin),
          });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [includeAdmin]);

  const setLocale = (newLocale: Locale) => {
    setState({
      locale: newLocale,
      translations: getTranslations(newLocale, includeAdmin),
    });
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: unknown = state.translations;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    if (value === undefined || value === null) {
      // Warn about missing key in development
      if (process.env.NODE_ENV === "development") {
        console.warn(`[i18n] Missing translation key: ${key}`);
      }
      return `[Missing: ${key}]`;
    }

    return (value as string) || key;
  };

  const contextValue: LocaleContextType = { locale: state.locale, setLocale, t };

  return React.createElement(LocaleContext.Provider, { value: contextValue }, children);
}

export function useLocale() {
  const context = useContext(LocaleContext);
  // Provide default context during SSR to avoid errors
  if (!context) {
    const defaultLocale = getInitialLocale();
    return {
      locale: defaultLocale,
      setLocale: () => {
        // No-op during SSR
      },
      t: (key: string) => {
        const translations = getTranslations(defaultLocale);
        const keys = key.split(".");
        let value: unknown = translations;
        for (const k of keys) {
          value = (value as Record<string, unknown>)?.[k];
        }

        if (value === undefined || value === null) {
          // Warn about missing key in development
          if (process.env.NODE_ENV === "development") {
            console.warn(`[i18n] Missing translation key: ${key}`);
          }
          return `[Missing: ${key}]`;
        }

        return (value as string) || key;
      },
    };
  }
  return context;
}
