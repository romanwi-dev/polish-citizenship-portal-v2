import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18n

// Lock portal in permanent dark mode
document.documentElement.classList.add("dark");
localStorage.setItem("theme", "dark");

// Track performance metrics only in development
if (import.meta.env.DEV) {
  import("./lib/performance").then(({ measurePerformance }) => {
    measurePerformance();
  });
}

// Initialize Web Vitals tracking in production
if (!import.meta.env.DEV) {
  import("./lib/webVitals").then(({ initWebVitals }) => {
    initWebVitals();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
