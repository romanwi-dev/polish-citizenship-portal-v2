import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// ADMIN-LANG-SAFE: Import admin language codes
import { ADMIN_LANGUAGE_CODES } from '@/constants/languages';

/**
 * ADMIN-LANG-SAFE: Ensures admin area only uses EN or PL
 * If user has a different language selected, falls back to EN
 */
export function useAdminLanguageGuard() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = i18n.language;
    
    // ADMIN-LANG-SAFE: If current language is not EN or PL, switch to EN
    if (!ADMIN_LANGUAGE_CODES.includes(currentLang)) {
      console.log(`🔒 Admin language guard: ${currentLang} not allowed, switching to EN`);
      i18n.changeLanguage('en');
      localStorage.setItem('preferredLanguage', 'en');
    }
  }, [i18n]);
}
