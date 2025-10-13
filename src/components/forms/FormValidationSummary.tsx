import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationError } from "@/hooks/useFieldValidation";

interface FormValidationSummaryProps {
  errors: ValidationError[];
  className?: string;
}

export const FormValidationSummary = ({
  errors,
  className,
}: FormValidationSummaryProps) => {
  if (errors.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-4 rounded-lg border",
          "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
          "text-green-700 dark:text-green-400",
          className
        )}
      >
        <CheckCircle2 className="h-5 w-5" />
        <p className="font-medium">All required fields are valid</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-lg border",
        "bg-destructive/10 border-destructive/20",
        "text-destructive",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p className="font-medium">
          {errors.length} field{errors.length !== 1 ? "s" : ""} require{errors.length === 1 ? "s" : ""} attention
        </p>
      </div>
      <ul className="ml-7 space-y-1 text-sm">
        {errors.slice(0, 5).map((error, idx) => (
          <li key={idx}>
            <strong>{error.field}</strong>: {error.message}
          </li>
        ))}
        {errors.length > 5 && (
          <li className="text-muted-foreground">
            ...and {errors.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
};
