import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormProgressBarProps {
  completionPercentage: number;
  className?: string;
}

export const FormProgressBar = ({ 
  completionPercentage,
  className 
}: FormProgressBarProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Form Completion</span>
        <span className={cn(
          "font-medium",
          completionPercentage === 100 ? "text-green-500" : 
          completionPercentage >= 80 ? "text-blue-500" :
          completionPercentage >= 50 ? "text-amber-500" :
          "text-red-500"
        )}>
          {completionPercentage}%
        </span>
      </div>
      <Progress 
        value={completionPercentage} 
        className={cn(
          "h-3 transition-all duration-500",
          completionPercentage === 100 && "bg-green-100"
        )}
      />
    </div>
  );
};
