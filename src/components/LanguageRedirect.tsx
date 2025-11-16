import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SUPPORTED_LANGUAGES = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];

export function LanguageRedirect() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if user has a stored language preference
    const storedLang = localStorage.getItem('preferredLanguage');
    
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      // Use stored preference
      navigate(`/${storedLang}`, { replace: true });
      return;
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
    
    // Store preference
    localStorage.setItem('preferredLanguage', detectedLang);
    
    // Redirect to detected language
    navigate(`/${detectedLang}`, { replace: true });
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
    </div>
  );
}
