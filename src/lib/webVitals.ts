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
    // Log to console in DEV mode for visibility
    if (import.meta.env.DEV) {
      console.log(`📊 Web Vital: ${metric.name}`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: metric.delta
      });
      return;
    }

    // Send to Supabase in production
    await supabase.from('performance_logs').insert({
      metric_type: metric.name.toLowerCase(),
      value: Math.round(metric.value),
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown'
    });
  } catch (error) {
    // Log errors in development, silent in production
    if (import.meta.env.DEV) {
      console.error('Failed to log web vitals:', error);
    }
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
