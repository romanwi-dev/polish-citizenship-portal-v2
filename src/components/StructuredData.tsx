import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export function StructuredData() {
  const { t, i18n } = useTranslation();
  const baseUrl = window.location.origin;
  
  const legalServiceData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": t('seo.home.title'),
    "description": t('seo.home.description'),
    "url": baseUrl,
    "inLanguage": i18n.language,
    "telephone": "+48-22-123-4567",
    "email": "contact@polishcitizenshipportal.com",
    "sameAs": [
      "https://www.facebook.com/polishcitizenshipportal",
      "https://www.linkedin.com/company/polishcitizenshipportal",
      "https://twitter.com/polishcitizen"
    ],
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
      "addressLocality": "Warsaw",
      "streetAddress": "Aleje Jerozolimskie 123"
    },
    "founder": {
      "@type": "Organization",
      "name": "Polish Citizenship Portal"
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does the Polish citizenship process take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Polish citizenship confirmation process typically takes 10-18 months for the initial response, with the entire process ranging from 18 months to 3 years depending on case complexity and documentation availability."
        }
      },
      {
        "@type": "Question",
        "name": "Who is eligible for Polish citizenship by descent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You may be eligible if you have Polish ancestors who maintained their citizenship continuously. Eligibility depends on when your ancestor emigrated and whether they naturalized in another country before having children."
        }
      },
      {
        "@type": "Question",
        "name": "What documents are required for Polish citizenship application?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Required documents typically include birth certificates, marriage certificates, naturalization records, and Polish archival documents for your ancestors. All documents must be translated into Polish by a certified sworn translator."
        }
      },
      {
        "@type": "Question",
        "name": "How much does the Polish citizenship process cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Professional service costs range from €3,500 to €12,500+ depending on case complexity. This includes legal representation, document gathering, translations, and government fees."
        }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Polish Citizenship Services",
        "item": `${baseUrl}#services`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Citizenship Timeline",
        "item": `${baseUrl}#timeline`
      }
    ]
  };
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(legalServiceData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
}
