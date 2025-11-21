import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// LANG-RUNTIME-SAFE: Import centralized language codes
import { PUBLIC_LANGUAGE_CODES, isRTLLanguage } from '@/constants/languages';

interface LanguageSyncWrapperProps {
  children: React.ReactNode;
}

export function LanguageSyncWrapper({ children }: LanguageSyncWrapperProps) {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  // LANG-RUNTIME-SAFE: Sync language from URL and set RTL
  useEffect(() => {
    if (lang && PUBLIC_LANGUAGE_CODES.includes(lang) && i18n.language !== lang) {
      console.log('🔄 Syncing language from URL:', lang);
      i18n.changeLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
      
      // LANG-RUNTIME-SAFE: Ensure RTL is set immediately on language sync
      const isRTL = isRTLLanguage(lang);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.classList.toggle('rtl', isRTL);
    }
  }, [lang, i18n]);

  return <>{children}</>;
}
