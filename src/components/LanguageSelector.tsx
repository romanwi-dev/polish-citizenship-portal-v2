import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// LANG-RUNTIME-SAFE: Import centralized language constants
import { PUBLIC_LANGUAGES, ADMIN_LANGUAGES, isRTLLanguage, type LanguageConfig } from "@/constants/languages";

// LANG-RUNTIME-SAFE: Re-export for backwards compatibility
export { PUBLIC_LANGUAGES, ADMIN_LANGUAGES };

// ADMIN-LANG-SAFE: Allow restricting available languages (e.g., EN/PL only for admin)
type LanguageSelectorProps = {
  allowedLanguages?: LanguageConfig[];
};

export function LanguageSelector({ allowedLanguages }: LanguageSelectorProps = {}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const [open, setOpen] = useState(false);

  // ADMIN-LANG-SAFE: Use restricted language list if provided (e.g., EN/PL for admin)
  const languages = allowedLanguages ?? PUBLIC_LANGUAGES;
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // LANG-RUNTIME-SAFE: RTL toggle for Hebrew - uses dir attribute for proper text direction
  useEffect(() => {
    const isRTL = isRTLLanguage(i18n.language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('rtl', isRTL);
  }, [i18n.language]);

  const handleLanguageChange = async (code: string) => {
    // LANG-RUNTIME-SAFE: Prevent redundant switches
    if (i18n.language === code) {
      setOpen(false);
      return;
    }
    
    console.log('🔄 Changing language to:', code);
    
    // LANG-RUNTIME-SAFE: Store preference BEFORE navigation to prevent race conditions
    localStorage.setItem('preferredLanguage', code);
    
    // LANG-RUNTIME-SAFE: Change i18n language
    await i18n.changeLanguage(code);
    
    // ADMIN-LANG-SAFE: Admin routes (/admin, /client) don't use lang prefix - skip navigation
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/client')) {
      // Just change the language, no navigation needed for admin/client areas
      setOpen(false);
      return;
    }
    
    // LANG-RUNTIME-SAFE: Navigate to new language URL with replace to avoid back-button issues
    const pathWithoutLang = currentPath.replace(/^\/(en|es|pt|de|fr|he|ru|uk|pl)(\/|$)/, '/');
    navigate(`/${code}${pathWithoutLang === '/' ? '' : pathWithoutLang}`, { replace: true });
    
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="h-8 w-8 md:h-11 md:w-11 rounded-full bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
          aria-label={`Current language: ${currentLanguage.label}. Click to change language`}
          aria-expanded={open}
        >
          <span className="text-xs md:text-sm font-bold text-primary dark:text-foreground/70">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border border-primary/20 z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${currentLanguage.code === lang.code ? 'bg-primary/10' : ''}`}
            role="menuitemradio"
            aria-checked={currentLanguage.code === lang.code}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
