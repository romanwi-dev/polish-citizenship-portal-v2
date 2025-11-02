import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { UnifiedWorkflowDashboard } from "@/components/workflows/UnifiedWorkflowDashboard";
import { WorkflowAnalytics } from "@/components/workflows/WorkflowAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, List } from "lucide-react";

const AllWorkflows = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Unified view of all active workflows across the system
          </p>
        </div>

        <WorkflowNavigation />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="gap-2">
              <List className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <UnifiedWorkflowDashboard showAnalytics={true} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WorkflowAnalytics />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Activity</CardTitle>
                <CardDescription>
                  Latest transitions and updates across all workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Activity feed coming in Phase 4
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AllWorkflows;
