import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  handler: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey;
        
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          metaMatch
        ) {
          event.preventDefault();
          shortcut.handler();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};

// Common shortcuts
export const SHORTCUTS = {
  NEW_CASE: { key: "n", ctrlKey: true, description: "Create new case" },
  SEARCH: { key: "k", ctrlKey: true, description: "Focus search" },
  REFRESH: { key: "r", ctrlKey: true, description: "Refresh cases" },
  CLEAR_FILTERS: { key: "x", ctrlKey: true, description: "Clear all filters" },
  HELP: { key: "?", shiftKey: true, description: "Show keyboard shortcuts" },
};
