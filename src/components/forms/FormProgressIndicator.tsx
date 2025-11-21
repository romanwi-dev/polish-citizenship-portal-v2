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
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6"> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm gap-2"> {/* ONBOARDING-UX-SAFE: Smaller text + gap on mobile */}
          <span className="text-muted-foreground truncate flex-shrink"> {/* ONBOARDING-UX-SAFE: Truncate to prevent overflow */}
            Step {currentStep} of {totalSteps}
          </span>
          <span className="font-medium text-primary flex-shrink-0"> {/* ONBOARDING-UX-SAFE: Prevent shrinking */}
            {completionPercentage}% Complete
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Step Indicators */}
      {stepLabels && (
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-2"> {/* ONBOARDING-UX-SAFE: Tighter gap on mobile + padding for scroll shadow */}
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center gap-1 min-w-[50px] sm:min-w-[60px]" /* ONBOARDING-UX-SAFE: Narrower min-width on mobile */
              >
                <div
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-500 ease-out ${ /* ONBOARDING-UX-SAFE: Smaller size + smoother animation */
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary bg-primary/10"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> /* ONBOARDING-UX-SAFE: Responsive icon size */
                  ) : (
                    <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> /* ONBOARDING-UX-SAFE: Responsive icon size */
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs text-center line-clamp-2 leading-tight ${ /* ONBOARDING-UX-SAFE: Smaller text + line clamp */
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
