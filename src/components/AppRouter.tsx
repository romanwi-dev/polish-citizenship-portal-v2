/**
 * AppRouter Component
 * Handles routing and Google Analytics tracking
 */

import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

export const AppRouter = ({ children }: { children: React.ReactNode }) => {
  // Initialize Google Analytics and track page views
  useGoogleAnalytics();
  
  return <>{children}</>;
};
