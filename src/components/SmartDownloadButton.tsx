import { Button } from '@/components/ui/button';
import { Download, Edit, Lock, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

interface SmartDownloadButtonProps {
  completionPercentage: number;
  threshold: number;
  onDownloadEditable: () => void;
  onDownloadFinal: () => void;
  isGenerating?: boolean;
}

/**
 * Phase 2.2: Smart Download Flow
 * Intelligently suggests the right download option
 */
export function SmartDownloadButton({
  completionPercentage,
  threshold,
  onDownloadEditable,
  onDownloadFinal,
  isGenerating = false,
}: SmartDownloadButtonProps) {
  const isComplete = completionPercentage >= threshold;

  // If form is complete, suggest final download
  if (isComplete) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isGenerating} className="gap-2">
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Recommended: Your form is {completionPercentage}% complete
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDownloadFinal} className="gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="font-medium">Final PDF (Ready to Sign)</div>
              <div className="text-xs text-muted-foreground">Locked fields, ready for printing</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownloadEditable} className="gap-2">
            <Edit className="h-4 w-4" />
            <div className="flex-1">
              <div>Editable PDF (For Review)</div>
              <div className="text-xs text-muted-foreground">Can edit in Adobe/Preview</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If form is incomplete, suggest editable download
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isGenerating} className="gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          ⚠️ Form is only {completionPercentage}% complete
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDownloadEditable} className="gap-2">
          <Edit className="h-4 w-4 text-orange-600" />
          <div className="flex-1">
            <div className="font-medium">Draft PDF (Editable)</div>
            <div className="text-xs text-muted-foreground">Finish editing offline</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadFinal} className="gap-2">
          <FileText className="h-4 w-4" />
          <div className="flex-1">
            <div>Final PDF (Not Recommended)</div>
            <div className="text-xs text-muted-foreground">May have missing data</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
