'use client';

import { useTranslation } from '@/contexts/language-provider';
import type { Locale } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  const handleLanguageChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bn">বাংলা</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
}
