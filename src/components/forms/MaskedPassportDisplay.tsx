import { Eye, EyeOff, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { maskPassportNumber, getMaskingTooltip } from "@/utils/passportMasking";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface MaskedPassportDisplayProps {
  passportNumber: string | null | undefined;
  className?: string;
  allowUnmask?: boolean; // Only admins can unmask
}

export const MaskedPassportDisplay = ({ 
  passportNumber, 
  className = "",
  allowUnmask = true 
}: MaskedPassportDisplayProps) => {
  const [isUnmasked, setIsUnmasked] = useState(false);
  const { user } = useAuth();
  const userRole = useUserRole(user?.id);
  const canUnmask = allowUnmask && (userRole.data === 'admin' || userRole.data === 'assistant');

  if (!passportNumber) {
    return <span className={className}>-</span>;
  }

  const displayValue = isUnmasked ? passportNumber : maskPassportNumber(passportNumber);

  return (
    <div className="inline-flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`font-mono tracking-wide ${className}`}>
              {displayValue}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{getMaskingTooltip()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {canUnmask && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsUnmasked(!isUnmasked)}
              >
                {isUnmasked ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {isUnmasked ? 'Hide' : 'Show'} full passport number
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs max-w-xs">
              <p className="font-semibold mb-1">Passport Security</p>
              <p>Numbers are masked in UI for privacy.</p>
              <p className="mt-1">Full numbers appear in:</p>
              <ul className="list-disc list-inside mt-1">
                <li>POA documents</li>
                <li>Official PDFs</li>
                <li>Citizenship applications</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
