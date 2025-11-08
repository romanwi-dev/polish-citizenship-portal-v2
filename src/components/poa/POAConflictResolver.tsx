import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOCRConflictDetection } from "@/hooks/useOCRConflictDetection";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface POAConflictResolverProps {
  caseId: string;
}

export const POAConflictResolver = ({ caseId }: POAConflictResolverProps) => {
  const { conflicts, conflictCount, resolveConflict, isResolving } = useOCRConflictDetection(caseId);

  if (conflictCount === 0) return null;

  // Group conflicts by document
  const groupedConflicts = conflicts.reduce((acc: any, conflict: any) => {
    const docId = conflict.document_id;
    if (!acc[docId]) {
      acc[docId] = {
        documentName: conflict.documents?.name || 'Unknown Document',
        documentType: conflict.documents?.type || '',
        personType: conflict.documents?.person_type || '',
        conflicts: []
      };
    }
    acc[docId].conflicts.push(conflict);
    return acc;
  }, {});

  const handleApplyAll = () => {
    conflicts.forEach(conflict => {
      resolveConflict({
        conflictId: conflict.id,
        resolution: 'ocr',
        notes: 'Bulk: Applied all OCR values'
      });
    });
  };

  const handleKeepAll = () => {
    conflicts.forEach(conflict => {
      resolveConflict({
        conflictId: conflict.id,
        resolution: 'manual',
        notes: 'Bulk: Kept all manual values'
      });
    });
  };

  return (
    <Card className="border-warning">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <CardTitle>OCR Conflicts Detected</CardTitle>
          </div>
          <Badge variant="destructive">{conflictCount} conflicts</Badge>
        </div>
        <CardDescription>
          OCR extracted different values than manually entered. Review and resolve conflicts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyAll}
            disabled={isResolving}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply All OCR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleKeepAll}
            disabled={isResolving}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Keep All Manual
          </Button>
        </div>

        <Separator />

        {/* Grouped Conflicts */}
        {Object.entries(groupedConflicts).map(([docId, group]: [string, any]) => (
          <div key={docId} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{group.documentName}</h4>
              {group.personType && (
                <Badge variant="secondary" className="text-xs">
                  {group.personType}
                </Badge>
              )}
              {group.documentType && (
                <Badge variant="outline" className="text-xs">
                  {group.documentType}
                </Badge>
              )}
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-muted">
              {group.conflicts.map((conflict: any) => (
                <div key={conflict.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{conflict.field_name}</span>
                    {conflict.ocr_confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(conflict.ocr_confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">OCR Value</div>
                      <div className="font-mono bg-background p-2 rounded border">
                        {conflict.ocr_value || '(empty)'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Manual Value</div>
                      <div className="font-mono bg-background p-2 rounded border">
                        {conflict.manual_value || '(empty)'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => resolveConflict({
                        conflictId: conflict.id,
                        resolution: 'ocr',
                        notes: 'Applied OCR value'
                      })}
                      disabled={isResolving}
                    >
                      Use OCR
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConflict({
                        conflictId: conflict.id,
                        resolution: 'manual',
                        notes: 'Kept manual value'
                      })}
                      disabled={isResolving}
                    >
                      Keep Manual
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveConflict({
                        conflictId: conflict.id,
                        resolution: 'ignore',
                        notes: 'Ignored conflict'
                      })}
                      disabled={isResolving}
                    >
                      Ignore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
