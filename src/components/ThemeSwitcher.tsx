import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeState = 'dark-red' | 'light-red' | 'dark-blue' | 'light-blue';

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<ThemeState>(() => {
    // Check localStorage first, fallback to dark-blue
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as ThemeState;
      if (stored && ['dark-red', 'light-red', 'dark-blue', 'light-blue'].includes(stored)) {
        return stored;
      }
    }
    return "dark-blue";
  });

  useEffect(() => {
    // Apply theme on mount and when it changes
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("light", "dark", "theme-red", "theme-blue");
    
    // Apply new theme classes based on state
    const [mode, color] = theme.split('-') as ['dark' | 'light', 'red' | 'blue'];
    root.classList.add(mode, `theme-${color}`);
    
    // Debug logging
    console.log('🎨 Theme changed to:', theme);
    console.log('📋 HTML classes:', root.className);
    console.log('🔍 Computed --shadow-glow:', getComputedStyle(root).getPropertyValue('--shadow-glow'));
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const cycle: Record<ThemeState, ThemeState> = {
      'dark-blue': 'dark-red',
      'dark-red': 'light-blue',
      'light-blue': 'light-red',
      'light-red': 'dark-blue'
    };
    setThemeState(cycle[theme]);
  };

  // Determine icon and color based on current theme
  const getIconConfig = () => {
    const [mode, color] = theme.split('-') as ['dark' | 'light', 'red' | 'blue'];
    const Icon = mode === 'dark' ? Moon : Sun;
    const iconColor = color === 'red' ? 'hsl(343 79% 53%)' : 'hsl(221 83% 53%)';
    return { Icon, iconColor };
  };

  const { Icon, iconColor } = getIconConfig();

  return (
    <button
      onClick={cycleTheme}
      className="h-8 w-8 md:h-11 md:w-11 rounded-full bg-background/50 border border-border/50 flex items-center justify-center hover:border-primary/50 transition-all"
      aria-label="Toggle theme"
    >
      <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: iconColor }} />
    </button>
  );
}
