/**
 * Admin: Workflow Recovery Browser
 * Browse and manage workflow recovery across all cases
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  History,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkflowPersistence {
  id: string;
  case_id: string;
  status: string;
  current_stage: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  case?: {
    client_name: string;
    client_code: string;
  };
}

export function WorkflowRecoveryBrowser() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<WorkflowPersistence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'failed' | 'paused'>('all');

  useEffect(() => {
    loadWorkflows();
  }, [filter]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('workflow_persistence')
        .select(`
          *,
          case:cases(client_name, client_code)
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (filter === 'failed') {
        query = query.eq('status', 'failed');
      } else if (filter === 'paused') {
        query = query.eq('status', 'paused');
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "Failed to load workflows",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearWorkflow = async (workflowId: string, caseName: string) => {
    if (!confirm(`Clear recovery data for ${caseName}?`)) return;

    try {
      const { error } = await supabase
        .from('workflow_persistence')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: "Recovery Data Cleared",
        description: `Cleared workflow for ${caseName}`
      });

      loadWorkflows();
    } catch (error) {
      console.error('Error clearing workflow:', error);
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear workflow",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Paused</Badge>;
      case 'running':
        return <Badge variant="default" className="gap-1"><RefreshCw className="h-3 w-3" />Running</Badge>;
      case 'completed':
        return <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const failedCount = workflows.filter(w => w.status === 'failed').length;
  const pausedCount = workflows.filter(w => w.status === 'paused').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Workflow Recovery Browser
          </CardTitle>
          <CardDescription>
            View and manage workflow recovery state across all cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="text-2xl font-bold">{workflows.length}</div>
              <div className="text-xs text-muted-foreground">Total Workflows</div>
            </div>
            <div className="p-4 border rounded-lg bg-destructive/10">
              <div className="text-2xl font-bold text-destructive">{failedCount}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-4 border rounded-lg bg-muted">
              <div className="text-2xl font-bold">{pausedCount}</div>
              <div className="text-xs text-muted-foreground">Paused</div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({workflows.length})
            </Button>
            <Button
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              Failed ({failedCount})
            </Button>
            <Button
              variant={filter === 'paused' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('paused')}
            >
              Paused ({pausedCount})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadWorkflows}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Workflows List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading workflows...
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
              No workflows found
            </div>
          ) : (
            <ScrollArea className="h-96 border rounded-lg">
              <div className="space-y-2 p-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {workflow.case?.[0]?.client_name || 'Unknown Case'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({workflow.case?.[0]?.client_code || workflow.case_id.substring(0, 8)})
                          </span>
                          {getStatusBadge(workflow.status)}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Stage: <span className="font-mono text-xs">{workflow.current_stage}</span></span>
                            <span>Retries: {workflow.retry_count}</span>
                          </div>
                        </div>

                        {workflow.last_error && (
                          <div className="text-xs p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {workflow.last_error}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Updated: {new Date(workflow.updated_at).toLocaleString()}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearWorkflow(
                          workflow.id,
                          workflow.case?.[0]?.client_name || 'Unknown Case'
                        )}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground p-4 border rounded-lg bg-muted/50">
            <div className="font-semibold mb-2">About Workflow Recovery:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>This shows workflows that have been paused or failed</li>
              <li>Failed workflows can be retried from the case detail page</li>
              <li>Clearing recovery data removes checkpoints and starts fresh</li>
              <li>Workflow state is automatically saved every 30 seconds</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
