import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/v2/setup"; // Initialize i18n V2 Engine

// Initialize default theme (dark-red)
const defaultTheme = localStorage.getItem("theme") || "dark-red";
const [mode, color] = defaultTheme.split('-') as ['dark' | 'light', 'red' | 'blue'];
document.documentElement.classList.add(mode, `theme-${color}`);
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark-red");
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

createRoot(document.getElementById("root")!).render(<App />);
