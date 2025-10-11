/**
 * Enhanced form header component with consistent styling
 */

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Maximize2, Minimize2, LogIn } from "lucide-react";
import { FormCompletionBadge } from "./FormCompletionBadge";
import { cn } from "@/lib/utils";

interface FormHeaderProps {
  title: string;
  completionPercentage: number;
  filledCount: number;
  totalCount: number;
  isLargeFonts?: boolean;
  isFullView?: boolean;
  onToggleFullView?: () => void;
  onHelpClick?: () => void;
  showLogin?: boolean;
  onLoginClick?: () => void;
  className?: string;
}

export const FormHeader = ({
  title,
  completionPercentage,
  filledCount,
  totalCount,
  isLargeFonts = false,
  isFullView = false,
  onToggleFullView,
  onHelpClick,
  showLogin = true,
  onLoginClick,
  className,
}: FormHeaderProps) => {
  return (
    <CardHeader className={cn("space-y-4", className)}>
      {/* Mobile layout */}
      <div className="flex flex-col items-center gap-4 sm:hidden">
        <div className="w-full space-y-2">
          <CardTitle className={cn(
            "animate-fade-in text-center",
            isLargeFonts ? "text-4xl" : "text-2xl"
          )}>
            {title}
          </CardTitle>
          <FormCompletionBadge
            completionPercentage={completionPercentage}
            filledCount={filledCount}
            totalCount={totalCount}
            isLargeFonts={isLargeFonts}
          />
        </div>

        <div className="flex items-center gap-2 justify-center w-full">
          {onHelpClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onHelpClick}
              className="shrink-0"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}
          
          {onToggleFullView && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFullView}
              className="hover-scale"
              aria-label={isFullView ? "Exit full view" : "Enter full view"}
            >
              {isFullView ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}

          {showLogin && onLoginClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginClick}
              className="gap-2 hover-scale"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {onHelpClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onHelpClick}
              className="shrink-0"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex-1 space-y-2">
            <CardTitle className={cn(
              "animate-fade-in",
              isLargeFonts ? "text-4xl" : "text-2xl"
            )}>
              {title}
            </CardTitle>
            <FormCompletionBadge
              completionPercentage={completionPercentage}
              filledCount={filledCount}
              totalCount={totalCount}
              isLargeFonts={isLargeFonts}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleFullView && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleFullView}
              className="hover-scale"
              aria-label={isFullView ? "Exit full view" : "Enter full view"}
            >
              {isFullView ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}

          {showLogin && onLoginClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginClick}
              className="gap-2 hover-scale"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
