import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setCurrentTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 hover:opacity-80 transition-all"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Moon className="h-4 w-4 text-foreground/30" />
      ) : (
        <Sun className="h-4 w-4 text-foreground/30" />
      )}
    </button>
  );
}
