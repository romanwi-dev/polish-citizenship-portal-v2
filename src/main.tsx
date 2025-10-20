import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config"; // Initialize i18n
import { measurePerformance } from "./lib/performance";

// Apply theme immediately before React renders (eliminates flash)
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.add(savedTheme);

// Track performance metrics
measurePerformance();

createRoot(document.getElementById("root")!).render(<App />);
