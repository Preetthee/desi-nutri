'use client';

import { useTranslation } from '@/contexts/language-provider';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
      <Globe className="h-5 w-5" />
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
