import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Language set constants
export const PUBLIC_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

export const ADMIN_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

type LanguageSelectorProps = {
  allowedLanguages?: typeof PUBLIC_LANGUAGES;
};

export function LanguageSelector({ allowedLanguages }: LanguageSelectorProps = {}) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const [open, setOpen] = useState(false);

  const languages = allowedLanguages ?? PUBLIC_LANGUAGES;
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // RTL toggle for Hebrew
  useEffect(() => {
    const isRTL = i18n.language === 'he';
    document.documentElement.classList.toggle('rtl', isRTL);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLanguageChange = async (code: string) => {
    console.log('🔄 Changing language to:', code);
    
    // Change i18n language
    await i18n.changeLanguage(code);
    
    // Store preference
    localStorage.setItem('preferredLanguage', code);
    
    // Navigate to new language URL
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|es|pt|de|fr|he|ru|uk)(\/|$)/, '/');
    navigate(`/${code}${pathWithoutLang === '/' ? '' : pathWithoutLang}`);
    
    console.log('✅ Language changed to:', i18n.language);
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
