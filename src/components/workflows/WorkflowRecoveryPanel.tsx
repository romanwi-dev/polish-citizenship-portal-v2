/**
 * PHASE 4: Workflow Recovery Panel
 * Displays error recovery options and allows manual retry
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  RefreshCw,
  PlayCircle,
  History,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkflowPersistence } from '@/hooks/useWorkflowPersistence';
import type { WorkflowState } from '@/hooks/useWorkflowState';

interface WorkflowRecoveryPanelProps {
  caseId: string;
  currentState: WorkflowState;
  onRestore: (state: Partial<WorkflowState>) => void;
  onRetry: () => void;
  onClear: () => void;
}

export function WorkflowRecoveryPanel({
  caseId,
  currentState,
  onRestore,
  onRetry,
  onClear
}: WorkflowRecoveryPanelProps) {
  const { toast } = useToast();
  const {
    restoreState,
    hasRecoverableState,
    listCheckpoints,
    restoreFromCheckpoint,
    clearPersistedState
  } = useWorkflowPersistence(caseId);

  const [hasRecovery, setHasRecovery] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Array<{
    id: string;
    label: string;
    stage: string;
    created_at: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkRecoveryAvailable();
    loadCheckpoints();
  }, []);

  const checkRecoveryAvailable = async () => {
    const available = await hasRecoverableState();
    setHasRecovery(available);
  };

  const loadCheckpoints = async () => {
    const cps = await listCheckpoints();
    setCheckpoints(cps);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const restoredState = await restoreState();
      if (restoredState) {
        onRestore(restoredState);
        toast({
          title: "Workflow Restored",
          description: `Resumed from stage: ${restoredState.currentStage}`
        });
      } else {
        toast({
          title: "Restoration Failed",
          description: "Could not restore workflow state",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreCheckpoint = async (checkpointId: string) => {
    setIsLoading(true);
    try {
      const restoredState = await restoreFromCheckpoint(checkpointId);
      if (restoredState) {
        onRestore(restoredState);
        toast({
          title: "Checkpoint Restored",
          description: `Resumed from: ${restoredState.currentStage}`
        });
      } else {
        toast({
          title: "Restoration Failed",
          description: "Could not restore from checkpoint",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearRecovery = async () => {
    const success = await clearPersistedState();
    if (success) {
      setHasRecovery(false);
      onClear();
      toast({
        title: "Recovery Data Cleared",
        description: "Workflow state has been reset"
      });
    }
  };

  if (currentState.status !== 'failed' && !hasRecovery && checkpoints.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Workflow Recovery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Error */}
        {currentState.status === 'failed' && currentState.lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Error Details:</div>
              <div className="text-sm">{currentState.lastError}</div>
              <div className="text-xs mt-2 text-muted-foreground">
                Stage: {currentState.currentStage} | Retry Count: {currentState.retryCount}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-wrap gap-2">
          {hasRecovery && (
            <Button
              onClick={handleRestore}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Resume from Last Save
            </Button>
          )}

          {currentState.status === 'failed' && (
            <Button
              onClick={onRetry}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry Current Stage
            </Button>
          )}

          {(hasRecovery || currentState.status === 'failed') && (
            <Button
              onClick={handleClearRecovery}
              disabled={isLoading}
              variant="ghost"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Clear & Start Fresh
            </Button>
          )}
        </div>

        {/* Failed Steps */}
        {currentState.steps.some(s => s.status === 'failed') && (
          <div className="space-y-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Failed Steps
            </div>
            <div className="space-y-1">
              {currentState.steps
                .filter(s => s.status === 'failed')
                .map(step => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">{step.title}</span>
                    </div>
                    {step.error && (
                      <Badge variant="destructive" className="text-xs">
                        {step.error.substring(0, 50)}...
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Checkpoints */}
        {checkpoints.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              Available Checkpoints
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {checkpoints.map(checkpoint => (
                <button
                  key={checkpoint.id}
                  onClick={() => handleRestoreCheckpoint(checkpoint.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-2 rounded bg-muted hover:bg-muted/70 border transition-colors text-left"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{checkpoint.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Stage: {checkpoint.stage}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(checkpoint.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div className="font-semibold">Recovery Tips:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if all required documents are properly uploaded</li>
            <li>Verify AI consent is granted for the case</li>
            <li>Ensure Dropbox paths are correct and accessible</li>
            <li>Review error details above for specific issues</li>
            <li>Try resuming from the last checkpoint if available</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
