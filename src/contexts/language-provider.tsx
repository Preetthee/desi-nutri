'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { translations, type Locale } from '@/lib/i18n';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'bn');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let translation = translations[locale][key as keyof typeof translations[Locale]] || key;
      if (params) {
        Object.keys(params).forEach((paramKey) => {
          translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
        });
      }
      return translation;
    },
    [locale]
  );
  
  const value = {
    locale,
    setLocale,
    t,
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
