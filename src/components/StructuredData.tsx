import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export function StructuredData() {
  const { t, i18n } = useTranslation('landing');
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

  // ContactPoint Schema for AI Engines
  const contactPointData = {
    "@context": "https://schema.org",
    "@type": "ContactPoint",
    "telephone": "+48-22-123-4567",
    "email": "contact@polishcitizenshipportal.com",
    "contactType": "customer service",
    "availableLanguage": ["en", "pl", "es", "pt", "de", "fr", "he", "ru", "uk"],
    "areaServed": "Worldwide"
  };

  // Service Catalog Schema
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Polish Citizenship by Descent",
    "provider": {
      "@type": "LegalService",
      "name": "Polish Citizenship Portal"
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "Australia" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Citizenship Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Full Citizenship Application",
            "description": "Complete assistance with Polish citizenship by descent application"
          },
          "price": "8500",
          "priceCurrency": "EUR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Document Retrieval",
            "description": "Archive search and document retrieval from Polish archives"
          },
          "price": "2500",
          "priceCurrency": "EUR"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Eligibility Assessment",
            "description": "Professional evaluation of citizenship eligibility"
          },
          "price": "500",
          "priceCurrency": "EUR"
        }
      ]
    }
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

  // Organization Schema with Knowledge Graph Optimization
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "Polish Citizenship Portal",
    "alternateName": "PolishCitizenship.pl",
    "url": baseUrl,
    "logo": `${baseUrl}/lovable-uploads/logo.png`,
    "foundingDate": "2020-01-01",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Warsaw",
        "addressCountry": "PL"
      }
    },
    "knowsAbout": [
      "Polish Citizenship Law",
      "Citizenship by Descent",
      "Polish Archives",
      "Document Authentication",
      "Genealogy Research"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+48-22-123-4567",
        "email": "contact@polishcitizenshipportal.com",
        "contactType": "customer service",
        "availableLanguage": ["en", "pl", "es", "pt", "de", "fr", "he", "ru", "uk"],
        "areaServed": "Worldwide"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/polishcitizenshipportal",
      "https://www.linkedin.com/company/polishcitizenshipportal",
      "https://twitter.com/polishcitizen"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Aleje Jerozolimskie 123",
      "addressLocality": "Warsaw",
      "addressRegion": "Mazowieckie",
      "postalCode": "00-001",
      "addressCountry": "PL"
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
        {JSON.stringify(contactPointData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(serviceData)}
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
