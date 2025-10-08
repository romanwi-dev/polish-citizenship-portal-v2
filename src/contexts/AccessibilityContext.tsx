import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AccessibilityContextType {
  isLargeFonts: boolean;
  toggleFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  const toggleFontSize = () => {
    setIsLargeFonts(prev => !prev);
  };

  useEffect(() => {
    // Apply font size changes to document root for mobile
    if (isLargeFonts) {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [isLargeFonts]);

  return (
    <AccessibilityContext.Provider value={{ isLargeFonts, toggleFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
