import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAgentActivity, useAgentMetrics } from "@/hooks/useAgentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, Clock, AlertCircle, CheckCircle2, XCircle, Search, Filter, Brain } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ProjectMemoryDashboard } from "@/components/admin/ProjectMemoryDashboard";

export default function AIAgentsDashboard() {
  const navigate = useNavigate();
  const [agentTypeFilter, setAgentTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: activity, isLoading } = useAgentActivity({
    agentType: agentTypeFilter || undefined,
    limit: 100,
  });
  
  const { data: metrics } = useAgentMetrics('week');

  const filteredActivity = activity?.filter(item => {
    if (!searchTerm) return true;
    return (
      item.agent_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.case_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalRequests = activity?.length || 0;
  const successfulRequests = activity?.filter(a => a.success).length || 0;
  const failedRequests = activity?.filter(a => !a.success).length || 0;
  const avgResponseTime = activity?.length
    ? Math.round(activity.reduce((sum, a) => sum + a.response_time_ms, 0) / activity.length)
    : 0;
  const totalTokens = activity?.reduce((sum, a) => sum + a.total_tokens, 0) || 0;

  const agentTypes = Array.from(new Set(activity?.map(a => a.agent_type) || []));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">AI Agents Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and system-wide intelligence for all AI agents
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span>Activity Log</span>
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <Brain className="h-4 w-4" />
              <span>System Intelligence</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {successfulRequests} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {failedRequests} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Per request
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last {activity?.length || 0} requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>View and filter all AI agent conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by agent type or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={agentTypeFilter} onValueChange={setAgentTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agents</SelectItem>
                  {agentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Type</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Tools</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">{item.agent_type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.case_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {item.success ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{item.total_tokens.toLocaleString()}</TableCell>
                      <TableCell>{item.response_time_ms}ms</TableCell>
                      <TableCell>
                        <span className="text-green-600">{item.tools_executed}</span>
                        {item.tools_failed > 0 && (
                          <span className="text-red-600 ml-1">/ {item.tools_failed} failed</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/case/${item.case_id}`)}
                        >
                          View Case
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="intelligence">
            <ProjectMemoryDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
