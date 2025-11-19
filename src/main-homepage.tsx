import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import "./index.css";
import "./i18n/config"; // Initialize i18n

// Initialize default theme (dark-red)
const defaultTheme = localStorage.getItem("theme") || "dark-red";
const [mode, color] = defaultTheme.split('-') as ['dark' | 'light', 'red' | 'blue'];
document.documentElement.classList.add(mode, `theme-${color}`);
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark-red");
}

// Import the homepage component directly (it's already optimized)
import Index from "./pages/Index";

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
    </div>
  }>
    <Index />
  </Suspense>
);
