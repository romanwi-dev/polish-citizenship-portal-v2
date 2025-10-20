import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18n

// Apply theme immediately before React renders (eliminates flash)
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.add(savedTheme);

// Track performance metrics only in development
if (import.meta.env.DEV) {
  import("./lib/performance").then(({ measurePerformance }) => {
    measurePerformance();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
