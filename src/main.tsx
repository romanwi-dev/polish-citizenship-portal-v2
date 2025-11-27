// CRITICAL: Import i18n config FIRST to ensure patches are applied before any other code runs
import "./i18n/config"; // Initialize i18n and apply patches

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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

// Global error handler for development debugging
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    console.error('Error message:', event.message);
    console.error('Error stack:', event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// CRITICAL: Ensure root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found! Cannot render app.');
  throw new Error('Root element (#root) not found in DOM');
}

// Wrap App render in try-catch to prevent blank screen
try {
  createRoot(rootElement).render(<App />);
  if (import.meta.env.DEV) {
    console.log('✅ React app mounted successfully');
  }
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  // Show error message in the DOM
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: red;">
      <h1>Application Error</h1>
      <p>Failed to initialize the application.</p>
      <p style="font-size: 0.9rem; color: #666;">Check the browser console for details.</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 1rem; margin-top: 1rem; border-radius: 4px; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
      </pre>
    </div>
  `;
}
