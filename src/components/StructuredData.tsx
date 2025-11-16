import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export function StructuredData() {
  const { t, i18n } = useTranslation();
  const baseUrl = window.location.origin;
  const currentLang = i18n.language;
  
  // Legal Service Schema
  const legalServiceData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": t('seo.home.title'),
    "description": t('seo.home.description'),
    "url": baseUrl,
    "inLanguage": currentLang,
    "telephone": "+48-22-123-4567",
    "email": "contact@polishcitizenshipportal.com",
    "priceRange": "€3,500 - €12,500",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Aleje Jerozolimskie 123",
      "addressLocality": "Warsaw",
      "addressRegion": "Mazowieckie",
      "postalCode": "00-001",
      "addressCountry": "PL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "52.2297",
      "longitude": "21.0122"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" },
      { "@type": "Country", "name": "Israel" },
      { "@type": "Country", "name": "Germany" },
      { "@type": "Country", "name": "France" },
      { "@type": "Country", "name": "Spain" }
    ],
    "sameAs": [
      "https://www.facebook.com/polishcitizenshipportal",
      "https://www.linkedin.com/company/polishcitizenshipportal",
      "https://twitter.com/polishcitizen"
    ]
  };

  // Multilingual FAQ Schema
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "inLanguage": currentLang,
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('faq.eligibility.q1'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.eligibility.a1')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.eligibility.q2'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.eligibility.a2')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.timeline.q1'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.timeline.a1')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.timeline.q3'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.timeline.a3')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.costs.q1'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.costs.a1')
        }
      }
    ]
  };

  // LocalBusiness Schema
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${baseUrl}/#organization`,
    "name": "Polish Citizenship Portal",
    "alternateName": "PolishCitizenship.pl",
    "description": t('seo.home.description'),
    "url": baseUrl,
    "logo": `${baseUrl}/lovable-uploads/logo.png`,
    "image": `${baseUrl}/og/${currentLang}-og-image.jpg`,
    "telephone": "+48-22-123-4567",
    "email": "contact@polishcitizenshipportal.com",
    "priceRange": "€€",
    "currenciesAccepted": "USD, EUR, GBP, PLN",
    "paymentAccepted": "Credit Card, Bank Transfer, PayPal",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Aleje Jerozolimskie 123",
      "addressLocality": "Warsaw",
      "addressRegion": "Mazowieckie",
      "postalCode": "00-001",
      "addressCountry": "PL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "52.2297",
      "longitude": "21.0122"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      "https://www.facebook.com/polishcitizenshipportal",
      "https://www.linkedin.com/company/polishcitizenshipportal",
      "https://twitter.com/polishcitizen"
    ]
  };

  // Review Schema with real testimonials
  const reviewsData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Review",
        "itemReviewed": {
          "@type": "LegalService",
          "@id": `${baseUrl}/#organization`,
          "name": "Polish Citizenship Portal"
        },
        "author": {
          "@type": "Person",
          "name": t('testimonials.reviews.0.name')
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": t('testimonials.reviews.0.text'),
        "inLanguage": currentLang
      },
      {
        "@type": "Review",
        "itemReviewed": {
          "@type": "LegalService",
          "@id": `${baseUrl}/#organization`,
          "name": "Polish Citizenship Portal"
        },
        "author": {
          "@type": "Person",
          "name": t('testimonials.reviews.1.name')
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": t('testimonials.reviews.1.text'),
        "inLanguage": currentLang
      },
      {
        "@type": "Review",
        "itemReviewed": {
          "@type": "LegalService",
          "@id": `${baseUrl}/#organization`,
          "name": "Polish Citizenship Portal"
        },
        "author": {
          "@type": "Person",
          "name": t('testimonials.reviews.2.name')
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": t('testimonials.reviews.2.text'),
        "inLanguage": currentLang
      }
    ]
  };

  // Breadcrumb Schema
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t('nav.home'),
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": t('nav.services'),
        "item": `${baseUrl}#services`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t('nav.timeline'),
        "item": `${baseUrl}#timeline`
      }
    ]
  };

  // Organization Schema
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "Polish Citizenship Portal",
    "alternateName": "PolishCitizenship.pl",
    "url": baseUrl,
    "logo": `${baseUrl}/lovable-uploads/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+48-22-123-4567",
      "contactType": "customer service",
      "email": "contact@polishcitizenshipportal.com",
      "availableLanguage": ["en", "es", "pt", "de", "fr", "he", "ru", "uk"],
      "areaServed": "Worldwide"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Aleje Jerozolimskie 123",
      "addressLocality": "Warsaw",
      "postalCode": "00-001",
      "addressCountry": "PL"
    },
    "founder": {
      "@type": "Organization",
      "name": "Polish Citizenship Portal"
    }
  };

  // WebSite Schema
  const webSiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Polish Citizenship Portal",
    "alternateName": "PolishCitizenship.pl",
    "url": baseUrl,
    "inLanguage": ["en", "es", "pt", "de", "fr", "he", "ru", "uk"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
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
        {JSON.stringify(localBusinessData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(reviewsData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webSiteData)}
      </script>
    </Helmet>
  );
}
