/**
 * Web Vitals monitoring for Core Web Vitals tracking
 * Sends metrics to Supabase for analysis
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const sendToAnalytics = async (metric: Metric) => {
  try {
    // Only send in production to avoid polluting dev data
    if (import.meta.env.DEV) return;

    await supabase.from('performance_logs').insert({
      metric_type: metric.name.toLowerCase(),
      value: Math.round(metric.value),
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown'
    });
  } catch (error) {
    // Silently fail - don't break the app due to analytics
    console.error('Failed to log web vitals:', error);
  }
};

export const initWebVitals = () => {
  // Track all Core Web Vitals
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
};
