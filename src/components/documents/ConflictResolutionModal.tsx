import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ConflictResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: {
    id: string;
    field_name: string;
    ocr_value: string | null;
    manual_value: string | null;
    ocr_confidence: number | null;
    documents?: {
      name: string;
      person_type: string;
      type: string;
    };
  } | null;
  onResolve: (conflictId: string, resolution: 'ocr' | 'manual' | 'ignore', notes?: string) => void;
  isResolving: boolean;
}

export const ConflictResolutionModal = ({
  open,
  onOpenChange,
  conflict,
  onResolve,
  isResolving
}: ConflictResolutionModalProps) => {
  const [notes, setNotes] = useState('');

  if (!conflict) return null;

  const handleResolve = (resolution: 'ocr' | 'manual' | 'ignore') => {
    onResolve(conflict.id, resolution, notes);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Resolve Data Conflict
          </DialogTitle>
          <DialogDescription>
            Choose which value to use for this field
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-sm">{conflict.documents?.name}</p>
              <p className="text-xs text-muted-foreground">
                {conflict.documents?.person_type} - {conflict.documents?.type}
              </p>
            </div>
          </div>

          {/* Field name */}
          <div>
            <p className="text-sm font-medium mb-2">Field: {conflict.field_name}</p>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* OCR Value */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">From OCR</p>
                {conflict.ocr_confidence && (
                  <Badge 
                    variant="outline"
                    className={
                      conflict.ocr_confidence > 80 ? 'border-green-500/50 text-green-700' :
                      conflict.ocr_confidence > 60 ? 'border-yellow-500/50 text-yellow-700' :
                      'border-red-500/50 text-red-700'
                    }
                  >
                    {conflict.ocr_confidence}% confident
                  </Badge>
                )}
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-mono">{conflict.ocr_value || '(empty)'}</p>
              </div>
              <Button
                onClick={() => handleResolve('ocr')}
                disabled={isResolving}
                variant="outline"
                className="w-full"
              >
                Use OCR Value
              </Button>
            </div>

            {/* Manual Value */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Manually Entered</p>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm font-mono">{conflict.manual_value || '(empty)'}</p>
              </div>
              <Button
                onClick={() => handleResolve('manual')}
                disabled={isResolving}
                variant="outline"
                className="w-full"
              >
                Keep Manual Value
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resolution Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about why you chose this resolution..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleResolve('ignore')}
              disabled={isResolving}
              variant="ghost"
              className="flex-1"
            >
              Ignore Conflict
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
