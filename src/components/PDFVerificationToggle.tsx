/**
 * PDF Verification Mode Toggle
 * Allows users to enable/disable AI verification for PDF generation
 */

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PDFVerificationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function PDFVerificationToggle({
  enabled,
  onToggle,
  className = "",
}: PDFVerificationToggleProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Switch
        id="pdf-verification"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="pdf-verification" className="flex items-center gap-2 cursor-pointer">
        AI Verification
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                When enabled, AI will verify PDFs before and after generation:
              </p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li><strong>Pre-verification:</strong> Checks data completeness and mappings</li>
                <li><strong>Post-verification:</strong> Confirms PDF matches proposal</li>
              </ul>
              <p className="text-xs mt-2 text-muted-foreground">
                Helps catch missing data and ensures PDF quality
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
    </div>
  );
}
