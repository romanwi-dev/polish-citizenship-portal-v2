import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValidationFeedbackProps {
  type: "success" | "error" | "info";
  message: string;
  className?: string;
}

export const FormValidationFeedback = ({
  type,
  message,
  className,
}: FormValidationFeedbackProps) => {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const styles = {
    success: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    error: "text-destructive bg-destructive/10 border-destructive/20",
    info: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg border text-sm",
        styles[type],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};
