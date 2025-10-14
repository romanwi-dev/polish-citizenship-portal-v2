import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressStepper = ({ currentStep, totalSteps, stepLabels }: ProgressStepperProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full py-6 px-4">
      {/* Mobile: Simple progress bar */}
      <div className="block md:hidden">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            {t('step')} {currentStep} {t('of')} {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {stepLabels[currentStep - 1]}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs text-center max-w-[120px] transition-colors",
                      isCurrent && "text-primary font-medium",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                
                {/* Connector line */}
                {index < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all duration-500",
                      stepNumber < currentStep ? "bg-primary" : "bg-secondary"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
