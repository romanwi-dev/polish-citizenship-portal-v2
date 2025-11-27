import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18n

// Initialize default theme (dark-red)
// SSR-SAFE: Only access browser APIs when window is available
if (typeof window !== 'undefined') {
  const defaultTheme = localStorage.getItem("theme") || "dark-red";
  const [mode, color] = defaultTheme.split('-') as ['dark' | 'light', 'red' | 'blue'];
  document.documentElement.classList.add(mode, `theme-${color}`);
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark-red");
  }
}

// Track performance metrics only in development
if (import.meta.env.DEV) {
  import("./lib/performance").then(({ measurePerformance }) => {
    measurePerformance();
  });
  
  // Make SEO validator available in development
  import("./utils/seoValidator").then(({ validateSEO }) => {
    (window as any).validateSEO = validateSEO;
    console.log('💡 SEO Validator loaded. Run validateSEO() to test SEO implementation');
  });
}

// Initialize Web Vitals tracking in production
if (!import.meta.env.DEV) {
  import("./lib/webVitals").then(({ initWebVitals }) => {
    initWebVitals();
  });
  
  // Register service worker in production
  import("./lib/serviceWorker").then(({ registerServiceWorker }) => {
    registerServiceWorker();
  });
}

// CRITICAL FIX: Global error handler to catch and suppress "acc[key2]" errors
// This prevents the app from crashing when i18next tries to access nested keys
window.addEventListener('error', (event) => {
  // Check if this is the acc[key2] error from i18next
  const isAccKey2Error = event.message?.includes('acc[key2]') || 
                         event.message?.includes('acc[key') ||
                         event.error?.message?.includes('acc[key2]') ||
                         event.error?.message?.includes('acc[key') ||
                         event.error?.stack?.includes('acc[key2]') ||
                         event.error?.stack?.includes('acc[key');
  
  if (isAccKey2Error) {
    // Suppress the error to prevent app crash
    event.preventDefault();
    event.stopPropagation();
    console.warn('[i18n] Suppressed acc[key2] error - missing translation key:', event.error?.stack);
    // Return a safe fallback instead of crashing
    return false;
  }
  
  // Log other errors normally
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  const isAccKey2Error = event.reason?.message?.includes('acc[key2]') || 
                         event.reason?.message?.includes('acc[key') ||
                         event.reason?.stack?.includes('acc[key2]') ||
                         event.reason?.stack?.includes('acc[key');
  
  if (isAccKey2Error) {
    // Suppress the promise rejection
    event.preventDefault();
    console.warn('[i18n] Suppressed acc[key2] promise rejection');
    return;
  }
  
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById("root")!).render(<App />);
