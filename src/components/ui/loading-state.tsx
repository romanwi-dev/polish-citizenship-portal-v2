import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

/**
 * Loading State Component
 * Accessible loading indicator with optional message
 */
export const LoadingState = ({ 
  message = "Loading...", 
  size = "md",
  fullScreen = false 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex items-center justify-center p-8";

  return (
    <div 
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 
          className={`${sizeClasses[size]} animate-spin text-primary`}
          aria-hidden="true"
        />
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      </div>
    </div>
  );
};
