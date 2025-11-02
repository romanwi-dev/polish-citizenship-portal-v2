import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { UnifiedWorkflowDashboard } from "@/components/workflows/UnifiedWorkflowDashboard";
import { WorkflowAnalytics } from "@/components/workflows/WorkflowAnalytics";
import { TranslationDashboard } from "@/components/translations/TranslationDashboard";
import { Languages, BarChart3, Settings } from "lucide-react";

const TranslationsWorkflow = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8" />
            Translation Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage document translation requests and certified translations
          </p>
        </div>

        <WorkflowNavigation />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="gap-2">
              <Languages className="h-4 w-4" />
              Workflow Board
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="management" className="gap-2">
              <Settings className="h-4 w-4" />
              Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <UnifiedWorkflowDashboard 
              workflowType="translations" 
              showAnalytics={true} 
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WorkflowAnalytics workflowType="translations" />
          </TabsContent>

          <TabsContent value="management" className="mt-6">
            <TranslationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TranslationsWorkflow;
