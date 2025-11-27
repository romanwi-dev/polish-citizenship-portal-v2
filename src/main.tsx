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

// Global error handler to catch and log errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error stack:', event.error?.stack);
  if (event.message?.includes('acc[key2]') || event.error?.message?.includes('acc[key2]')) {
    console.error('🔴 FOUND acc[key2] ERROR - Stack trace:', event.error?.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (event.reason?.message?.includes('acc[key2]')) {
    console.error('🔴 FOUND acc[key2] ERROR in promise rejection:', event.reason);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
