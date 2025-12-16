'use client';

import { useLanguageContext } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export function useLanguage() {
  const { language } = useLanguageContext();
  
  const t = (key: string) => getTranslation(key, language);

  return { lang: language, t };
}
