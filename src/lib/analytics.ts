/**
 * V7 Hardened Google Analytics 4 Integration
 * Tracks page views, events, and user interactions across all languages
 * WITH SAFE FALLBACKS for missing environment variables
 */

import { env, isGAConfigured } from '@/lib/env';

interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  language?: string;
}

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = env.ga.measurementId;

// Validate GA ID in development
if (import.meta.env.DEV && !isGAConfigured()) {
  console.warn('⚠️ Google Analytics not configured. Analytics disabled.');
}

/**
 * V7 Initialize Google Analytics 4
 * Only loads if GA_MEASUREMENT_ID is properly configured
 * ENHANCED: Safe fallbacks prevent crashes from malformed config
 */
export const initGA = (language: string) => {
  // V7 HARDENING: Multiple safety checks
  if (!isGAConfigured() || import.meta.env.DEV) {
    return;
  }
  
  if (!GA_MEASUREMENT_ID || typeof GA_MEASUREMENT_ID !== 'string' || GA_MEASUREMENT_ID.trim() === '') {
    if (import.meta.env.DEV) {
      console.error('❌ Invalid GA_MEASUREMENT_ID. Analytics initialization aborted.');
    }
    return;
  }

  try {

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };
    
    window.gtag('js', new Date() as any);
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      language: language,
      custom_map: {
        dimension1: 'language',
        dimension2: 'page_type'
      }
    });
  } catch (error) {
    // V7 HARDENING: Prevent GA failures from crashing the app
    if (import.meta.env.DEV) {
      console.error('❌ GA initialization failed:', error);
    }
  }
};

/**
 * V7 Track page view (with error protection)
 */
export const trackPageView = (path: string, title: string, language: string) => {
  if (import.meta.env.DEV || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      language: language,
      page_location: window.location.href
    });
  } catch (error) {
    // V7 HARDENING: Silent fail for tracking errors
    if (import.meta.env.DEV) {
      console.warn('⚠️ GA trackPageView failed:', error);
    }
  }
};

/**
 * V7 Track custom event (with error protection)
 */
export const trackEvent = ({ action, category, label, value, language }: GAEvent) => {
  if (import.meta.env.DEV || !window.gtag) return;

  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      language: language
    });
  } catch (error) {
    // V7 HARDENING: Silent fail for tracking errors
    if (import.meta.env.DEV) {
      console.warn('⚠️ GA trackEvent failed:', error);
    }
  }
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string, language: string) => {
  trackEvent({
    action: 'form_submit',
    category: 'engagement',
    label: formName,
    language: language
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (depth: number, language: string) => {
  trackEvent({
    action: 'scroll',
    category: 'engagement',
    label: `${depth}%`,
    value: depth,
    language: language
  });
};

/**
 * Track outbound link click
 */
export const trackOutboundLink = (url: string, language: string) => {
  trackEvent({
    action: 'click',
    category: 'outbound_link',
    label: url,
    language: language
  });
};

/**
 * Track conversion
 */
export const trackConversion = (conversionType: string, value: number, language: string) => {
  trackEvent({
    action: 'conversion',
    category: 'goal_completion',
    label: conversionType,
    value: value,
    language: language
  });
};
