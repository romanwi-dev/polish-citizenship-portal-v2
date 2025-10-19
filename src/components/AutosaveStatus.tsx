import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AutoSaveStatus } from "@/hooks/useAutoSave";

interface AutosaveStatusProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
}

export const AutosaveStatus = ({ status, lastSaved }: AutosaveStatusProps) => {
  const getStatusDisplay = () => {
    switch (status) {
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Saved {lastSaved ? formatDistanceToNow(lastSaved, { addSuffix: true }) : "just now"}
            </span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Save failed</span>
          </div>
        );
      default:
        return lastSaved ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
          </div>
        ) : null;
    }
  };

  return <div className="flex items-center justify-end">{getStatusDisplay()}</div>;
};
