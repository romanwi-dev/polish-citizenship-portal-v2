import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  FileX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkflowError {
  id: string;
  created_at: string;
  workflow_run_id: string;
  document_id: string;
  stage: string;
  error_message: string;
  error_details: any;
  retry_count: number;
  resolved: boolean;
  resolution_notes?: string;
  documents?: {
    name: string;
  };
}

interface ErrorRecoveryPanelProps {
  workflowRunId: string;
  onRetry: (documentIds: string[], stage: string) => Promise<void>;
}

export function ErrorRecoveryPanel({ workflowRunId, onRetry }: ErrorRecoveryPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: errors, isLoading } = useQuery({
    queryKey: ['workflow-errors', workflowRunId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_errors')
        .select('*, documents(name)')
        .eq('workflow_run_id', workflowRunId)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WorkflowError[];
    },
    enabled: !!workflowRunId
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ errorIds, notes }: { errorIds: string[], notes: string }) => {
      const { error } = await supabase
        .from('workflow_errors')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolution_notes: notes
        })
        .in('id', errorIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-errors', workflowRunId] });
      setSelectedErrors(new Set());
      setResolutionNotes("");
      toast({
        title: "Errors Resolved",
        description: "Selected errors have been marked as resolved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Resolution Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleExpanded = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const toggleSelected = (errorId: string) => {
    setSelectedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const handleRetrySelected = async () => {
    if (selectedErrors.size === 0) return;

    const selectedErrorsList = errors?.filter(e => selectedErrors.has(e.id)) || [];
    
    // Group errors by stage
    const errorsByStage = selectedErrorsList.reduce((acc, error) => {
      if (!acc[error.stage]) acc[error.stage] = [];
      acc[error.stage].push(error.document_id);
      return acc;
    }, {} as Record<string, string[]>);

    try {
      // Retry each stage
      for (const [stage, documentIds] of Object.entries(errorsByStage)) {
        await onRetry(documentIds, stage);
      }

      toast({
        title: "Retry Initiated",
        description: `Retrying ${selectedErrors.size} failed operation(s)...`
      });
      
      setSelectedErrors(new Set());
    } catch (error: any) {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResolve = () => {
    if (selectedErrors.size === 0) return;
    
    resolveMutation.mutate({
      errorIds: Array.from(selectedErrors),
      notes: resolutionNotes
    });
  };

  const handleSkip = async () => {
    if (selectedErrors.size === 0) return;

    await resolveMutation.mutateAsync({
      errorIds: Array.from(selectedErrors),
      notes: resolutionNotes || "Manually skipped by user"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Recovery ({errors.length})
          </CardTitle>
          {selectedErrors.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetrySelected}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry ({selectedErrors.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
              >
                <FileX className="h-4 w-4 mr-2" />
                Skip
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error List */}
        <div className="space-y-3">
          {errors.map((error) => {
            const isExpanded = expandedErrors.has(error.id);
            const isSelected = selectedErrors.has(error.id);

            return (
              <div
                key={error.id}
                className={cn(
                  "border rounded-lg transition-all",
                  isSelected ? "border-primary bg-primary/5" : "border-destructive/30"
                )}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleExpanded(error.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelected(error.id);
                      }}
                      className="cursor-pointer"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {error.documents?.name || 'Unknown Document'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {error.stage}
                        </Badge>
                        {error.retry_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Retry #{error.retry_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {error.error_message}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>

                {isExpanded && (
                  <div className="border-t bg-muted/20 p-4 space-y-3">
                    <div>
                      <h5 className="font-semibold text-sm mb-2">Error Message</h5>
                      <p className="text-sm text-destructive">{error.error_message}</p>
                    </div>

                    {error.error_details && Object.keys(error.error_details).length > 0 && (
                      <div>
                        <h5 className="font-semibold text-sm mb-2">Error Details</h5>
                        <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                          {JSON.stringify(error.error_details, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <p>First occurred: {new Date(error.created_at).toLocaleString()}</p>
                      <p>Retry attempts: {error.retry_count}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resolution Notes */}
        {selectedErrors.size > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">
              Resolution Notes (optional for skip, required for manual resolve)
            </label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how you resolved this issue or why you're skipping it..."
              rows={3}
            />
            
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleResolve}
                disabled={resolveMutation.isPending}
                variant="default"
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
