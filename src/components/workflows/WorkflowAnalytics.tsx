import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface WorkflowAnalyticsProps {
  workflowType?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export const WorkflowAnalytics = ({ 
  workflowType,
  timeRange = 'month' 
}: WorkflowAnalyticsProps) => {
  
  // Fetch workflow transitions for stage duration analysis
  const { data: transitions } = useQuery({
    queryKey: ['workflow-transitions', workflowType, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('workflow_stage_transitions')
        .select(`
          *,
          workflow_instances!inner(
            workflow_type,
            case_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (workflowType) {
        query = query.eq('workflow_instances.workflow_type', workflowType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch workflow instances for status breakdown
  const { data: instances } = useQuery({
    queryKey: ['workflow-instances-analytics', workflowType],
    queryFn: async () => {
      let query = supabase
        .from('workflow_instances')
        .select('*');

      if (workflowType) {
        query = query.eq('workflow_type', workflowType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Calculate average stage durations
  const stageDurations = transitions?.reduce((acc: any, t: any) => {
    if (!t.to_stage || !t.duration_seconds) return acc;
    
    if (!acc[t.to_stage]) {
      acc[t.to_stage] = { total: 0, count: 0, name: t.to_stage };
    }
    
    acc[t.to_stage].total += t.duration_seconds;
    acc[t.to_stage].count += 1;
    
    return acc;
  }, {});

  const avgStageDurationData = Object.values(stageDurations || {}).map((s: any) => ({
    name: s.name.replace(/_/g, ' '),
    hours: (s.total / s.count / 3600).toFixed(1),
  }));

  // Calculate status breakdown
  const statusBreakdown = instances?.reduce((acc: any, inst: any) => {
    const status = inst.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusBreakdown || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  // Calculate priority distribution
  const priorityBreakdown = instances?.reduce((acc: any, inst: any) => {
    const priority = inst.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = Object.entries(priorityBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate SLA compliance
  const slaStats = instances?.reduce((acc: any, inst: any) => {
    if (inst.status === 'completed') {
      acc.completed++;
      if (!inst.sla_violated) {
        acc.onTime++;
      }
    }
    if (inst.sla_violated) {
      acc.violated++;
    }
    return acc;
  }, { completed: 0, onTime: 0, violated: 0 });

  const slaComplianceRate = slaStats?.completed > 0 
    ? ((slaStats.onTime / slaStats.completed) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SLA Compliance Rate</CardDescription>
            <CardTitle className="text-4xl text-green-600">{slaComplianceRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {slaStats?.onTime || 0} of {slaStats?.completed || 0} completed on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SLA Violations</CardDescription>
            <CardTitle className="text-4xl text-red-600">{slaStats?.violated || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Active workflows past deadline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workflows</CardDescription>
            <CardTitle className="text-4xl">{instances?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across all stages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Average Stage Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Average Stage Duration</CardTitle>
            <CardDescription>Time spent in each stage (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgStageDurationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status Distribution</CardTitle>
            <CardDescription>Current state of all workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Workflow priority breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
