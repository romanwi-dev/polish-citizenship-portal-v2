import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-background/20 border border-border/10 hover:border-primary/30 transition-all p-0"
    >
      {currentTheme === "dark" ? (
        <Moon className="h-4 w-4 md:h-5 md:w-5 text-foreground/70 transition-all" />
      ) : (
        <Sun className="h-4 w-4 md:h-5 md:w-5 text-foreground/70 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
