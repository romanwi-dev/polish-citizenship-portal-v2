import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

interface WebVitalsMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  ttfb?: number;
  inp?: number;
}

/**
 * Real-time Performance Monitoring Component
 * Displays Core Web Vitals for performance optimization
 */
export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or if explicitly enabled
    if (import.meta.env.DEV || localStorage.getItem('showPerformanceMonitor') === 'true') {
      setIsVisible(true);
    }

    const handleMetric = (metric: Metric) => {
      setMetrics((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
      }));
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScorePercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <CardDescription className="text-xs">Core Web Vitals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* FCP - First Contentful Paint */}
          {metrics.fcp !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>FCP</span>
                <span className={getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}>
                  {Math.round(metrics.fcp)}ms
                </span>
              </div>
              <Progress value={getScorePercentage(metrics.fcp, 3000)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt;1.8s</p>
            </div>
          )}

          {/* LCP - Largest Contentful Paint */}
          {metrics.lcp !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>LCP</span>
                <span className={getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}>
                  {Math.round(metrics.lcp)}ms
                </span>
              </div>
              <Progress value={getScorePercentage(metrics.lcp, 4000)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt;2.5s</p>
            </div>
          )}

          {/* CLS - Cumulative Layout Shift */}
          {metrics.cls !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>CLS</span>
                <span className={getScoreColor(metrics.cls * 1000, { good: 100, poor: 250 })}>
                  {metrics.cls.toFixed(3)}
                </span>
              </div>
              <Progress value={getScorePercentage(metrics.cls * 1000, 250)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt;0.1</p>
            </div>
          )}

          {/* TTFB - Time to First Byte */}
          {metrics.ttfb !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>TTFB</span>
                <span className={getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}>
                  {Math.round(metrics.ttfb)}ms
                </span>
              </div>
              <Progress value={getScorePercentage(metrics.ttfb, 1800)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt;800ms</p>
            </div>
          )}

          {/* INP - Interaction to Next Paint */}
          {metrics.inp !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>INP</span>
                <span className={getScoreColor(metrics.inp, { good: 200, poor: 500 })}>
                  {Math.round(metrics.inp)}ms
                </span>
              </div>
              <Progress value={getScorePercentage(metrics.inp, 500)} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt;200ms</p>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('showPerformanceMonitor');
              setIsVisible(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center pt-2"
          >
            Hide Monitor
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
