import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormCompletionBadgeProps {
  completionPercentage: number;
  filledCount: number;
  totalCount: number;
  isLargeFonts?: boolean;
}

export const FormCompletionBadge = ({
  completionPercentage,
  filledCount,
  totalCount,
  isLargeFonts = false,
}: FormCompletionBadgeProps) => {
  const isComplete = completionPercentage === 100;
  const isPartial = completionPercentage > 0 && completionPercentage < 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-500" />
        )}
        <Badge 
          variant={isComplete ? "default" : isPartial ? "secondary" : "outline"}
          className={isLargeFonts ? "text-base px-4 py-2" : ""}
        >
          {completionPercentage}% Complete ({filledCount}/{totalCount})
        </Badge>
      </div>
      <Progress value={completionPercentage} className="h-2" />
    </div>
  );
};
