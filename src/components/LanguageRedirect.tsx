import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// LANG-RUNTIME-SAFE: Import centralized language codes
import { PUBLIC_LANGUAGE_CODES } from '@/constants/languages';

export function LanguageRedirect() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // LANG-RUNTIME-SAFE: Check if user has a stored language preference
    const storedLang = localStorage.getItem('preferredLanguage');
    
    if (storedLang && PUBLIC_LANGUAGE_CODES.includes(storedLang)) {
      // LANG-RUNTIME-SAFE: Use stored preference with replace to avoid redirect loops
      navigate(`/${storedLang}`, { replace: true });
      return;
    }

    // LANG-RUNTIME-SAFE: Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = PUBLIC_LANGUAGE_CODES.includes(browserLang) ? browserLang : 'en';
    
    // LANG-RUNTIME-SAFE: Store preference
    localStorage.setItem('preferredLanguage', detectedLang);
    
    // LANG-RUNTIME-SAFE: Redirect to detected language with replace
    navigate(`/${detectedLang}`, { replace: true });
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
    </div>
  );
}
