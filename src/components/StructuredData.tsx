import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export function StructuredData() {
  const { t, i18n } = useTranslation();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": t('seo.home.title'),
    "description": t('seo.home.description'),
    "url": window.location.href,
    "inLanguage": i18n.language,
    "areaServed": [
      { "@type": "Country", "name": "Poland" },
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "Germany" },
      { "@type": "Country", "name": "France" },
      { "@type": "Country", "name": "Spain" },
      { "@type": "Country", "name": "Israel" },
      { "@type": "Country", "name": "Ukraine" }
    ],
    "priceRange": "€3,500 - €12,500+",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "5000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL",
      "addressLocality": "Warsaw"
    },
    "founder": {
      "@type": "Organization",
      "name": "Polish Citizenship Portal"
    }
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
