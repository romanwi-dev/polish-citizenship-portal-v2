import { Sun, Moon, Droplets, Sunset, Trees, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const themes = [
  { name: "Dark", icon: Moon, className: "dark" },
  { name: "Light", icon: Sun, className: "light" },
  { name: "Ocean", icon: Droplets, className: "ocean" },
  { name: "Sunset", icon: Sunset, className: "sunset" },
  { name: "Forest", icon: Trees, className: "forest" },
  { name: "Royal", icon: Crown, className: "royal" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setCurrentTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const changeTheme = (themeClass: string) => {
    setCurrentTheme(themeClass);
    document.documentElement.className = themeClass;
    localStorage.setItem("theme", themeClass);
  };

  const CurrentIcon = themes.find((t) => t.className === currentTheme)?.icon || Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <CurrentIcon className="h-5 w-5 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((theme) => {
          const Icon = theme.icon;
          return (
            <DropdownMenuItem
              key={theme.className}
              onClick={() => changeTheme(theme.className)}
              className={currentTheme === theme.className ? "bg-accent" : ""}
            >
              <Icon className="mr-2 h-4 w-4" />
              {theme.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
