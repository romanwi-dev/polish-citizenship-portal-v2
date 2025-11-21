import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  page?: 'home' | 'about' | 'services' | 'timeline' | 'pricing' | 'testimonials' | 'contact' | 'faq';
}

export function SEOHead({ page = 'home' }: SEOHeadProps) {
  const { t, i18n } = useTranslation('landing');
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
      
      {/* AI Engine Meta Tags */}
      <meta name="openai:description" content={description} />
      <meta name="openai:keywords" content={keywords} />
      <meta name="ai-content-declaration" content="human-authored-legal-guidance" />
      <meta name="perplexity:category" content="legal-services" />
      <meta name="perplexity:region" content="europe" />
      <meta name="article:author" content="Polish Citizenship Portal" />
      <meta name="article:published_time" content="2024-01-01T00:00:00Z" />
      <meta name="article:modified_time" content={new Date().toISOString()} />
      
      {/* Performance: Resource Hints */}
      <link rel="preconnect" href="https://oogmuakyqadpynnrasnd.supabase.co" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://oogmuakyqadpynnrasnd.supabase.co" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      
      {/* Only preload OG image if it exists - avoid 404s */}
      {/* OG images should be generated for all 8 languages */}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={`${baseUrl}/og/${currentLang}-og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={t(`seo.${page}.ogImageAlt`)} />
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
      <meta name="twitter:image" content={`${baseUrl}/og/${currentLang}-og-image.jpg`} />
      <meta name="twitter:image:alt" content={t(`seo.${page}.ogImageAlt`)} />
      
      {/* Pinterest Rich Pins */}
      <meta name="pinterest-rich-pin" content="true" />
      <meta property="og:type" content="article" />
      <meta property="article:author" content="Polish Citizenship Portal" />
      <meta property="article:published_time" content="2024-01-01T00:00:00Z" />
      
      {/* LinkedIn Article Meta */}
      <meta property="og:site_name" content="Polish Citizenship Portal" />
      <meta name="author" content="Polish Citizenship Portal" />
      
      {/* WhatsApp Preview Optimization */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Telegram Instant View */}
      <meta property="telegram:channel" content="@polishcitizenship" />
      <meta name="telegram:card" content="summary_large_image" />
      
      {/* Hreflang tags for international SEO */}
      {languages.map(lang => (
        <link
          key={`hreflang-${lang}`}
          rel="alternate"
          hrefLang={lang}
          href={`${baseUrl}/${lang}`}
        />
      ))}
      
      {/* Regional English variants for USA, UK, Canada, Australia */}
      {englishRegions.map(region => (
        <link
          key={`hreflang-${region}`}
          rel="alternate"
          hrefLang={region}
          href={`${baseUrl}/en`}
        />
      ))}
      
      {/* x-default for users not matching any language */}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en`} />
      
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

// Regional English variants for hreflang
const englishRegions = ['en-US', 'en-GB', 'en-CA', 'en-AU'];
