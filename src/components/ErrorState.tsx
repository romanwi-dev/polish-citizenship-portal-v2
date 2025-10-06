import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = "Error",
  message,
  retry,
  className
}: ErrorStateProps) => {
  return (
    <div className={cn("py-8", className)}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        {retry && (
          <Button 
            onClick={retry} 
            variant="outline" 
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </Alert>
    </div>
  );
};
