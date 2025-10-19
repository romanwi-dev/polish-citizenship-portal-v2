import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
  stepLabels?: string[];
}

export const FormProgressIndicator = ({
  currentStep,
  totalSteps,
  completionPercentage,
  stepLabels,
}: FormProgressIndicatorProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="font-medium text-primary">
            {completionPercentage}% Complete
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Step Indicators */}
      {stepLabels && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary bg-primary/10"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`text-xs text-center ${
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
