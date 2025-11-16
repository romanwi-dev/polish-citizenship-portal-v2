import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];

interface LanguageSyncWrapperProps {
  children: React.ReactNode;
}

export function LanguageSyncWrapper({ children }: LanguageSyncWrapperProps) {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang) && i18n.language !== lang) {
      console.log('🔄 Syncing language from URL:', lang);
      i18n.changeLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
}
