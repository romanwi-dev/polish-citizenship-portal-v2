/**
 * Google Analytics Hook
 * Manages GA4 initialization and tracking
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initGA, trackPageView } from '@/lib/analytics';

export const useGoogleAnalytics = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  // Initialize GA on mount
  useEffect(() => {
    initGA(currentLang);
  }, [currentLang]);

  // Track page views on route change
  useEffect(() => {
    const pageTitle = document.title;
    trackPageView(location.pathname, pageTitle, currentLang);
  }, [location.pathname, currentLang]);

  // Track scroll depth
  useEffect(() => {
    let scrollDepthTriggered = {
      '25': false,
      '50': false,
      '75': false,
      '100': false
    };

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      Object.entries(scrollDepthTriggered).forEach(([depth, triggered]) => {
        if (!triggered && scrollPercent >= parseInt(depth)) {
          scrollDepthTriggered[depth as keyof typeof scrollDepthTriggered] = true;
          
          import('@/lib/analytics').then(({ trackScrollDepth }) => {
            trackScrollDepth(parseInt(depth), currentLang);
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentLang]);
};
