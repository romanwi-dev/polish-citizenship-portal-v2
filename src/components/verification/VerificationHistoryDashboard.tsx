import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  GitBranch,
  Zap,
  Calendar,
  Target,
  Brain,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface VerificationRun {
  id: string;
  created_at: string;
  trigger_type: string;
  verification_scope: string;
  status: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  average_score: number;
  consensus_level: string;
  successful_models: number;
  total_models: number;
  total_blockers: number;
  duration_ms: number;
  gpt5_score: number;
  gemini_score: number;
  claude_score: number;
}

interface VerificationAlert {
  id: string;
  created_at: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
}

export function VerificationHistoryDashboard() {
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [alerts, setAlerts] = useState<VerificationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadVerificationData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('verification_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_runs'
        },
        () => {
          loadVerificationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedScope]);

  const loadVerificationData = async () => {
    try {
      // Load verification runs
      let runsQuery = supabase
        .from('verification_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedScope !== 'all') {
        runsQuery = runsQuery.eq('verification_scope', selectedScope);
      }

      const { data: runsData, error: runsError } = await runsQuery;

      if (runsError) throw runsError;

      // Load active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('verification_alerts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      setRuns(runsData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error loading verification data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load verification history'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualVerification = async (scope: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-portal', {
        body: {
          verification_run_id: null,
          verification_scope: scope,
          changed_files: []
        }
      });

      if (error) throw error;

      toast({
        title: 'Verification Started',
        description: `Manual verification for ${scope} scope is now running`
      });

      setTimeout(loadVerificationData, 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to trigger verification'
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'github_push': return <GitBranch className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'manual': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Automated Verification History
              </CardTitle>
              <CardDescription>
                Triple-consensus verification runs triggered by code changes and schedule
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualVerification('workflow')}
              >
                Verify Workflow
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerManualVerification('full_portal')}
              >
                Verify Portal
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map(alert => (
                <Alert key={alert.id} variant="destructive">
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-xs">{alert.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scope Filter */}
      <div className="flex gap-2">
        {['all', 'workflow', 'full_portal', 'security', 'forms'].map(scope => (
          <Button
            key={scope}
            variant={selectedScope === scope ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedScope(scope)}
          >
            {scope.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Verification Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : runs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No verification runs yet</div>
            ) : (
              <div className="space-y-4">
                {runs.map(run => (
                  <Card key={run.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getTriggerIcon(run.trigger_type)}
                              <span className="font-medium capitalize">
                                {run.trigger_type.replace('_', ' ')}
                              </span>
                              <Badge variant="outline" className="capitalize">
                                {run.verification_scope.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(run.created_at), 'MMM d, yyyy HH:mm')}
                              {run.branch && ` • ${run.branch}`}
                            </div>
                            {run.commit_message && (
                              <div className="text-xs text-muted-foreground">
                                {run.commit_message.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={run.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {run.status}
                          </Badge>
                        </div>

                        {/* Scores */}
                        {run.status === 'completed' && (
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Consensus</div>
                              <div className="font-bold">{run.consensus_level}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Average</div>
                              <div className={`text-2xl font-bold ${getScoreColor(run.average_score)}`}>
                                {run.average_score}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Models</div>
                              <div className="font-bold">
                                {run.successful_models}/{run.total_models}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Blockers</div>
                              <div className={`text-2xl font-bold ${run.total_blockers > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {run.total_blockers}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Model Scores */}
                        {run.status === 'completed' && (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Sparkles className="h-4 w-4" />
                              <span>GPT-5:</span>
                              <span className={`font-bold ${getScoreColor(run.gpt5_score)}`}>
                                {run.gpt5_score || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Brain className="h-4 w-4" />
                              <span>Gemini:</span>
                              <span className={`font-bold ${getScoreColor(run.gemini_score)}`}>
                                {run.gemini_score || '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Shield className="h-4 w-4" />
                              <span>Claude:</span>
                              <span className={`font-bold ${getScoreColor(run.claude_score)}`}>
                                {run.claude_score || '-'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Duration */}
                        {run.duration_ms && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {(run.duration_ms / 1000).toFixed(1)}s
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
