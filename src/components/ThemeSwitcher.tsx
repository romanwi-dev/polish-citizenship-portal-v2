import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="h-11 w-11 rounded-full bg-background/50 border border-border/50 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <Moon className="h-4 w-4 text-foreground/30" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-11 w-11 rounded-full bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-foreground/30" />
      ) : (
        <Sun className="h-4 w-4 text-foreground/30" />
      )}
    </button>
  );
}
