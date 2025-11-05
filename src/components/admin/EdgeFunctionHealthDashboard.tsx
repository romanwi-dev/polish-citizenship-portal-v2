import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, AlertTriangle, CheckCircle2, XCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FunctionHealth {
  functionName: string;
  status: 'healthy' | 'degraded' | 'down';
  errorRate: number;
  avgResponseTime: number;
  successRate: number;
  lastError?: string;
}

export function EdgeFunctionHealthDashboard() {
  const { data: healthData, isLoading, refetch } = useQuery({
    queryKey: ['edge-function-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edge_function_health')
        .select('*')
        .order('check_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: healingLog } = useQuery({
    queryKey: ['healing-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edge_function_healing_log')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const runHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-monitor');
      if (error) throw error;
      toast.success('Health check completed');
      refetch();
    } catch (error: any) {
      toast.error(`Health check failed: ${error.message}`);
    }
  };

  const runAutoHeal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-heal-functions');
      if (error) throw error;
      toast.success('Auto-heal process completed');
      refetch();
    } catch (error: any) {
      toast.error(`Auto-heal failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Health Monitor</CardTitle>
          <CardDescription>Loading health data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const healthReport = (healthData?.health_report as unknown as FunctionHealth[]) || [];
  const systemHealth = {
    overall_status: healthData?.overall_status || 'unknown',
    total_functions: healthData?.total_functions || 0,
    healthy_count: healthData?.healthy_count || 0,
    degraded_count: healthData?.degraded_count || 0,
    down_count: healthData?.down_count || 0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Edge Function Health Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all {systemHealth.total_functions} edge functions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={runHealthCheck} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Run Check
              </Button>
              <Button onClick={runAutoHeal} variant="outline" size="sm">
                <Wrench className="h-4 w-4 mr-2" />
                Auto-Heal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-background">
              <div className="text-3xl font-bold text-success">
                {systemHealth.healthy_count}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background">
              <div className="text-3xl font-bold text-warning">
                {systemHealth.degraded_count}
              </div>
              <div className="text-sm text-muted-foreground">Degraded</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background">
              <div className="text-3xl font-bold text-destructive">
                {systemHealth.down_count}
              </div>
              <div className="text-sm text-muted-foreground">Down</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background">
              <div className="text-3xl font-bold">
                {Math.round((systemHealth.healthy_count / systemHealth.total_functions) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Health Score</div>
            </div>
          </div>

          {systemHealth.down_count > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {systemHealth.down_count} critical function{systemHealth.down_count > 1 ? 's' : ''} down! Auto-healing in progress.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Function Details */}
      <Card>
        <CardHeader>
          <CardTitle>Function Status Details</CardTitle>
          <CardDescription>Individual function health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {healthReport.map((func, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(func.status)}
                    <div className="flex-1">
                      <div className="font-medium">{func.functionName}</div>
                      {func.lastError && (
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                          {func.lastError}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="font-medium">{func.successRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{func.avgResponseTime.toFixed(0)}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                    {getStatusBadge(func.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Healing Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Auto-Healing Activity
          </CardTitle>
          <CardDescription>Recent automatic recovery actions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {healingLog?.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <div className="font-medium text-sm">{log.function_name}</div>
                    <div className="text-xs text-muted-foreground">{log.details}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={log.result === 'success' ? 'default' : 'destructive'}>
                      {log.result}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.performed_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {!healingLog || healingLog.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No healing actions yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
