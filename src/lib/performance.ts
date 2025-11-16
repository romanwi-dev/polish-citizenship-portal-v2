import { logger } from './logger';

export const measurePerformance = () => {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      // Performance metrics logged in development only
      logger.log('🚀 Performance Metrics:', {
        'First Contentful Paint (FCP)': fcp ? `${fcp.startTime.toFixed(0)}ms` : 'N/A',
        'DOM Interactive (TTI approx)': `${(perfData.domInteractive - perfData.fetchStart).toFixed(0)}ms`,
        'Page Load Complete': `${(perfData.loadEventEnd - perfData.fetchStart).toFixed(0)}ms`,
        'DNS Lookup': `${(perfData.domainLookupEnd - perfData.domainLookupStart).toFixed(0)}ms`,
        'TCP Connection': `${(perfData.connectEnd - perfData.connectStart).toFixed(0)}ms`,
        'Response Time': `${(perfData.responseEnd - perfData.requestStart).toFixed(0)}ms`,
      });
    }, 0);
  });
};
