import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// LANG-RUNTIME-SAFE: Import centralized language codes
import { PUBLIC_LANGUAGE_CODES } from '@/constants/languages';

export function LanguageRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // SSR-SAFE: Only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // LANG-RUNTIME-SAFE: Check if user has a stored language preference
      const storedLang = localStorage.getItem('preferredLanguage');
      
      if (storedLang && PUBLIC_LANGUAGE_CODES.includes(storedLang)) {
        // LANG-RUNTIME-SAFE: Use stored preference with replace to avoid redirect loops
        navigate(`/${storedLang}`, { replace: true });
        return;
      }

      // LANG-RUNTIME-SAFE: Detect browser language
      const browserLang = navigator.language?.split('-')[0] || 'en';
      const detectedLang = PUBLIC_LANGUAGE_CODES.includes(browserLang) ? browserLang : 'en';
      
      // LANG-RUNTIME-SAFE: Store preference
      try {
        localStorage.setItem('preferredLanguage', detectedLang);
      } catch (e) {
        // Ignore localStorage errors (e.g., quota exceeded, private browsing)
      }
      
      // LANG-RUNTIME-SAFE: Redirect to detected language with replace
      navigate(`/${detectedLang}`, { replace: true });
    } catch (error) {
      // Fallback to English if anything fails
      console.error('LanguageRedirect error:', error);
      navigate('/en', { replace: true });
    }
  }, [navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
    </div>
  );
}
