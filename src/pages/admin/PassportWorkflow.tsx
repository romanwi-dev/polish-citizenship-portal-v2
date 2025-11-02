import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { UnifiedWorkflowDashboard } from "@/components/workflows/UnifiedWorkflowDashboard";
import { WorkflowAnalytics } from "@/components/workflows/WorkflowAnalytics";
import { Plane, BarChart3, List } from "lucide-react";

const PassportWorkflow = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plane className="h-8 w-8" />
            Passport Application Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage Polish passport applications and appointments
          </p>
        </div>

        <WorkflowNavigation />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="gap-2">
              <List className="h-4 w-4" />
              Workflow Board
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <UnifiedWorkflowDashboard 
              workflowType="passport" 
              showAnalytics={true} 
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WorkflowAnalytics workflowType="passport" />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PassportWorkflow;
