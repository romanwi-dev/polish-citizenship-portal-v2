import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, AlertCircle } from "lucide-react";
import { useState } from "react";
import { TranslationRequestCard } from "./TranslationRequestCard";
import { TranslationCostTracker } from "./TranslationCostTracker";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";

export const TranslationDashboardWorkflow = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: translationRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['translation-requests', statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from('translation_requests')
        .select(`
          *,
          documents (
            id,
            name,
            ai_generated_name,
            person_type,
            type,
            dropbox_path
          ),
          cases (
            id,
            client_name,
            client_code
          ),
          sworn_translators (
            id,
            full_name,
            email
          )
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: translators } = useQuery({
    queryKey: ['sworn-translators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sworn_translators')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['translation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translation_requests')
        .select('status, priority');
      if (error) throw error;

      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const assigned = data?.filter(r => r.status === 'assigned').length || 0;
      const inProgress = data?.filter(r => r.status === 'in_progress').length || 0;
      const completed = data?.filter(r => r.status === 'completed').length || 0;
      const urgent = data?.filter(r => r.priority === 'urgent' && r.status !== 'completed').length || 0;

      return { pending, assigned, inProgress, completed, urgent };
    }
  });

  const getStatusRequests = (status: string) => {
    return translationRequests?.filter(r => r.status === status) || [];
  };

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="w-8 h-8" />
            Translation Workflow Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage document translations and sworn translator assignments
          </p>
        </div>
      </div>

      <WorkflowNavigation />

      <TranslationCostTracker />

      {stats && stats.urgent > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Urgent Translation Requests</p>
                <p className="text-sm text-muted-foreground">
                  {stats.urgent} urgent request{stats.urgent !== 1 ? 's' : ''} require immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assigned || 0}</div>
            <p className="text-xs text-muted-foreground">Assigned to translators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">Being translated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
            <p className="text-xs text-muted-foreground">Translation done</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pending</h3>
                <Badge variant="secondary">{getStatusRequests('pending').length}</Badge>
              </div>
              <div className="space-y-3">
                {getStatusRequests('pending').map((request) => (
                  <TranslationRequestCard
                    key={request.id}
                    request={request}
                    translators={translators || []}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Assigned</h3>
                <Badge variant="secondary">{getStatusRequests('assigned').length}</Badge>
              </div>
              <div className="space-y-3">
                {getStatusRequests('assigned').map((request) => (
                  <TranslationRequestCard
                    key={request.id}
                    request={request}
                    translators={translators || []}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">In Progress</h3>
                <Badge variant="secondary">{getStatusRequests('in_progress').length}</Badge>
              </div>
              <div className="space-y-3">
                {getStatusRequests('in_progress').map((request) => (
                  <TranslationRequestCard
                    key={request.id}
                    request={request}
                    translators={translators || []}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Completed</h3>
                <Badge variant="secondary">{getStatusRequests('completed').length}</Badge>
              </div>
              <div className="space-y-3">
                {getStatusRequests('completed').map((request) => (
                  <TranslationRequestCard
                    key={request.id}
                    request={request}
                    translators={translators || []}
                  />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-3">
          {translationRequests && translationRequests.length > 0 ? (
            translationRequests.map((request) => (
              <TranslationRequestCard
                key={request.id}
                request={request}
                translators={translators || []}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No translation requests found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
