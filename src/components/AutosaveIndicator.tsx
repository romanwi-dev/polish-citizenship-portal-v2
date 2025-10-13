import { CheckCircle2, Loader2, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutosaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved?: Date | null;
  className?: string;
}

export const AutosaveIndicator = ({
  status,
  lastSaved,
  className,
}: AutosaveIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "idle":
        return null;
      case "saving":
        return {
          icon: Loader2,
          text: "Saving...",
          className: "text-muted-foreground",
          animate: true,
        };
      case "saved":
        return {
          icon: CheckCircle2,
          text: lastSaved
            ? `Saved at ${lastSaved.toLocaleTimeString()}`
            : "All changes saved",
          className: "text-green-600 dark:text-green-400",
          animate: false,
        };
      case "error":
        return {
          icon: CloudOff,
          text: "Failed to save",
          className: "text-destructive",
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  
  if (!config) return null;
  
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", config.animate && "animate-spin")} />
      <span>{config.text}</span>
    </div>
  );
};
