import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProjectMemoryDashboard() {
  // Get project memory - using direct query to avoid type issues
  const { data: memoryData, refetch } = useQuery({
    queryKey: ['project-memory'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/agent_memory?agent_type=eq.project_memory&select=*`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          }
        }
      );
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Get agent activity
  const { data: activityData } = useQuery({
    queryKey: ['agent-activity-summary'],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/ai_agent_activity?created_at=gte.${oneHourAgo}&select=agent_type,success,response_time_ms`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          }
        }
      );
      return response.json();
    },
    refetchInterval: 30000,
  });

  const runAnalysis = async () => {
    try {
      const { error } = await supabase.functions.invoke('project-memory-agent');
      if (error) throw error;
      toast.success('System analysis completed');
      refetch();
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`);
    }
  };

  const memory = Array.isArray(memoryData) ? memoryData : [];
  const agentActivity = Array.isArray(activityData) ? activityData : [];

  const memoryMap = memory.reduce((acc: any, item: any) => {
    if (item?.memory_key) {
      acc[item.memory_key] = item.memory_value;
    }
    return acc;
  }, {} as Record<string, any>);

  const systemConfig = memoryMap.system_configuration || {};
  const agentCoordMap = memoryMap.agent_coordination_map || {};
  const optimizations = memoryMap.learned_optimizations || [];

  // Calculate agent statistics
  const agentStats = agentActivity.reduce((acc: any, activity: any) => {
    const agentType = activity?.agent_type;
    if (!agentType) return acc; // Skip if agent_type is missing
    
    if (!acc[agentType]) {
      acc[agentType] = { total: 0, success: 0, totalTime: 0 };
    }
    acc[agentType].total++;
    if (activity.success) acc[agentType].success++;
    acc[agentType].totalTime += activity.response_time_ms || 0;
    return acc;
  }, {});

  const getLoadBadge = (load: string) => {
    const variants: Record<string, any> = {
      low: 'default',
      normal: 'secondary',
      high: 'secondary',
      critical: 'destructive',
    };
    const colors: Record<string, string> = {
      low: 'text-success',
      normal: 'text-primary',
      high: 'text-warning',
      critical: 'text-destructive',
    };
    return (
      <Badge variant={variants[load] || 'outline'} className={colors[load]}>
        {load.toUpperCase()}
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
                <Brain className="h-6 w-6" />
                Project Memory Agent
              </CardTitle>
              <CardDescription>
                System-wide intelligence and optimization
              </CardDescription>
            </div>
            <Button onClick={runAnalysis} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-3xl font-bold">
                {systemConfig.active_cases_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Cases</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="flex items-center justify-center gap-2">
                {getLoadBadge(systemConfig.system_load || 'normal')}
              </div>
              <div className="text-sm text-muted-foreground mt-2">System Load</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-3xl font-bold text-warning">
                {systemConfig.resource_allocation?.urgent_tasks || 0}
              </div>
              <div className="text-sm text-muted-foreground">Urgent Tasks</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-3xl font-bold text-primary">
                {systemConfig.resource_allocation?.high_priority_cases || 0}
              </div>
              <div className="text-sm text-muted-foreground">Priority Cases</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Coordination */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Coordination Status
          </CardTitle>
          <CardDescription>Real-time agent workload and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {Object.entries(agentCoordMap).map(([agentType, status]: [string, any]) => (
                <div
                  key={agentType}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {status.status === 'overloaded' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                    {status.status === 'busy' && <Activity className="h-5 w-5 text-warning" />}
                    {status.status === 'idle' && <CheckCircle2 className="h-5 w-5 text-success" />}
                    <div>
                      <div className="font-medium">{agentType}</div>
                      <div className="text-xs text-muted-foreground">
                        Workload: {status.workload} requests/hr
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="font-medium">{status.success_rate?.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Success</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{status.avg_response_time?.toFixed(0)}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                    <Badge variant={
                      status.status === 'overloaded' ? 'destructive' :
                      status.status === 'busy' ? 'secondary' : 'default'
                    }>
                      {status.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {Object.keys(agentCoordMap).length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No agent coordination data yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Learned Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Learned Optimizations
          </CardTitle>
          <CardDescription>System intelligence and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <div className="space-y-3">
              {Array.isArray(optimizations) && optimizations.map((opt: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-background"
                >
                  {typeof opt === 'string' ? (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{opt}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{opt.category}</Badge>
                        <Badge variant={
                          opt.impact === 'high' ? 'default' :
                          opt.impact === 'medium' ? 'secondary' : 'outline'
                        }>
                          {opt.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm mb-1">{opt.suggestion}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence: {(opt.confidence * 100).toFixed(0)}%</span>
                        <span>Learned from: {opt.learned_from}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!optimizations || optimizations.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No optimizations learned yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Integration Health
          </CardTitle>
          <CardDescription>External service status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {systemConfig.integration_status && Object.entries(systemConfig.integration_status).map(([service, status]: [string, any]) => (
              <div key={service} className="text-center p-4 rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  {status === 'healthy' ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : status === 'degraded' ? (
                    <AlertTriangle className="h-6 w-6 text-warning" />
                  ) : (
                    <Activity className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="font-medium capitalize">{service.replace('_', ' ')}</div>
                <Badge variant={status === 'healthy' ? 'default' : 'secondary'} className="mt-2">
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Usage Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usage Patterns
          </CardTitle>
          <CardDescription>Peak activity hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {systemConfig.peak_usage_hours?.map((hour: number) => (
              <Badge key={hour} variant="outline" className="text-primary">
                {hour}:00 - {hour + 1}:00
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            System typically experiences peak load during these hours. Consider scheduling heavy operations outside these times.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
