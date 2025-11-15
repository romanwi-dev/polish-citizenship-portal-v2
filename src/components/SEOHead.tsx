import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  page?: 'home' | 'about' | 'services' | 'timeline' | 'pricing' | 'testimonials' | 'contact' | 'faq';
}

export function SEOHead({ page = 'home' }: SEOHeadProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const baseUrl = window.location.origin;
  
  const title = t(`seo.${page}.title`);
  const description = t(`seo.${page}.description`);
  const ogTitle = t(`seo.${page}.ogTitle`);
  const ogDescription = t(`seo.${page}.ogDescription`);
  const twitterTitle = t(`seo.${page}.twitterTitle`);
  const twitterDescription = t(`seo.${page}.twitterDescription`);
  const keywords = t(`seo.${page}.keywords`);
  
  // All supported languages
  const languages = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={`${baseUrl}/lovable-uploads/banner.jpg`} />
      <meta property="og:locale" content={getOGLocale(currentLang)} />
      
      {/* Alternate locales for Facebook */}
      {languages.filter(l => l !== currentLang).map(lang => (
        <meta key={`og-${lang}`} property="og:locale:alternate" content={getOGLocale(lang)} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={window.location.href} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={`${baseUrl}/lovable-uploads/banner.jpg`} />
      
      {/* Hreflang tags for international SEO */}
      {languages.map(lang => (
        <link
          key={`hreflang-${lang}`}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}${lang === 'en' ? '/' : `/${lang}`}`}
        />
      ))}
      
      {/* x-default for users not matching any language */}
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}

// Helper to convert lang codes to OG locale format
function getOGLocale(lang: string): string {
  const localeMap: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    pt: 'pt_PT',
    de: 'de_DE',
    fr: 'fr_FR',
    he: 'he_IL',
    ru: 'ru_RU',
    uk: 'uk_UA'
  };
  return localeMap[lang] || 'en_US';
}
